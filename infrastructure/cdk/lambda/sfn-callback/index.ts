import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { SignatureV4 } from '@smithy/signature-v4'
import { HttpRequest } from '@smithy/protocol-http'
import { Sha256 } from '@aws-crypto/sha256-js'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const MUTATION = `
  mutation UpdateExecution($id: ID!, $status: ExecutionStatus!, $endedAt: AWSDateTime) {
    _updateExecution(id: $id, status: $status, endedAt: $endedAt) {
      id type target status endedAt
    }
  }
`

export const handler = async (event: {
  detail: { executionArn: string; status: string; stopDate?: string }
}) => {
  const { executionArn, status, stopDate } = event.detail
  const executionId = executionArn.split(':').pop()!
  const endedAt     = stopDate ?? new Date().toISOString()
  const execStatus  = status === 'SUCCEEDED' ? 'SUCCEEDED'
    : status === 'FAILED'  ? 'FAILED'
    : 'ABORTED'

  await ddb.send(new UpdateCommand({
    TableName:                 process.env.EXECUTIONS_TABLE!,
    Key:                       { executionId },
    UpdateExpression:          'SET #s = :status, endedAt = :endedAt',
    ExpressionAttributeNames:  { '#s': 'status' },
    ExpressionAttributeValues: { ':status': execStatus, ':endedAt': endedAt },
  }))

  await notifyAppsync(executionId, execStatus, endedAt)
}

async function notifyAppsync(id: string, status: string, endedAt: string) {
  const url    = process.env.APPSYNC_URL!
  const region = process.env.AWS_REGION ?? 'us-east-1'
  const body   = JSON.stringify({ query: MUTATION, variables: { id, status, endedAt } })

  const parsed = new URL(url)
  const req    = new HttpRequest({
    method:   'POST',
    hostname: parsed.hostname,
    path:     parsed.pathname,
    headers:  { 'Content-Type': 'application/json', host: parsed.hostname },
    body,
  })

  const signer = new SignatureV4({
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      sessionToken:    process.env.AWS_SESSION_TOKEN,
    },
    region,
    service: 'appsync',
    sha256:  Sha256,
  })

  const signed = await signer.sign(req)
  await fetch(url, { method: 'POST', headers: signed.headers as Record<string, string>, body })
}
