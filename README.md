job-email-service
=================

Provide service to determine which jobs (pattern) should receive emails.


implementation
--------------

Written in NodeJS (es6), managed by Serverless and deployed on AWS Lambda/DynamoDB.


limitations
-----------

Currently no server-side validation which means duplications are allowed.
