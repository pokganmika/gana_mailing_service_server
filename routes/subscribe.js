const express = require('express');
const router = express.Router();
require('dotenv').config();

const AWS = require('aws-sdk');
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

// let DbScan = function () {
//   const params = {
//     TableName: 'SubscribeTable'
//   };
//   docClient.scan(params, function (err, data) { 
//     if (err) {
//       console.log("SubscribeTable::describeTable::error - " + JSON.stringify(err, null, 2));
//     } else { 
//       console.log("SubscribeTable::describeTable::success - " + JSON.stringify(data, null, 2));
//       // res.send(data);
//       // res.send(JSON.stringify(data));
//     }
//   })
// }

router.get('/', async (req, res, next) => { 
  const params = {
    TableName: 'SubscribeTable'
  };
  await docClient.scan(params, function (err, data) { 
    if (err) {
      console.log("SubscribeTable::describeTable::error - " + JSON.stringify(err, null, 2));
      res.send(err);
    } else { 
      console.log("SubscribeTable::describeTable::success - " + JSON.stringify(data, null, 2));
      res.send(data);
      // res.send(JSON.stringify(data));
    }
  })
})

router.post('/add', async (req, res, next) => { 
  console.log("user::save::check", req.body);
  const input = req.body;
  const params = {
    TableName: 'SubscribeTable',
    Item: input
  };
  if (Object.keys(input).length === 4) {
    await docClient.put(params, (err, data) => {
      if (err) {
        console.log("user::save::error - ", JSON.stringify(err, null, 2));
        res.send(err);
      } else {
        console.log("user::save::success");
        res.send('create_success');
      }
    })
  } else { 
    console.log("user::save::error - Not Enough Data")
    res.send('Not enough Data')
  }
})

router.post('/delete', async (req, res, next) => { 
  console.log('user::delete::check', req.body);
  const { email } = req.body;
  const params = {
    TableName: 'SubscribeTable',
    Key: {
      email
    }
  }
  await docClient.delete(params, (err, data) => { 
    if (err) {
      console.log("user::delete::error - ", JSON.stringify(err, null, 2));
      res.send(err);
    } else { 
      console.log("user::delete::success");
      res.send('delete_success');
    }
  })
})

router.post('/update', async (req, res, next) => { 
  console.log("user::update::check", req.body);
  //TODO: need email and subscribe
  const params = {
    TableName: 'SubscribeTable',
    Key: {
      email
    },
    UpdateExpression: "set subscribed = :boolValue",
    ExpressionAttributeValues: {
      ":boolValue": ""
    },
    ReturnValues: "UPDATE_NEW"
  }
  await docClient.update(params, (err, data) => { 
    if (err) {
      console.log("user::modify::error - ", JSON.stringify(err, null, 2));
      res.send(err)
    } else { 
      console.log("user::modify::success");
      res.send("update_success");
    }
  })
})

module.exports = router;
