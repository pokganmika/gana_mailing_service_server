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

let docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

let a = function () { 
  var params = {
    TableName: 'SubscribeTable'
  };
  docClient.scan(params, function (err, data) { 
    if (err) {
      console.log("SubscribeTable::describeTable::error - " + JSON.stringify(err, null, 2));
    } else { 
      // console.log("SubscribeTable::describeTable::success - " + JSON.stringify(data, null, 2));
      // console.log("SubscribeTable::describeTable::success - " + data);
      console.log("SubscribeTable::describeTable::success - " + JSON.stringify(data, null, 2));
    }
  })
}

a();
