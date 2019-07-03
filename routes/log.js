const express = require('express');
const Log = require('../models').Log;
const moment = require('moment');
const router = express.Router();

router.get('/', async (req, res, next) => { 
  const result = await Log.findAll();
  console.log('::total::log::result:: ---> : ', result);
  console.log('::total::log::result::check::')
  res.send(result);
})

router.get('/email', async (req, res, next) => { 
  const emailResult = await Log.findAll({ where: { category: 'EMAIL' } });
  console.log('::email::log::result:: ---> : ', emailResult);
  console.log('::email::log::result::check::')
  res.send(emailResult);
})

router.get('/subscriber', async (req, res, next) => { 
  const subscriberResult = await Log.findAll({ where: { category: 'SUBSCRIBER' } });
  console.log('::subscriber::log::result:: ---> : ', subscriberResult);
  console.log('::subscriber::log::result::check::')
  res.send(subscriberResult);
})

module.exports = router;
