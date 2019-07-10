const express = require('express');
const Later = require('../models').Later;
const moment = require('moment');
const router = express.Router();

const api_key = process.env.SENDGRID_API_KEY;

const sgClient = require('@sendgrid/client');
sgClient.setApiKey(api_key);

const testUnixTime = new Date().getTime();
const changeTime = new Date(testUnixTime);
console.log('::testUnixTime:: ---> : ', testUnixTime)
console.log('::change time:: ---> : ', changeTime);

router.get('/', async (req, res, next) => {
  const nowUnixTime = new Date().getTime();
  const oldData = [];
  const result = [];

  await Later.findAll()
    .then(data => {
      data.forEach(element => {
        if (nowUnixTime > Number(element.scheduledTime)) {
          oldData.push(element)
        }
        result.push(element)
      })
      console.log('::email::edit::list::success::check:: ---> : ', JSON.stringify(data, null, 2));
      res.send(result);
    })
    .catch(err => {
      console.log('::email::edit::list::fail::check:: ---> : ', err)
      res.send(err);
    })

  await oldData.forEach(element => {
    Later.destroy({ where: { id: element.id } })
      .then(result => console.log('::olddata::delete::success:: ---> : ', result))
      .catch(err => console.log('::olddata::delete::fail:: ---> : ', err))
  })
});

/**
 * TODO:
 * cancel
 * pause
 * delete
 */


module.exports = router;
