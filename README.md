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

### Record the corresponding NodePort
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

# Integrate ApiGateway and Lambda function with Cloudformation

# Leverage Cognito as sign-up and sign-in tools