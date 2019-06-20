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

let save = function () { 
  var input = {
    email: 'kim@gananetworks.com',
    type: 'email',
    created_at: '2019-06-20',
    subscribed: true
  }
  var params = {
    TableName: 'SubscribeTable',
    Item: input
  };
  docClient.put(params, function (err, data) { 
    if (err) {
      console.log("user::save::error - ", JSON.stringify(err, null, 2));
    } else { 
      console.log("user::save::success");
    }
  })
}

save();

