'use strict';

const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Reverse map: SFN ARN → action name, so the frontend doesn't need to know ARNs.
const SFN_ACTION_MAP = {
  [process.env.ASG_BACKEND_SFN_ARN]:     'asg-backend',
  [process.env.FRONTS_SFN_ARN]:          'fronts',
  [process.env.IMAGE_BUILDER_SFN_ARN]:   'image-builder',
  [process.env.CF_INVALIDATION_SFN_ARN]: 'cf-invalidation',
};

exports.handler = async (event) => {
  const { stateMachineArn, status, executionArn, startDate, stopDate } = event.detail;
  const action = SFN_ACTION_MAP[stateMachineArn];

  if (!action) return; // execution from an unmanaged state machine — ignore

  const mgmt = new ApiGatewayManagementApiClient({ endpoint: process.env.WS_ENDPOINT });

  const message = Buffer.from(JSON.stringify({
    type: 'status_update',
    action,
    status,           // SUCCEEDED | FAILED | TIMED_OUT | ABORTED
    executionArn,
    startedAt: startDate,
    finishedAt: stopDate,
  }));

  const { Items: connections = [] } = await ddb.send(new ScanCommand({
    TableName: process.env.CONNECTIONS_TABLE,
  }));

  // Push to every connected client. 410 means the connection is gone — clean it up.
  await Promise.allSettled(
    connections.map(async ({ connectionId }) => {
      try {
        await mgmt.send(new PostToConnectionCommand({ ConnectionId: connectionId, Data: message }));
      } catch (err) {
        if (err.$metadata?.httpStatusCode === 410) {
          await ddb.send(new DeleteCommand({
            TableName: process.env.CONNECTIONS_TABLE,
            Key: { connectionId },
          }));
        }
      }
    })
  );
};
