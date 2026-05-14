import * as cdk        from 'aws-cdk-lib'
import * as appsync    from 'aws-cdk-lib/aws-appsync'
import * as dynamodb   from 'aws-cdk-lib/aws-dynamodb'
import * as lambda     from 'aws-cdk-lib/aws-lambda'
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs'
import * as sfn        from 'aws-cdk-lib/aws-stepfunctions'
import * as events     from 'aws-cdk-lib/aws-events'
import * as targets    from 'aws-cdk-lib/aws-events-targets'
import { Construct }   from 'constructs'
import * as path       from 'path'

interface ApiStackProps extends cdk.StackProps {
  frontsTable:       dynamodb.Table
  executionsTable:   dynamodb.Table
  infraTable:        dynamodb.Table
  deployAsgSfn:      sfn.StateMachine
  deployFrontsSfn:   sfn.StateMachine
  imageBuilderSfn:   sfn.StateMachine
  cfInvalidationSfn: sfn.StateMachine
}

export class ApiStack extends cdk.Stack {
  readonly api: appsync.GraphqlApi

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props)

    // ── GraphQL API ────────────────────────────────────────────────────────────
    this.api = new appsync.GraphqlApi(this, 'Api', {
      name:   'bplaybet-api',
      schema: appsync.SchemaFile.fromAsset(
        path.join(__dirname, '../schema/schema.graphql'),
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: { expires: cdk.Expiration.after(cdk.Duration.days(365)) },
        },
        additionalAuthorizationModes: [
          { authorizationType: appsync.AuthorizationType.IAM },
        ],
      },
      xrayEnabled: true,
      logConfig: {
        fieldLogLevel:         appsync.FieldLogLevel.ERROR,
        excludeVerboseContent: true,
      },
    })

    // ── Data sources ───────────────────────────────────────────────────────────
    const frontsDs     = this.api.addDynamoDbDataSource('FrontsDS',     props.frontsTable)
    const executionsDs = this.api.addDynamoDbDataSource('ExecutionsDS', props.executionsTable)
    const infraDs      = this.api.addDynamoDbDataSource('InfraDS',      props.infraTable)

    // ── trigger-deploy Lambda ──────────────────────────────────────────────────
    const triggerFn = new lambdaNode.NodejsFunction(this, 'TriggerDeployFn', {
      entry:        path.join(__dirname, '../lambda/trigger-deploy/index.ts'),
      handler:      'handler',
      runtime:      lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      timeout:      cdk.Duration.seconds(29),
      bundling:     { minify: true, sourceMap: false },
      environment: {
        EXECUTIONS_TABLE:     props.executionsTable.tableName,
        DEPLOY_ASG_SFN:       props.deployAsgSfn.stateMachineArn,
        DEPLOY_FRONTS_SFN:    props.deployFrontsSfn.stateMachineArn,
        IMAGE_BUILDER_SFN:    props.imageBuilderSfn.stateMachineArn,
        CF_INVALIDATION_SFN:  props.cfInvalidationSfn.stateMachineArn,
        APPSYNC_URL:          this.api.graphqlUrl,
      },
    })
    props.executionsTable.grantReadWriteData(triggerFn)
    props.deployAsgSfn.grantStartExecution(triggerFn)
    props.deployFrontsSfn.grantStartExecution(triggerFn)
    props.imageBuilderSfn.grantStartExecution(triggerFn)
    props.cfInvalidationSfn.grantStartExecution(triggerFn)
    this.api.grantMutation(triggerFn, '_updateExecution')

    // ── sfn-callback Lambda ────────────────────────────────────────────────────
    const callbackFn = new lambdaNode.NodejsFunction(this, 'SfnCallbackFn', {
      entry:        path.join(__dirname, '../lambda/sfn-callback/index.ts'),
      handler:      'handler',
      runtime:      lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      timeout:      cdk.Duration.seconds(29),
      bundling:     { minify: true, sourceMap: false },
      environment: {
        EXECUTIONS_TABLE: props.executionsTable.tableName,
        APPSYNC_URL:      this.api.graphqlUrl,
      },
    })
    props.executionsTable.grantReadWriteData(callbackFn)
    this.api.grantMutation(callbackFn, '_updateExecution')

    // EventBridge: SFN terminal state → callbackFn
    new events.Rule(this, 'SfnStateChangeRule', {
      eventPattern: {
        source:     ['aws.states'],
        detailType: ['Step Functions Execution Status Change'],
        detail: {
          status: ['SUCCEEDED', 'FAILED', 'TIMED_OUT', 'ABORTED'],
          stateMachineArn: [
            props.deployAsgSfn.stateMachineArn,
            props.deployFrontsSfn.stateMachineArn,
            props.imageBuilderSfn.stateMachineArn,
            props.cfInvalidationSfn.stateMachineArn,
          ],
        },
      },
      targets: [new targets.LambdaFunction(callbackFn)],
    })

    // ── AppSync resolvers ──────────────────────────────────────────────────────
    const triggerDs = this.api.addLambdaDataSource('TriggerDeployDS', triggerFn)
    this.addResolvers(frontsDs, executionsDs, infraDs, triggerDs)

    // ── Outputs ────────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'GraphqlUrl', { value: this.api.graphqlUrl, exportName: 'BPlayBetGraphqlUrl' })
    new cdk.CfnOutput(this, 'ApiKey',     { value: this.api.apiKey ?? '',  exportName: 'BPlayBetApiKey' })
  }

  private res(id: string, file: string) {
    return appsync.Code.fromAsset(
      path.join(__dirname, 'resolvers', file),
    )
  }

  private addResolvers(
    frontsDs:     appsync.DynamoDbDataSource,
    executionsDs: appsync.DynamoDbDataSource,
    infraDs:      appsync.DynamoDbDataSource,
    triggerDs:    appsync.LambdaDataSource,
  ) {
    const JS = appsync.FunctionRuntime.JS_1_0_0

    frontsDs.createResolver('ListFronts',      { typeName: 'Query',    fieldName: 'listFronts',        runtime: JS, code: this.res('lf',  'list-fronts.js')      })
    executionsDs.createResolver('ListExec',    { typeName: 'Query',    fieldName: 'listExecutions',    runtime: JS, code: this.res('le',  'list-executions.js')   })
    executionsDs.createResolver('GetExec',     { typeName: 'Query',    fieldName: 'getExecution',      runtime: JS, code: this.res('ge',  'get-execution.js')     })
    infraDs.createResolver('GetInfra',         { typeName: 'Query',    fieldName: 'getInfra',          runtime: JS, code: this.res('gi',  'get-infra.js')         })
    triggerDs.createResolver('TriggerDeploy',  { typeName: 'Mutation', fieldName: 'triggerDeploy',     runtime: JS, code: this.res('td',  'trigger-deploy-passthrough.js') })
    frontsDs.createResolver('UpdateFront',     { typeName: 'Mutation', fieldName: 'updateFrontStatus', runtime: JS, code: this.res('uf',  'update-front-status.js') })
    executionsDs.createResolver('UpdateExec',  { typeName: 'Mutation', fieldName: '_updateExecution',  runtime: JS, code: this.res('ue',  'update-execution.js')  })
  }
}
