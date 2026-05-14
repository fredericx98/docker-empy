import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { SFNClient, StartExecutionCommand, ListExecutionsCommand } from '@aws-sdk/client-sfn'
import { randomUUID } from 'crypto'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const sfn = new SFNClient({})

const SFN_ARN: Record<string, string | undefined> = {
  DEPLOY_COMPLETO:  process.env.DEPLOY_ASG_SFN,
  DEPLOY_FRONT:     process.env.DEPLOY_FRONTS_SFN,
  BUILD_AMI:        process.env.IMAGE_BUILDER_SFN,
  CF_INVALIDACION:  process.env.CF_INVALIDATION_SFN,
  MANTENIMIENTO:    undefined,
}

export const handler = async (event: {
  arguments: { input: { type: string; target: string; triggeredBy?: string } }
}) => {
  const { type, target, triggeredBy } = event.arguments.input
  const sfnArn = SFN_ARN[type]

  if (sfnArn) {
    const running = await sfn.send(new ListExecutionsCommand({
      stateMachineArn: sfnArn,
      statusFilter:    'RUNNING',
      maxResults:      1,
    }))
    if (running.executions?.length) {
      throw new Error(`Ya hay una ejecución en curso para ${type}`)
    }
  }

  const executionId = randomUUID()
  const now = new Date().toISOString()
  let sfnExecutionArn: string | undefined

  if (sfnArn) {
    const result = await sfn.send(new StartExecutionCommand({
      stateMachineArn: sfnArn,
      name:            executionId,
      input:           JSON.stringify({ type, target, triggeredBy, executionId }),
    }))
    sfnExecutionArn = result.executionArn
  }

  const item = {
    executionId,
    pk:          'EXECUTION',
    id:          executionId,
    type,
    target,
    status:      sfnArn ? 'RUNNING' : 'SUCCEEDED',
    triggeredBy: triggeredBy ?? 'sistema',
    startedAt:   now,
    endedAt:     sfnArn ? undefined : now,
    sfnArn:      sfnExecutionArn,
  }

  await ddb.send(new PutCommand({
    TableName: process.env.EXECUTIONS_TABLE!,
    Item:      item,
  }))

  return item
}
