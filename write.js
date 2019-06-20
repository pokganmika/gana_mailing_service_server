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

let save = function () { 
  var input = {
    email: 'kimms@gananetworks.com',
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

