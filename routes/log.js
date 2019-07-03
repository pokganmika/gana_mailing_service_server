const express = require('express');
const Log = require('../models').Log;
const moment = require('moment');
const router = express.Router();

router.get('/', async (req, res, next) => { 
  await Log.findAll()
    .then(data => { 
      // TODO: can't see the data
      // console.log('::total::log::success::check:: ---> : ', data);
      console.log('::total::log::success::check:: ---> : ', JSON.stringify(data, null, 2));
      const result = JSON.parse(JSON.stringify(data, null, 2));
      console.log('::result::check::before:: ---> : ', result);
      for (let i = 0; i < result.length; i++) { 
        result[i].key = result[i].key.toString();
        if (result[i].status === true) {
          result[i].status = 'Success';
        } else { 
          result[i].status = 'Fail';
        }
      }

      const reverse = [];
      for (let i = 0; i < result.length; i++) { 
        reverse.unshift(result[i]);
      }
      res.send(reverse);
    })
    .catch(err => { 
      console.log('::total::log::error::check:: ---> : ', err);
      res.send(err);
    });
})

router.get('/email', async (req, res, next) => { 
  await Log.findAll({ where: { category: 'EMAIL' } })
    .then(data => {
      console.log('::email::log::result::success:: ---> : ', data);
      res.send(data);
    })
    .catch(err => {
      console.log('::email::log::result::fail:: ---> : ', err);
      res.send('fail');
    });
})

router.get('/subscriber', async (req, res, next) => { 
  await Log.findAll({ where: { category: 'SUBSCRIBER' } })
    .then(data => {
      console.log('::subscriber::log::result::success:: ---> : ', data);
      res.send(data);
    })
    .catch(err => {
      console.log('::subscriber::log::result::fail:: ---> : ', err);
      res.send('fail');
    });
})

module.exports = router;
