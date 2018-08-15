var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var AWS =require('aws-sdk');
var config =require('./config.js')

var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

var authenticationData = {
    Username : config.Username,
    Password : config.Password,
};

var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

var poolData = {
    UserPoolId : config.UserPoolId, // Your user pool id here
    ClientId : config.ClientId // Your client id here
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

var userData = {
    Username : config.Username,
    Pool : userPool
};

var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
        var accessToken = result.getAccessToken().getJwtToken();
        AWS.config.region = config.Region;

        var cognito = '"' + 'cognito-idp.' + config.Region + '.amazonaws.com/' + config.UserPoolId + '"';
        var text = '{' + cognito + ':' + '"' + result.getIdToken().getJwtToken() + '"' + '}';

        var obj = JSON.parse(text);

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId : config.IdentityPoolId,
            Logins : obj
        });

    
        AWS.config.credentials.refresh((error) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Successfully logged!');
                console.log(result.getIdToken().getJwtToken());
            }
        });
    },

    onFailure: function(err) {
        console.log(err.message + JSON.stringify(err));
    },

    newPasswordRequired: function(userAttributes, requiredAttributes) {

        delete userAttributes.email_verified;

        console.log('Your password will be changed');
        cognitoUser.completeNewPasswordChallenge(config.NewPassword, userAttributes, this);
    }
});