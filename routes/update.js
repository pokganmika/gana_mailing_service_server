require('dotenv').config();
var AWS = require('aws-sdk');
let awsConfig = {
  // region: process.env.REGION,
  // accessKeyId: process.env.ACCESS_KEY_ID,
  // secretAccessKey: process.env.SECRET_ACCESS_KEY
  region: "ap-northeast-2",
  accessKeyId: "AKIAJE7AXS4OATS2VSZA",
  secretAccessKey: "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"
}
AWS.config.update(awsConfig);

// AWS.config.loadFromPath('../AwsConfig.json');
// AWS.config.loadFromPath('./AwsConfig.json');

// AWS.config.update({ region: 'ap-northeast-2' });

let docClient = new AWS.DynamoDB.DocumentClient();

let modify = function () { 
  var params = {
    TableName: 'SubscribeTable',
    Key: {
      email: 'kimms@gananetworks.com'
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

