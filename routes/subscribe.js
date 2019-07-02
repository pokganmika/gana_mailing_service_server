const express = require('express');
const Log = require('../models').Log;
const router = express.Router();
const moment = require('moment');
require('dotenv').config();

const AWS = require('aws-sdk');
const awsConfig = {
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
  // region: "ap-northeast-2",
  // accessKeyId: "AKIAJE7AXS4OATS2VSZA",
  // secretAccessKey: "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"
}
AWS.config.update(awsConfig);

// AWS.config.loadFromPath('../AwsConfig.json');
// AWS.config.loadFromPath('./AwsConfig.json');

const TableName = 'SubscribeTable';
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

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
    TableName
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
  const { email, type, subscribed, created_at } = req.body;
  const input = {
    email, type, subscribed, created_at
  };
  const params = {
    TableName,
    Item: input
  };

  await docClient.put(params, (err, data) => {
    if (err) {
      console.log("user::save::error - ", JSON.stringify(err, null, 2));
      res.send(err);

      Log.create({
        operName: 'Add Subscriber',
        status: false,
        eventInitBy: 'admin',
        target: email,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    } else {
      console.log("user::save::success - ");
      res.send('create_success');

      Log.create({
        operName: 'Add Subscriber',
        status: true,
        eventInitBy: 'admin',
        target: email,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    }
  })

  //-----

  // if (Object.keys(input).length === 4) {
  //   await docClient.put(params, (err, data) => {
  //     if (err) {
  //       console.log("user::save::error - ", JSON.stringify(err, null, 2));
  //       res.send(err);
  //     } else {
  //       console.log("user::save::success");
  //       res.send('create_success');
  //     }
  //   })
  // } else { 
  //   console.log("user::save::error - Not Enough Data")
  //   res.send('Not enough Data')
  // }
})

router.post('/delete', async (req, res, next) => { 
  console.log('user::delete::check', req.body);
  const { email } = req.body;
  const params = {
    TableName,
    Key: {
      email
    }
  }
  await docClient.delete(params, (err, data) => { 
    if (err) {
      console.log("user::delete::error - ", JSON.stringify(err, null, 2));
      res.send(err);

      Log.create({
        operName: 'Delete Subscriber',
        status: false,
        eventInitBy: 'admin',
        target: email,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    } else { 
      console.log("user::delete::success");
      res.send('delete_success');

      Log.create({
        operName: 'Delete Subscriber',
        status: true,
        eventInitBy: 'admin',
        target: email,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    }
  })
})

//TODO: value problem (maybe returnvalue)
router.post('/update', async (req, res, next) => { 
  console.log("user::update::check", req.body);
  const { email, type, subscribed, created_at } = req.body;
  
  await Log.find

  const params = {
    TableName,
    Key: {
      email
    },
    UpdateExpression: "set subscribed = :boolValue",
    // UpdateExpression: "set subscribed = :boolValue, email = :emailStrValue, type = :typeValue, created_at = :timeStrValue",
    ExpressionAttributeValues: {
      ":boolValue": subscribed,
      // ":emailStrValue": email,
      // ":typeValue": type,
      // ":timeStrValue": created_at
    },
    ReturnValues: "UPDATED_NEW"
  }
  await docClient.update(params, (err, data) => {
    if (err) {
      console.log("user::modify::error - ", JSON.stringify(err, null, 2));
      res.send(err)

      Log.create({
        operName: 'Modify Subscriber',
        status: false,
        eventInitBy: 'admin',
        target: email,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    } else {
      console.log("user::modify::success");
      res.send("update_success");

      Log.create({
        operName: 'Modify Subscriber',
        status: true,
        eventInitBy: 'admin',
        target: `modify ${email} / ${subscribed}`,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    }
  })
})

module.exports = router;
