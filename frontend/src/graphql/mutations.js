export const TRIGGER_DEPLOY = /* GraphQL */`
  mutation TriggerDeploy($input: TriggerDeployInput!) {
    triggerDeploy(input: $input) {
      id type target status triggeredBy startedAt
    }
  }
`

export const UPDATE_FRONT_STATUS = /* GraphQL */`
  mutation UpdateFrontStatus($id: ID!, $status: FrontStatus!, $version: String) {
    updateFrontStatus(id: $id, status: $status, version: $version) {
      id name status version lastDeployedAt lastInvalidationAt
    }
  }
`
