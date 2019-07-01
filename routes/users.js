const express = require('express');
const User = require('../models/index').User;
const jwt = require('jsonwebtoken');
const router = express.Router();

// admin user
router.post('/qwer', async (req, res, next) => {
  const { id, password } = req.body;
  console.log('::admin::register::data:: ---> : ', id, password)
  await User.create({
    id, password
  })
    .then(data => { 
      res.send('::admin::register::success::');
    })
    .catch(err => { 
      console.log('::admin::register::error:: ---> : ', err);
      res.send('::admin::register::failed::');
    })
});

router.post('/login', async (req, res, next) => { 
  const { id, password } = req.body;
  await User.findOne({ where: { id } })
    .then(data => { 
      console.log('::admin::login::data::check:: ---> : ', data.id, data.password)
      if (data.id === id && data.password === password) {
        // res.send('::admin::login::success::')
        res.send({res: true, message: '::admin::login::success::', data: data.id})
      } else { 
        // res.send('::admin::login::not::match::')
        res.send({res: false, message: '::admin::login::not::match::'})
      }
    })
    .catch(err => { 
      console.log('::admin::login::error:: ---> : ', err)
      res.send({res: false, message: '::admin::login::failed::'})
    })
})

module.exports = router;
