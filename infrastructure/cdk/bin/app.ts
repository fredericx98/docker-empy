import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { DatabaseStack }  from '../lib/database-stack'
import { WorkflowStack }  from '../lib/workflow-stack'
import { ApiStack }       from '../lib/api-stack'

const app = new cdk.App()
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' }

const db        = new DatabaseStack(app,  'BPlayBetDatabase',  { env })
const workflows = new WorkflowStack(app,  'BPlayBetWorkflows', { env })
const _api      = new ApiStack(app, 'BPlayBetApi', {
  env,
  frontsTable:      db.frontsTable,
  executionsTable:  db.executionsTable,
  infraTable:       db.infraTable,
  deployAsgSfn:     workflows.deployAsgSfn,
  deployFrontsSfn:  workflows.deployFrontsSfn,
  imageBuilderSfn:  workflows.imageBuilderSfn,
  cfInvalidationSfn: workflows.cfInvalidationSfn,
})
