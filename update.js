var AWS = require('aws-sdk');
// let awsConfig = {
//   region: "ap-northeast-2",
//   endpoint: "http://dynamodb.us-east-1.amazonaws.com",
//   accessKeyId: "",
//   secretAccessKey: ""
// }
// AWS.config.update(awsConfig);

//------

// AWS.config.loadFromPath('./AwsConfig.json');

AWS.config.update({ region: 'ap-northeast-2' });

let docClient = new AWS.DynamoDB.DocumentClient();

let modify = function () { 
  var params = {
    TableName: 'SubscribeTable',
    Key: {
      email: 'exia@namail.net'
    },
    UpdateExpression: "set updated_by = :byUser, isDeleted = :boolvalue",
    ExpressionAttributeValues: {
      ":byUser": "updateUser",
      ":boolValue": true
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function (err, data) { 
    if (err) {
      console.log("user::modify::error - ", JSON.stringify(err, null, 2));
    } else { 
      console.log("user::modify::success");
    }
  })
}

modify();

