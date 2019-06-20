var AWS = require('aws-sdk');
// let awsConfig = {
//   region: "ap-northeast-2",
//   endpoint: "http://dynamodb.us-east-1.amazonaws.com",
//   accessKeyId: "",
//   secretAccessKey: ""
// }
// AWS.config.update(awsConfig);
AWS.config.update({ region: 'ap-northeast-2' });

let docClient = new AWS.DynamoDB.DocumentClient();

let fetchOneByKey = function () { 
  var params = {
    TableName: 'SubscribeTable',
    Key: {
      email: 'lodin@hanmail.net'
    }
  };

  docClient.get(params, function (err, data) { 
    if (err) {
      console.log("users::fetchOneByKey::error - " + JSON.stringify(err, null, 2));
    } else { 
      console.log("users::fetchOneByKey::success - " + JSON.stringify(data, null, 2));
    }
  })
};

fetchOneByKey();
