const express = require('express');
const Later = require('../models').Later;
const Log = require('../models').Log;
const moment = require('moment');
const router = express.Router();

const api_key = process.env.SENDGRID_API_KEY;

const sgClient = require('@sendgrid/client');
sgClient.setApiKey(api_key);

router.get('/', async (req, res, next) => {
  const nowUnixTime = new Date().getTime();
  const oldData = [];
  const result = [];

  try {
    const laterData = await Later.findAll();
    laterData.forEach(element => { 
      if (nowUnixTime > Number(element.scheduledTime)) { 
        oldData.push(element);
      }
      result.push(element)
    })

    console.log('::email::edit::list::success::check:: ---> : ', JSON.stringify(laterData, null, 2));
    res.send(result);

  } catch (err) { 
    console.log('::email::edit::list::fail::check:: ---> : ', err)
    res.send(err);
  }

  try {
    oldData.forEach(element => { 
      const result = Later.destroy({ where: { id: element.id } });
      console.log('::olddata::delete::success:: ---> : ', result);
    })

  } catch (err) { 
    console.log('::olddata::delete::fail:: ---> : ', err)
  }
});

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

  try {
    const [response, body] = await sgClient.request(request);
    console.log('::later::mail::edit::response::check:: ---> : ', body);

    await Later.update({ status: 'Pause' }, { where: { id } })
    await Log.create({
      category: 'SCHEDULED',
      operName: 'Send Later - Pause',
      status: true,
      eventInitBy: 'admin',
      target: `Pause -> ${batch_id}`,
      time: moment().format('MMMM Do YYYY, h:mm:ss a')
    })

  } catch (err) { 
    console.log(err);
    res.send('::later::mail::edit::fail::pause::');
  }
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

  try {
    const [response, body] = await sgClient.request(request);
    console.log(body);
    res.send('::later::mail::edit::success::cancel::');

    await Later.update({ status: 'Cancel' }, { where: { id } })
    await Log.create({
      category: 'SCHEDULED',
      operName: 'Send Later - Cancel',
      status: true,
      eventInitBy: 'admin',
      target: `Cancel -> ${batch_id}`,
      time: moment().format('MMMM Do YYYY, h:mm:ss a')
    })
    
  } catch (err) { 
    console.log(err);
    res.send('::later::mail::edit::fail::cancel::');
  }
})

router.post('/delete', async (req, res, next) => { 
  const { batch_id, id } = req.body;
  const request = {
    method: 'DELETE',
    url: `/v3/user/scheduled_sends/${batch_id}`
  };

  try {
    const [response, body] = await sgClient.request(request);
    console.log(body);
    res.send('::later::mail::edit::success::delete::');

    await Later.update({ status: 'Pending' }, { where: { id } })
    await Log.create({
      category: 'SCHEDULED',
      operName: 'Send Later - Repend',
      status: true,
      eventInitBy: 'admin',
      target: `Repend -> ${batch_id}`,
      time: moment().format('MMMM Do YYYY, h:mm:ss a')
    })

  } catch (err) { 
    console.log(err);
    res.send('::later::mail::edit::fail::delete::');
  }
})

// Retrieve
router.get('/retrieve', async (req, res, next) => { 
  const request = {
    method: 'GET',
    url: '/v3/user/scheduled_sends'
  };

  try {
    const [response, body] = sgClient.request(request);
    console.log(body);
    res.send(body);

  } catch (err) { 
    console.log(err);
    res.send(err);
  }
})

router.get('/retrieve/:batchId', async (req, res, next) => { 
  const { batchId } = req.params;
  const request = {
    method: 'GET',
    url: `/v3/user/scheduled_sends/${batchId}`
  };

  try {
    const [response, body] = sgClient.request(request);
    console.log(body);
    res.send(body);

  } catch (err) { 
    console.log(err);
    res.send(err);
  }
})

module.exports = router;
