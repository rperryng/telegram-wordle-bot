import AWS from 'aws-sdk';

export const client = new AWS.DynamoDB.DocumentClient();
