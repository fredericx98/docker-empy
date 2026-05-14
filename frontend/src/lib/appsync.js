import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/api'

export function configureAmplify() {
  const url    = import.meta.env.VITE_APPSYNC_URL
  const apiKey = import.meta.env.VITE_APPSYNC_API_KEY
  const region = import.meta.env.VITE_AWS_REGION ?? 'us-east-1'

  if (!url || !apiKey) return  // mock mode: no config needed

  Amplify.configure({
    API: {
      GraphQL: {
        endpoint:        url,
        region,
        defaultAuthMode: 'apiKey',
        apiKey,
      },
    },
  })
}

export const client = generateClient()
