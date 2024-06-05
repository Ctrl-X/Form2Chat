import { Cors, LambdaIntegration, MethodLoggingLevel, RestApi } from "aws-cdk-lib/aws-apigateway"
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam"
import { Function, Runtime, AssetCode, Code } from "aws-cdk-lib/aws-lambda"
import { Duration, SecretValue, Stack, StackProps } from "aws-cdk-lib"
import { Construct } from "constructs"


interface LambdaApiStackProps extends StackProps {
  functionName: string
}

export class Form2ChatStack extends Stack {
  private restApi: RestApi
  private lambdaFunction: Function

  constructor(scope: Construct, id: string, props: LambdaApiStackProps) {
    super(scope, id, props)


    this.restApi = new RestApi(this, this.stackName + "RestApi", {
      deployOptions: {
        stageName: "beta",
        metricsEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS, // Replace with your allowed origins
        allowMethods: Cors.ALL_METHODS, // Replace with your allowed HTTP methods
        allowHeaders: ["*"], // Replace with any allowed headers
      },
    })

    const lambdaPolicy = new PolicyStatement()
    // Permission to call bedrock models
    lambdaPolicy.addActions("bedrock:InvokeModel")
    lambdaPolicy.addResources(
        `arn:aws:bedrock:*::foundation-model/*`,
    )


    // modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    // modelId: "anthropic.claude-3-sonnet-20240229-v1:0",

    this.lambdaFunction = new Function(this, props.functionName, {
      functionName: props.functionName,
      handler: "handler.handler",
      runtime: Runtime.NODEJS_18_X,
      code: new AssetCode(`./src`),
      memorySize: 512,
      timeout: Duration.seconds(300),
      environment: {
        MODEL_ID: "anthropic.claude-3-sonnet-20240229-v1:0",
      },
    })

    this.lambdaFunction.addToRolePolicy(lambdaPolicy)
    this.restApi.root.addMethod("POST", new LambdaIntegration(this.lambdaFunction, {}))
  }
}
