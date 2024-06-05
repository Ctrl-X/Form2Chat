#!/usr/bin/env node
import "source-map-support/register"
import cdk = require("aws-cdk-lib")
import { Form2ChatStack } from "../lib/form2_chat-stack"

export const lambdaFunctionName = "FormToLlmChatFunction"

const app = new cdk.App()
new Form2ChatStack(app, "Form2ChatStack", {
    functionName: lambdaFunctionName,
})
