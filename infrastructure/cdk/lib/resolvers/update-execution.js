import { util } from '@aws-appsync/utils'

export function request(ctx) {
  const { id, status, endedAt } = ctx.args
  return {
    operation: 'UpdateItem',
    key:       { executionId: util.dynamodb.toDynamoDB(id) },
    update: {
      expression:      'SET #s = :status, endedAt = :endedAt',
      expressionNames: { '#s': 'status' },
      expressionValues: {
        ':status':  util.dynamodb.toDynamoDB(status),
        ':endedAt': util.dynamodb.toDynamoDB(endedAt ?? util.time.nowISO8601()),
      },
    },
  }
}

export function response(ctx) {
  if (ctx.error) util.error(ctx.error.message, ctx.error.type)
  return ctx.result
}
