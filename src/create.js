'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const allowCidr = process.env.ALLOW_CIDR || 'x.x.x.x'

module.exports.create = (event, context, callback) => {
  var found = false;

  allowCidr.split(' ').forEach(function(allow_mask) {
    if(event['requestContext']['identity']['sourceIp'].includes(allow_mask)) {
      found = true
    }
  });

  if(!found) {
    console.error('Requestor not in allow list')

    callback(null, {
      statusCode: 403,
      headers: { 'Content-Type': 'text/plain' },
      body: '¯\\_(ツ)_/¯',
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
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      pattern: data.pattern,
      email: data.email,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  dynamoDb.put(params, (error) => {
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
