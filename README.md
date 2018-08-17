ApiGateway Integrated with Cognito and Lambda
====================

In ths lab:


* Long term solution for migrate your legacy application to serverless

	* Migrating Java Application to micro-service running on EKS

	* Moving some features to serveless lambda function

	* Dispatch portion ApiGateway path to serverless lamda function

	* Demo Sign-up and Sign-in api path from Amazon Cognito in new serveless architecture to work with legacy application

- - -

Prerequisites
====================

Readers are assumed to have your own [AWS EKS Cluster](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html) and at least one node runs on it (The node should have a public IP). A PostgreSQL RDS that can be accessible by node is also required in this tutorial.

Also, correct installation and confiuration of [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html) is required locally before we start this tutorial.
- - -

# Containerized Application

### Deploy server in pods

```bash
kubectl run sample --image=leyi/server_sample:latest --env="DB_URL=${url}:${port}/${db_name}" --env="DB_USERNAME=${username}" --env="DB_PASSWORD=${password}"
```

### Expose the service to NodePort

```bash
kubectl expose deployment sample --name=sample --port=80 --target-port=8080 --type=NodePort
```

### Get the corresponding NodePort
```bash
kubectl get service sample
```
Then you can access the **http://${PublicIP}:${NodePort}/api/cars** via [Postman](https://www.getpostman.com/) or **curl** command, in GET method and POST method.

A POST method body sample is like:

```json
 {
 	"brand":"acura",
 	"model": "XE"
 }
```

# Develop and test Lambda function locally (Optional)

Now, a new feature, for example a public IP query, needs to be added into the existing server. It can be done by lambda function.

Please install [SAM](https://github.com/awslabs/aws-sam-cli) and work under the **./lambda/** directory. The sam local tool will work on [template.yml](https://raw.githubusercontent.com/overtureLLC/AWS_Lab_ApiGateway_Cognito_Lambda/master/lambda/template.yaml) in current directory.

You can start api locally on http://127.0.0.1:3000/ with following command, which has already been integrted with lambda function.
```bash
sam local start-api
```
In this simple case, the api returns visitors' IP address.

# Integrate ApiGateway and Lambda function with Cloudformation

1. Deploy the [ApiGateway_Lambda.yaml](https://raw.githubusercontent.com/overtureLLC/AWS_Lab_ApiGateway_Cognito_Lambda/master/cloudformation/ApiGateway_Lambda.yaml) file in cloudformation folder with AWS CloudFormation. An Invoke URL will be found in Outputs Part, which will trigger lambda function and return visitors' current IP address.
2. Please follow these steps to leverage Cognito as sign-up and sign-in tools with ApiGateway

### Add AWS Cognito as authorizor

Update current Cloudformation Template with [ApiGateway_Lambda_Cognito.yaml](https://raw.githubusercontent.com/overtureLLC/AWS_Lab_ApiGateway_Cognito_Lambda/master/cloudformation/ApiGateway_Lambda_Cognito.yaml), In **Parameters** part, fill out your email address, the prefix of domain you want to use, and the callback URL after sign-in.

After the cloudformation is updated, please try refreshing the URL and you will get an unauthorized error message.

### Set up Mocking Frontend Page to Login In

run folloing command 
```bash
curl -o Login.zip https://s3.amazonaws.com/ascending-devops/cognito/Login.zip && mkdir Login && unzip Login.zip -d ./Login
```

Change directory to ./Login, then install [nvm](https://github.com/creationix/nvm). Run

```bash
nvm install 10 && nvm use --delete-prefix v10.8.0
```

All set! We have a simple frontend page now, therefore we can mock the sign-in process.

### Implement Cognito as authorizor tool of ApiGateway

Fill the config.js in ./Login/ with output information from Cloudformation. For the first login, a new password will be reuqired in NewPassword field. If everything is set correctly, you will be able to successfully log in and get a JWT.

Run this command to implement the JWT and you will get a correct response. 

```bash
node TokenGenerator.js
```

Please replace ${JWT} and ${InvokeURL} with proper value.
```bash
curl -H "Authorization: ${JWT}" -X GET ${InvokeURL}
```

Try this command without JWT and you will get unauthorization message, which indicates the cognito works well as an authorizor method.
```bash
curl -X GET ${InvokeURL}
```