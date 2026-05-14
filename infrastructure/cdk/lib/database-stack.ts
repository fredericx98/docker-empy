import * as cdk      from 'aws-cdk-lib'
import * as dynamodb  from 'aws-cdk-lib/aws-dynamodb'
import { Construct }  from 'constructs'

export class DatabaseStack extends cdk.Stack {
  readonly frontsTable:     dynamodb.Table
  readonly executionsTable: dynamodb.Table
  readonly infraTable:      dynamodb.Table

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)

    this.frontsTable = new dynamodb.Table(this, 'FrontsTable', {
      tableName:          'bplaybet-fronts',
      partitionKey:       { name: 'frontId', type: dynamodb.AttributeType.STRING },
      billingMode:        dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy:      cdk.RemovalPolicy.RETAIN,
    })

    // PK=executionId, GSI for time-sorted list and type/status filtering
    this.executionsTable = new dynamodb.Table(this, 'ExecutionsTable', {
      tableName:          'bplaybet-executions',
      partitionKey:       { name: 'executionId', type: dynamodb.AttributeType.STRING },
      billingMode:        dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy:      cdk.RemovalPolicy.RETAIN,
    })
    // List all by time: pk="EXECUTION", sk=startedAt
    this.executionsTable.addGlobalSecondaryIndex({
      indexName:     'byTime',
      partitionKey:  { name: 'pk',        type: dynamodb.AttributeType.STRING },
      sortKey:       { name: 'startedAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    })
    // Filter by type
    this.executionsTable.addGlobalSecondaryIndex({
      indexName:     'byType',
      partitionKey:  { name: 'type',      type: dynamodb.AttributeType.STRING },
      sortKey:       { name: 'startedAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    })
    // Filter by status (find RUNNING executions quickly)
    this.executionsTable.addGlobalSecondaryIndex({
      indexName:     'byStatus',
      partitionKey:  { name: 'status',    type: dynamodb.AttributeType.STRING },
      sortKey:       { name: 'startedAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    })

    this.infraTable = new dynamodb.Table(this, 'InfraTable', {
      tableName:     'bplaybet-infra',
      partitionKey:  { name: 'resource', type: dynamodb.AttributeType.STRING },
      billingMode:   dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })
  }
}
