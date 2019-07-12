const express = require('express');
const router = express.Router();
const moment = require('moment');
require('dotenv').config();

const api_key = process.env.SENDGRID_API_KEY;
const sgClient = require('@sendgrid/client');
sgClient.setApiKey(api_key);
// sgClient.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * TODO: check this!
 * https://github.com/sendgrid/sendgrid-nodejs/blob/master/packages/client/USAGE.md
 */
router.get('/main/weekly', async (req, res, next) => {
  const start_date = moment().format().slice(0, 10);
  const request = {
    qs: {
      aggregated_by: 'week',
      start_date,
    },
    method: 'GET',
    url: '/v3/stats',
  }

  try {
    const [response, body] = await sgClient.request(request);
    res.status(response.statusCode).send(body);

  } catch (err) { 
    console.log(err);
    res.send(err);
    // res.status(401).send(err);
  }

  // await sgClient.request(request)
  //   .then(([response, body]) => {
  //     res.status(response.statusCode).send(body)
  //   })
  //   .catch(err => {
  //     console.log(err)
  //     res.send(err)
  //   });
});

router.get('/main/monthly', async (req, res, next) => {
  const start_date = moment().format().slice(0, 10);
  const request = {
    qs: {
      aggregated_by: 'month',
      start_date,
    },
    method: 'GET',
    url: '/v3/stats',
  }

  try {
    const [response, body] = await sgClient.request(request);
    res.status(response.statusCode).send(body);

  } catch (err) { 
    console.log(err);
    res.send(err);
  }

  // await sgClient.request(request)
  //   .then(([response, body]) => {
  //     res.status(response.statusCode).send(body)
  //   })
  //   .catch(err => {
  //     console.log(err)
  //     res.send(err)
  //   });
});

module.exports = router;
