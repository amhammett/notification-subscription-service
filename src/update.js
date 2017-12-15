'use strict';

const AWS = require('aws-sdk');

const allow_cidr = process.env.ALLOW_CIDR || 'x.x.x.x'
const dynamo_db = new AWS.DynamoDB.DocumentClient()
const table_name = process.env.DYNAMODB_TABLE

module.exports.update = (event, context, callback) => {
  var found = false;
  var sourceIP = event['requestContext']
    && event['requestContext']['identity']['sourceIp'] || 'local'

  allow_cidr.split(' ').forEach(function(allow_mask) {
    if(sourceIP.includes(allow_mask)) {
      found = true
    }
  });

  if (!found && sourceIP !== 'local') {
    console.error('Requestor not in allow list')

    callback(null, {
      statusCode: 403,
      headers: { 'Content-Type': 'text/plain' },
      body: '¯\\_(ツ)_/¯'+sourceIP,
    });
    return;
  }

  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  if (typeof data.pattern !== 'string' || typeof data.email !== 'string') {
    console.error('Validation Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t update the record item.',
    });
    return;
  }

  const params = {
    TableName: table_name,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeNames: {
      '#p': 'pattern',
    },
    ExpressionAttributeValues: {
      ':pattern': data.pattern,
      ':email': data.email,
      ':updatedAt': timestamp,
    },
    UpdateExpression:
      'SET #p = :pattern, email = :email, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW',
  };

  dynamo_db.update(params, (error, result) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the record item.',
      });
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
  });
};
