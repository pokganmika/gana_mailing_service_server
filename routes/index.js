const express = require('express');
const router = express.Router();
const Log = require('../models').Log;
const moment = require('moment');
require('dotenv').config();

// const api_key = process.env.SENDGRID_API_KEY;
const sgClient = require('@sendgrid/client');
sgClient.setApiKey(process.env.SENDGRID_API_KEY);
// client.setApiKey(api_key);
// sgClient.setApiKey(`Bearer ${api_key}`);
console.log('::client::check:: -----> : ',sgClient)

/**
 * TODO: check this!
 * https://github.com/sendgrid/sendgrid-nodejs/blob/master/packages/client/USAGE.md
 */
router.get('/main', async (req, res, next) => {
  const request = {
    qs: {
      aggregated_by: 'day',
      end_date: '2019-07-03',
      start_date: '2019-06-29',
    },
    method: 'GET',
    url: '/v3/stats',
  }

  console.log('::request::check:: ---> : ',request)

  await sgClient.request(request)
    .then(([response, body]) => {
      console.log('::check::this:: ---> : ', response.statusCode);
      console.log('::check::this:: ---> : ', body);
      res.send(response)
    })
    .catch(err => {
      console.log(err)
      res.send(err)
    });
});

module.exports = router;
