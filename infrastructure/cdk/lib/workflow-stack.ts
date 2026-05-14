import * as cdk  from 'aws-cdk-lib'
import * as sfn  from 'aws-cdk-lib/aws-stepfunctions'
import { Construct } from 'constructs'

export class WorkflowStack extends cdk.Stack {
  readonly deployAsgSfn:      sfn.StateMachine
  readonly deployFrontsSfn:   sfn.StateMachine
  readonly imageBuilderSfn:   sfn.StateMachine
  readonly cfInvalidationSfn: sfn.StateMachine

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)

    this.deployAsgSfn      = this.waitSfn('DeployAsg',      30)
    this.deployFrontsSfn   = this.waitSfn('DeployFronts',   30)
    this.imageBuilderSfn   = this.waitSfn('ImageBuilder',   60)
    this.cfInvalidationSfn = this.waitSfn('CfInvalidation', 15)
  }

  private waitSfn(name: string, seconds: number): sfn.StateMachine {
    const wait    = new sfn.Wait(this, `Wait${name}`, {
      time: sfn.WaitTime.duration(cdk.Duration.seconds(seconds)),
    })
    const succeed = new sfn.Succeed(this, `Done${name}`)
    return new sfn.StateMachine(this, `${name}Sfn`, {
      stateMachineName: `bplaybet-${name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`,
      definitionBody:   sfn.DefinitionBody.fromChainable(wait.next(succeed)),
      tracingEnabled:   true,
    })
  }
}
