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
}
AWS.config.update(awsConfig);

// AWS.config.loadFromPath('../AwsConfig.json');
// AWS.config.loadFromPath('./AwsConfig.json');

const TableName = process.env.TABLE_NAME;
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

// ===== TODO: mail data =====
const mailData = require('../SubscribeTable.json');
// =====                 =====

// TODO: update count
router.get('/main', async (req, res, next) => { 
  const result = { scannedCount: mailData.length };

  if (mailData.length > 0) {
    res.send(result)
  } else {
    res.send({ scannedCount: "No Data" })
  }
})

// ===========================================
// TODO: Delete All (Do not touch DB by admin)
// ===========================================
// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
router.get('/', async (req, res, next) => { 
  const params = { TableName };

  function onScan(params) {
    var lastEvaluatedKey = {};
    var previous_item = [];

    return new Promise(function (resolve, reject) {
      function moreScan() {
        if (Object.keys(lastEvaluatedKey).length) {
          params.ExclusiveStartKey = lastEvaluatedKey;
        }
        docClient.scan(params, function (err, data){
          if (err) reject(err);
          if (data != null) {
            previous_item = previous_item.concat(data.Items);

            if (data.lastEvaluatedKey) {
              lastEvaluatedKey = data.LastEvaluatedKey;
              moreScan();
            } else {
              resolve(previous_item);
            }
            console.log('::scan::data::result:: ---> : ', data.Count);
          } else {
            reject('Error')
          }
        })
      }
      moreScan();
    }).catch(function (e){
      console.log(e);
    })
  }
  
  const result = onScan({ TableName });
  console.log(`-=-=-=-${result}-=-=-=-`);
  res.send(result);

  // await docClient.scan(params, function (err, data) { 
  //   if (err) {
  //     console.log("SubscribeTable::describeTable::error - " + JSON.stringify(err, null, 2));
  //     res.send(err);
  //   } else { 
  //     console.log("SubscribeTable::describeTable::success - " + JSON.stringify(data, null, 2));
  //     const result = [];
  //     for (let i = 0; i < data.Items.length; i++) { 
  //       data.Items[i].created_at = new Date(data.Items[i].created_at).toString().slice(0, 24);
  //       result.push(data.Items[i]);
  //     }
  //     res.send(result);
  //     // res.send(data);
  //     // res.send(JSON.stringify(data));
  //   }
  // })
})
// router.get('/', async (req, res, next) => { 
//   const params = {
//     TableName
//   };
//   await docClient.scan(params, function (err, data) { 
//     if (err) {
//       console.log("SubscribeTable::describeTable::error - " + JSON.stringify(err, null, 2));
//       res.send(err);
//     } else { 
//       console.log("SubscribeTable::describeTable::success - " + JSON.stringify(data, null, 2));
//       const result = [];
//       for (let i = 0; i < data.Items.length; i++) { 
//         data.Items[i].created_at = new Date(data.Items[i].created_at).toString().slice(0, 24);
//         result.push(data.Items[i]);
//       }
//       res.send(result);
//       // res.send(data);
//       // res.send(JSON.stringify(data));
//     }
//   })
// })

// TODO: created_at / subscribed => modify!
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
      console.log("user::save::error ---> : ", JSON.stringify(err, null, 2));
      res.send(err);

      Log.create({
        category: 'SUBSCRIBER',
        operName: 'Add Subscriber',
        status: false,
        eventInitBy: 'admin',
        target: email,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    } else {
      console.log("user::save::success");
      res.send('create_success');

      Log.create({
        category: 'SUBSCRIBER',
        operName: 'Add Subscriber',
        status: true,
        eventInitBy: 'admin',
        target: email,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    }
  })
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
        category: 'SUBSCRIBER',
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
        category: 'SUBSCRIBER',
        operName: 'Delete Subscriber',
        status: true,
        eventInitBy: 'admin',
        target: email,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    }
  })
})

// TODO: created_at / subscribed => modify!
//TODO: value problem (maybe returnvalue)
router.post('/update', async (req, res, next) => { 
  console.log("user::update::check", req.body);
  const { email, type, subscribed, created_at } = req.body;

  const params = {
    TableName,
    Key: {
      email
    },
    UpdateExpression: "set subscribed = :numValue",
    // UpdateExpression: "set subscribed = :boolValue",
    // UpdateExpression: "set subscribed = :boolValue, email = :emailStrValue, type = :typeValue, created_at = :timeStrValue",
    ExpressionAttributeValues: {
      ":numValue": subscribed,
      // ":boolValue": subscribed,
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
        category: 'SUBSCRIBER',
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
        category: 'SUBSCRIBER',
        operName: 'Modify Subscriber',
        status: true,
        eventInitBy: 'admin',
        target: `modify ${email} / ${subscribed}`,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    }
  })
})

// -----

//TODO: unsubscribe
router.get('/unsubscribe/:email', async (req, res, next) => { 
  // console.log("::user::update::check::", req.body);
  // const { email, type, subscribed, created_at } = req.body;
  console.log("::user::unsubscribe::parmas::check:: ---> : ", req.params);
  const { email } = req.params;

  const params = {
    TableName,
    Key: {
      email
    },
    UpdateExpression: "set subscribed = :boolValue",
    // UpdateExpression: "set subscribed = :boolValue, email = :emailStrValue, type = :typeValue, created_at = :timeStrValue",
    ExpressionAttributeValues: {
      // ":boolValue": subscribed,
      ":boolValue": false,
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
        category: 'SUBSCRIBER',
        operName: 'Unsubscribe Request',
        status: false,
        eventInitBy: 'user',
        target: email,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    } else {
      console.log("user::modify::success");
      res.send("update_success");

      Log.create({
        category: 'SUBSCRIBER',
        operName: 'Unsubscribe Request',
        status: true,
        eventInitBy: 'user',
        target: `modify ${email} / ${subscribed}`,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    }
  })
})

module.exports = router;
