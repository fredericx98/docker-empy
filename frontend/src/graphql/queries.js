export const LIST_FRONTS = /* GraphQL */`
  query ListFronts {
    listFronts {
      id name status version lastDeployedAt lastInvalidationAt
    }
  }
`

export const LIST_EXECUTIONS = /* GraphQL */`
  query ListExecutions($limit: Int, $nextToken: String) {
    listExecutions(limit: $limit, nextToken: $nextToken) {
      items {
        id type target status triggeredBy startedAt endedAt
      }
      nextToken
    }
  }
`

export const GET_EXECUTION = /* GraphQL */`
  query GetExecution($id: ID!) {
    getExecution(id: $id) {
      id type target status triggeredBy startedAt endedAt sfnArn
    }
  }
`

export const GET_INFRA = /* GraphQL */`
  query GetInfra {
    getInfra { resource data }
  }
`
