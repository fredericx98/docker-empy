import { util } from '@aws-appsync/utils'

export function request(ctx) {
  const { id, status, version } = ctx.args
  const expr = version
    ? 'SET #s = :status, version = :version, updatedAt = :now'
    : 'SET #s = :status, updatedAt = :now'

  return {
    operation: 'UpdateItem',
    key:       { frontId: util.dynamodb.toDynamoDB(id) },
    update: {
      expression:      expr,
      expressionNames: { '#s': 'status' },
      expressionValues: {
        ':status': util.dynamodb.toDynamoDB(status),
        ':now':    util.dynamodb.toDynamoDB(util.time.nowISO8601()),
        ...(version ? { ':version': util.dynamodb.toDynamoDB(version) } : {}),
      },
    },
  }
}

export function response(ctx) {
  if (ctx.error) util.error(ctx.error.message, ctx.error.type)
  return { ...ctx.result, id: ctx.result.frontId }
}
