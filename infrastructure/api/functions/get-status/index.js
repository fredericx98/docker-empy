'use strict';

const { SFNClient, ListExecutionsCommand } = require('@aws-sdk/client-sfn');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const sfn = new SFNClient({});
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '60', 10);

const ACTION_SFN_MAP = {
  'asg-backend':     process.env.ASG_BACKEND_SFN_ARN,
  'fronts':          process.env.FRONTS_SFN_ARN,
  'image-builder':   process.env.IMAGE_BUILDER_SFN_ARN,
  'cf-invalidation': process.env.CF_INVALIDATION_SFN_ARN,
};

exports.handler = async (event) => {
  const action = event.pathParameters?.action;

  if (action) {
    if (!ACTION_SFN_MAP[action]) {
      return res(400, { error: 'unknown_action', message: `Unknown action: ${action}` });
    }
    return res(200, { [action]: await getStatus(action) });
  }

  // All actions in parallel — single request on dashboard mount
  const entries = await Promise.all(
    Object.keys(ACTION_SFN_MAP).map(async (a) => [a, await getStatus(a)])
  );
  return res(200, Object.fromEntries(entries));
};

async function getStatus(action) {
  const now = Math.floor(Date.now() / 1000);

  // Return cached value if still fresh
  const { Item } = await ddb.send(new GetCommand({
    TableName: process.env.CACHE_TABLE,
    Key: { action },
  }));
  if (Item && Item.ttl > now) {
    return { ...Item.data, fromCache: true };
  }

  // Cache miss — query Step Functions directly
  const sfnArn = ACTION_SFN_MAP[action];

  const { executions: running } = await sfn.send(new ListExecutionsCommand({
    stateMachineArn: sfnArn,
    statusFilter: 'RUNNING',
    maxResults: 1,
  }));

  let data;
  if (running.length > 0) {
    data = {
      status: 'RUNNING',
      executionArn: running[0].executionArn,
      startedAt: running[0].startDate.toISOString(),
    };
  } else {
    // No active execution — get the last completed one for context
    const { executions: recent } = await sfn.send(new ListExecutionsCommand({
      stateMachineArn: sfnArn,
      maxResults: 1,
    }));
    data = recent.length > 0
      ? {
          status: recent[0].status,          // SUCCEEDED | FAILED | TIMED_OUT | ABORTED
          executionArn: recent[0].executionArn,
          startedAt: recent[0].startDate.toISOString(),
        }
      : { status: 'IDLE', executionArn: null, startedAt: null };
  }

  // Refresh cache
  await ddb.send(new PutCommand({
    TableName: process.env.CACHE_TABLE,
    Item: { action, data, ttl: now + CACHE_TTL },
  }));

  return { ...data, fromCache: false };
}

const res = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify(body),
});
