const express = require('express');
const Later = require('../models').Later;
const moment = require('moment');
const router = express.Router();

const api_key = process.env.SENDGRID_API_KEY;

const sgClient = require('@sendgrid/client');
sgClient.setApiKey(api_key);

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

router.post('/pause', async (req, res, next) => { 
  const { batch_id, id } = req.body;
  const request = {
    body: {
      batch_id,
      status: 'pause'
    },
    method: 'POST',
    url: '/v3/user/scheduled_sends'
  };
  await sgClient.request(request)
    .then(async ([response, body]) => {
      console.log(body);
      res.send('::later::mail::edit::success::pause::');
      await Later.update({ status: 'Pause' }, { where: { id } })
        .then(result => console.log(result))
        .catch(err => console.log(err))
    })
    .catch(err => {
      console.log(err);
      res.send('::later::mail::edit::fail::pause::');
    })
})

router.post('/cancel', async (req, res, next) => { 
  const { batch_id, id } = req.body;
  const request = {
    body: {
      batch_id,
      status: 'cancel'
    },
    method: 'POST',
    url: '/v3/user/scheduled_sends'
  };
  await sgClient.request(request)
    .then(async ([response, body]) => {
      console.log(body);
      res.send('::later::mail::edit::success::cancel::')
      await Later.update({ status: 'Cancel' }, { where: { id } })
        .then(result => console.log(result))
        .catch(err => console.log(err))
    })
    .catch(err => {
      console.log(err);
      res.send('::later::mail::edit::fail::cancel::');
    })
})

router.get('/retrieve/:batchId', async (req, res, next) => { 
  const { batchId } = req.params;

  const request = {
    method: 'GET',
    url: `/v3/user/scheduled_sends/${batchId}`
  };
  await sgClient.request(request)
    .then(([response, body]) => {
      console.log(body);
      res.send('::later::mail::edit::success::retrieve::');
    })
    .catch(err => { 
      console.log(err);
      res.send('::later::mail::edit::fail::retrieve::');
    })
})

router.get('/delete/:batchId', async (req, res, next) => { 
  const { batchId } = req.params;

  const request = {
    method: 'DELETE',
    url: `/v3/user/scheduled_sends/${batchId}`
  }
  await sgClient.request(request)
    .then(([response, body]) => { 
      console.log(body);
      res.send('::later::mail::edit::success::delete::');
    })
    .catch(err => { 
      console.log(err);
      res.send('::later::mail::edit::fail::delete::');
    })
})

module.exports = router;
