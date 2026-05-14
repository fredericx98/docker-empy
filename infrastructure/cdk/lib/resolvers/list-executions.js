import { util } from '@aws-appsync/utils'

export function request(ctx) {
  const { limit = 50, nextToken } = ctx.args
  return {
    operation:         'Query',
    index:             'byTime',
    query: {
      expression:       'pk = :pk',
      expressionValues: { ':pk': util.dynamodb.toDynamoDB('EXECUTION') },
    },
    limit,
    nextToken,
    scanIndexForward:  false,
  }
}

export function response(ctx) {
  if (ctx.error) util.error(ctx.error.message, ctx.error.type)
  return { items: ctx.result.items, nextToken: ctx.result.nextToken }
}
