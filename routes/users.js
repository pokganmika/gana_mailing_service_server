const express = require('express');
const User = require('../models').User;
const Log = require('../models').Log;
const bcypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const secretKey = process.env.JWT_SECRET;
const router = express.Router();

// TODO: add bcrypt code!
// admin user
router.post('/qwer', async (req, res, next) => {
  const { id, password } = req.body;
  console.log('::admin::register::data:: ---> : ', id, password)

  try { 
    await User.create({ id, password })
    res.send('::admin::register::success::');

    Log.create({
      category: 'ADMIN',
      operName: 'Admin Register',
      status: true,
      eventInitBy: id,
      target: id,
      time: moment().format('MMMM Do YYYY, h:mm:ss a')
    })

  } catch (err) {
    console.log(err);
    res.send('::admin::register::failed::');

    Log.create({
      category: 'ADMIN',
      operName: 'Admin Register',
      status: false,
      eventInitBy: id,
      target: id,
      time: moment().format('MMMM Do YYYY, h:mm:ss a')
    });
  }
});

router.post('/login', async (req, res, next) => {
  const { id, password } = req.body;

  try {
    const data = await User.findOne({ where: { id } });
    console.log('::admin::login::data::check:: ---> : ', data.id, data.password)

    if (data.id === id && data.password === password) {
      const token = jwt.sign({ id: data.id }, secretKey, { expiresIn: '7d' });
      res.send({ res: true, message: '::admin::login::success::', token })
    } else { 
      res.send({ res: false, message: '::admin::login::not::match::' })
    }

    // await Log.create({
    //   operName: 'Admin Login',
    //   status: true,
    //   eventInitBy: id,
    //   target: id,
    //   time: moment().format('MMMM Do YYYY, h:mm:ss a')
    // })

  } catch (err) { 
    console.log('::admin::login::error:: ---> : ', err)
    res.send({ res: false, message: '::admin::login::failed::' })

    // await Log.create({
    //   operName: 'Admin Login',
    //   status: false,
    //   eventInitBy: id,
    //   target: id,
    //   time: moment().format('MMMM Do YYYY, h:mm:ss a')
    // })
  }
});

// router.get('/logout', (req, res) => {
//   req.logout();
//   req.session.destroy();
//   res.send('logout success');
// });

module.exports = router;
