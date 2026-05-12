'use strict';

const { SFNClient, StartExecutionCommand, ListExecutionsCommand } = require('@aws-sdk/client-sfn');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const sfn = new SFNClient({});
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Maps action names to their Step Functions ARNs.
// Add new actions here as new state machines are created.
const ACTION_SFN_MAP = {
  'asg-backend':     process.env.ASG_BACKEND_SFN_ARN,
  'fronts':          process.env.FRONTS_SFN_ARN,
  'image-builder':   process.env.IMAGE_BUILDER_SFN_ARN,
  'cf-invalidation': process.env.CF_INVALIDATION_SFN_ARN,
};

exports.handler = async (event) => {
  const action = event.pathParameters?.action;
  const sfnArn = ACTION_SFN_MAP[action];

  if (!sfnArn) {
    return res(400, { error: 'unknown_action', message: `Unknown action: ${action}` });
  }

  // Block concurrent executions at the API level before hitting Step Functions.
  // The SFN itself also enforces this, but early rejection gives a cleaner response.
  const { executions: running } = await sfn.send(new ListExecutionsCommand({
    stateMachineArn: sfnArn,
    statusFilter: 'RUNNING',
    maxResults: 1,
  }));

  if (running.length > 0) {
    return res(409, {
      error: 'already_running',
      executionArn: running[0].executionArn,
      startedAt: running[0].startDate.toISOString(),
    });
  }

  // X-Triggered-By is set by the frontend.
  // Today it's 'anonymous'; once Azure AD is integrated the frontend sends the user email.
  const triggeredBy = event.headers?.['x-triggered-by']
    || event.headers?.['X-Triggered-By']
    || 'anonymous';
  const triggeredAt = new Date().toISOString();

  const { executionArn } = await sfn.send(new StartExecutionCommand({
    stateMachineArn: sfnArn,
    name: `${action}-${Date.now()}`,
    input: JSON.stringify({ action, triggeredBy, triggeredAt }),
  }));

  await ddb.send(new PutCommand({
    TableName: process.env.AUDIT_TABLE,
    Item: { action, triggeredAt, triggeredBy, executionArn, source: 'dashboard' },
  }));

  return res(202, { executionArn, startedAt: triggeredAt });
};

const res = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify(body),
});
