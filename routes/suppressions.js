const express = require('express');
const router = express.Router();

require('dotenv').config();

const api_key = process.env.SENDGRID_API_KEY;
const sgClient = require('@sendgrid/client');
sgClient.setApiKey(api_key);

router.get('/group', async (req, res, next) => {
// router.get('/group/:groupId', async (req, res, next) => {
  const request = {
    // qs: {
    //   end_time: 1,
    //   limit: 1,
    //   offset: 1,
    //   start_time: 1
    // },
    method: 'GET',
    url: '/v3/asm/suppressions'
  };

  try {
    const [response, body] = await sgClient.request(request);
    console.log(body);
    res.send(body);

  } catch (err) { 
    console.log(err);
    res.send(err);

  }
})

module.exports = router;
