var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var AWS =require('aws-sdk');
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

var authenticationData = {
    Username : process.argv[2],
    Password : process.argv[3],
};

var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

var poolData = {
    UserPoolId : 'us-east-1_N8lGIMwK0', // Your user pool id here
    ClientId : '1keu7b6ejucnj3bj934p604rmq' // Your client id here
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

var userData = {
    Username : process.argv[2],
    Pool : userPool
};

var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
        var accessToken = result.getAccessToken().getJwtToken();
        AWS.config.region = 'us-east-1';

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId : 'us-east-1:33fe17ca-ec30-45fa-b1fa-08040714a366',
            Logins : {
                'cognito-idp.us-east-1.amazonaws.com/us-east-1_N8lGIMwK0' : result.getIdToken().getJwtToken()
            }
        });

    
        AWS.config.credentials.refresh((error) => {
            if (error) {
                console.error(error);
            } else {
                     // Instantiate aws sdk service objects now that the credentials have been updated.
                     // example: var s3 = new AWS.S3();
                console.log('Successfully logged!');
                console.log(result.getIdToken().getJwtToken());
            }
        });
    },
    onFailure: function(err) {
        console.log(err.message + JSON.stringify(err));
    },
});