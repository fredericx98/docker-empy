export const ON_FRONT_STATUS_CHANGED = /* GraphQL */`
  subscription OnFrontStatusChanged($id: ID) {
    onFrontStatusChanged(id: $id) {
      id name status version lastDeployedAt lastInvalidationAt
    }
  }
`

export const ON_EXECUTION_UPDATED = /* GraphQL */`
  subscription OnExecutionUpdated($id: ID) {
    onExecutionUpdated(id: $id) {
      id type target status triggeredBy startedAt endedAt
    }
  }
`
