
env := missing
profile := sms-dev
region := us-west-2
stage := v1
allow_cidr := x.x.x.x

AWS_PARAMS=AWS_PROFILE=$(profile) AWS_DEFAULT_REGION=${region}

# dev
local-invoke:
	${AWS_PARAMS} DYNAMODB_TABLE=${table_name} ./node_modules/.bin/lambda-local -t 20 -f $(function_file)

# production

deploy:
	${AWS_PARAMS} ALLOW_CIDR="$(allow_cidr)" ENV=${env} ./node_modules/.bin/serverless deploy --stage ${stage}

invoke:
	${AWS_PARAMS} ENV=${env} ./node_modules/.bin/serverless invoke --stage ${stage} -f email

remove:
	${AWS_PARAMS} ENV=${env} ./node_modules/.bin/serverless remove --stage ${stage}
