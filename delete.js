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

let remove = function () { 
  var params = {
    TableName: 'SubscribeTable',
    Key: {
      email: 'exia@namail.net'
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
