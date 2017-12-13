
env := missing
profile := sms-dev
region := us-west-2
stage := v1

deploy:
	AWS_PROFILE=$(profile) AWS_DEFAULT_REGION=${region} ENV=${env} ./node_modules/.bin/serverless deploy --stage ${stage}

invoke:
	AWS_PROFILE=$(profile) AWS_DEFAULT_REGION=${region} ENV=${env} ./node_modules/.bin/serverless invoke --stage ${stage} -f email

remove:
	AWS_PROFILE=$(profile) AWS_DEFAULT_REGION=${region} ENV=${env} ./node_modules/.bin/serverless remove --stage ${stage}
