require('dotenv').config();
const AWS = require('aws-sdk');
const awsConfig = {
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

const docClient = new AWS.DynamoDB.DocumentClient();

const remove = function () { 
  var params = {
    TableName: 'SubscribeTable',
    Key: {
      email: 'kimms@gananetworks.com'
    }
  };
  docClient.delete(params, function (err, data) { 
    if (err) {
      console.log("user::delete::error - ", JSON.stringify(err, null, 2));
    } else { 
      console.log("user::delete::success");
    }
  })
}

remove();
