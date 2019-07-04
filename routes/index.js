const express = require('express');
const router = express.Router();
const Log = require('../models').Log;
const moment = require('moment');
require('dotenv').config();

const api_key = process.env.SENDGRID_API_KEY;
const sgClient = require('@sendgrid/client');
sgClient.setApiKey(api_key);

/**
 * TODO: check this!
 * https://github.com/sendgrid/sendgrid-nodejs/blob/master/packages/client/USAGE.md
 */
router.get('/', async function(req, res, next) {
  const request = {
    aggregated_by: 'day',
    start_date: '2019-06-29',
    end_date: '2019-07-04',
    method: 'GET',
    url: '/V3/stats',
  }

  sgClient.request(request)
    .then(([response, body]) => { 
      console.log('::sgclient::test::check:: ---> response.statusCode : ',response.statusCode);
      console.log('::sgclient::test::check:: ---> body : ', body);
      res.send(response.body)
    })
    // .then(data => console.log('::sgclient::test::success::check:: ---> : ',data))
    // .then(data => console.log('::sgclient::test::success::check:: ---> : ',JSON.stringify(data, null, 2))
    // .catch(err => console.log('::sgclient::test::fail::check:: ---> : ',err))
    // .catch(err => console.log('::sgclient::test::fail::check:: ---> : ',JSON.stringify(err, null, 2))
});

module.exports = router;
