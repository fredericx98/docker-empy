'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;

  await ddb.send(new PutCommand({
    TableName: process.env.CONNECTIONS_TABLE,
    Item: {
      connectionId,
      connectedAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + 7200, // auto-expire after 2h
    },
  }));

  return { statusCode: 200, body: 'Connected' };
};
