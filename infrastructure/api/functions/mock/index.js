'use strict';

/**
 * Smoke-test mock — simulates all Lambda + DynamoDB + Step Functions behavior in memory.
 * Handles REST routes, WS $connect/$disconnect, and the special /test-push endpoint.
 */

const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');

// Simulates what the real status Lambda would read from DynamoDB + Step Functions.
// image-builder is intentionally RUNNING so POST to it returns 409.
const MOCK_STATUS = {
  'asg-backend':     { status: 'IDLE',      executionArn: null,                                                    startedAt: null },
  'fronts':          { status: 'SUCCEEDED', executionArn: 'arn:aws:states:us-east-1:123456789012:execution:fronts:mock-1',          startedAt: '2026-05-12T09:00:00Z' },
  'image-builder':   { status: 'RUNNING',   executionArn: 'arn:aws:states:us-east-1:123456789012:execution:image-builder:mock-2',   startedAt: '2026-05-12T10:00:00Z' },
  'cf-invalidation': { status: 'FAILED',    executionArn: 'arn:aws:states:us-east-1:123456789012:execution:cf-invalidation:mock-3', startedAt: '2026-05-12T08:00:00Z' },
};

exports.handler = async (event) => {
  const routeKey = event.requestContext?.routeKey;

  // ── WebSocket routes ──────────────────────────────────────────────────────
  if (routeKey === '$connect')    return { statusCode: 200, body: 'Connected' };
  if (routeKey === '$disconnect') return { statusCode: 200, body: 'Disconnected' };

  // ── REST routes ───────────────────────────────────────────────────────────
  const method = event.httpMethod;
  const path   = event.path;
  const action = event.pathParameters?.action;
  const qs     = event.queryStringParameters || {};

  // POST /test-push?connectionId=XXX&action=asg-backend&status=SUCCEEDED
  // Simulates the EventBridge → notify-status → WS push without deploying EventBridge or SFN.
  if (method === 'POST' && path.endsWith('/test-push')) {
    const { connectionId, action: a = 'asg-backend', status = 'SUCCEEDED' } = qs;

    if (!connectionId) {
      return res(400, { error: 'missing connectionId query param' });
    }

    const mgmt = new ApiGatewayManagementApiClient({ endpoint: process.env.WS_ENDPOINT });

    try {
      await mgmt.send(new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify({
          type: 'status_update',
          action: a,
          status,
          executionArn: `arn:aws:states:us-east-1:123456789012:execution:${a}:mock-push`,
          startedAt: new Date(Date.now() - 30000).toISOString(),
          finishedAt: new Date().toISOString(),
        })),
      }));
      return res(200, { pushed: true, connectionId, action: a, status });
    } catch (err) {
      if (err.$metadata?.httpStatusCode === 410) {
        return res(410, { error: 'stale_connection', connectionId });
      }
      throw err;
    }
  }

  // GET /deploy/status — all actions
  if (method === 'GET' && path.endsWith('/deploy/status')) {
    return res(200, MOCK_STATUS);
  }

  // GET /deploy/status/{action}
  if (method === 'GET' && action) {
    if (!MOCK_STATUS[action]) return res(400, { error: 'unknown_action' });
    return res(200, { [action]: MOCK_STATUS[action] });
  }

  // POST /deploy/{action}
  if (method === 'POST' && action) {
    if (!MOCK_STATUS[action]) return res(400, { error: 'unknown_action' });
    if (MOCK_STATUS[action].status === 'RUNNING') {
      return res(409, {
        error: 'already_running',
        executionArn: MOCK_STATUS[action].executionArn,
        startedAt:    MOCK_STATUS[action].startedAt,
      });
    }
    return res(202, {
      executionArn: `arn:aws:states:us-east-1:123456789012:execution:${action}:${Date.now()}`,
      startedAt: new Date().toISOString(),
    });
  }

  return res(404, { error: 'not_found', path, method });
};

const res = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify(body),
});
