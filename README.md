ApiGateway Integrated with Cognito and Lambda
====================

In ths lab:


* Migrate your containerized application to serverless

	* Micro-Service Java Application running on EKS

	* Develop your own lambda function

	* Integration of ApiGateway and Lambda function

	* Amazon Cognito: Sing-up and Sign-in

- - -

Prerequisites
====================

Readers are assumed to have your own [AWS EKS Cluster](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html) and at least one node runs on it (The node should have a public IP). A PostgreSQL RDS that can be accessible by node is also required in this tutorial.
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
Then you can access the **http://${PublicIP}:${NodePort}/api/cars** via Postman, in GET method and POST method.

A POST method body sample is like:

```json
 {
 	"brand":"acura",
 	"model": "XE"
 }
```
# Develop and test Lambda function

Now, a new feature, for example a public IP query, needs to be added into the existing server. It can be done by lambda function.

Please install [SAM](https://github.com/awslabs/aws-sam-cli) and work under the **./lambda/** directory. The sam local tool will work on [template.yml](https://raw.githubusercontent.com/overtureLLC/AWS_Lab_ApiGateway_Cognito_Lambda/master/lambda/template.yaml) in current directory.

You can start api locally on http://127.0.0.1:3000/ with following command, which has already been integrted with lambda function.
```bash
sam local start-api
```
In this simple case, the api returns visitors' IP address.

# Integrate ApiGateway and Lambda function with Cloudformation

Deploy the **ApiGateway_Lambda.yaml** file in cloudformation folder with AWS CloudFormation. An Invoke URL will be found in Outputs Part, which will trigger lambda function and return visitors' current IP address.

# Leverage Cognito as sign-up and sign-in tools

### Add AWS Cognito as authorizor

Update current Cloudformation Template with **ApiGateway_Lambda_Cognito.yaml**, In **Parameters** part, fill out your email address, the prefix of domain you want to use, and the callback URL after sign-in.

After the cloudformation is updated, please try refreshing the URL and you will get an unauthorized error message.

### Integration of client and Cognito User Pool

Go to AWS Cognito Service. In User Pools, clicke **App client settings** in left side. On this page, check box of **Cognito User Pool**, fill out **Callback URL**, and Check all boxes in the bottom **except** Client credentials.

Then click **choose domain name** in the lower right.

Enter Domain prefix in this page, check availability and save changes.

### Sign-in and change password.

You can use SignUpPage in Outputs part to login in, the intial username (admin default) and password has been sent to your email address.

After the first login in, you will be asked to change password, and the status of user will transfer to confirmed.

### Set up Mocking Frontend Page to Login In

Change directory to ./cognito, install [nvm](https://github.com/creationix/nvm). Then run:

```bash
nvm install 10 && nvm use --delete-prefix v10.8.0
```

Then run:
```bash
npm install
```

**warning: For current version "amazon-cognito-identity-js": "^2.0.20", Please go into ./node_modules/amazon-cognito-identity-js/lib/Client.js, and add a new line in the 5th line**

```java
var fetch = require('node-fetch');
```

All set! We have a simple frontend page now, therefore we can mock the sign in process.

### Implement Cognito as authorizor tool of ApiGateway

Fill the config.js in ./cognito/ with output information from Cloudformation. If everything is set correctly, you will successfully log in and get a JWT.

Run this command to implement the JWT and you will get a correct response. Please replace ${JWT} and ${InvokeURL} with proper value.
```bash
curl -H "Authorization: ${JWT}" -X GET ${InvokeURL}
```

Try this command without JWT and you will get unauthorization message, which indicates the cognito works very well.
```bash
curl -X GET ${InvokeURL}
```