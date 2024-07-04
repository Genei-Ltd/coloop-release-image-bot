import app from './app'
import {createLambdaFunction, createProbot} from "@probot/adapter-aws-lambda-serverless";
module.exports.handler = createLambdaFunction(app, {
  probot: createProbot(),
});