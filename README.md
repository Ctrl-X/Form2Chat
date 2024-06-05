# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template


cdk synth --no-staging > template.yaml

sam local start-api --warm-containers EAGER

http://127.0.0.1:3000

Error: Running AWS SAM projects locally requires Docker. Have you got it installed and running?
soluce  
export DOCKER_HOST=unix://$HOME/.docker/run/docker.sock

