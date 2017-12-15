'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

const allow_cidr = process.env.ALLOW_CIDR || 'x.x.x.x'
const dynamo_db = new AWS.DynamoDB.DocumentClient()
const table_name = process.env.DYNAMODB_TABLE

module.exports.create = (event, context, callback) => {
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
  if (typeof data.pattern !== 'string') {
    console.error('Validation Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t create the record item.',
    });
    return;
  }

  const params = {
    TableName: table_name,
    Item: {
      id: uuid.v1(),
      pattern: data.pattern,
      email: data.email,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  dynamo_db.put(params, (error) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create the record item.',
      });
      return;
    }

    const response = {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
};
