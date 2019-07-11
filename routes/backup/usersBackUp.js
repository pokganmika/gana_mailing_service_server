const express = require('express');
const User = require('../../models').User;
const Log = require('../../models').Log;
const jwt = require('jsonwebtoken');
const moment = require('moment');
const secretKey = process.env.JWT_SECRET;
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

      Log.create({
        category: 'ADMIN',
        operName: 'Admin Register',
        status: true,
        eventInitBy: id,
        target: id,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    })
    .catch(err => { 
      console.log('::admin::register::error:: ---> : ', err);
      res.send('::admin::register::failed::');

      Log.create({
        category: 'ADMIN',
        operName: 'Admin Register',
        status: false,
        eventInitBy: id,
        target: id,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    })
});

router.post('/login', async (req, res, next) => {
  const { id, password } = req.body;
  await User.findOne({ where: { id } })
    .then(data => {
      console.log('::admin::login::data::check:: ---> : ', data.id, data.password)
      if (data.id === id && data.password === password) {
        // res.send('::admin::login::success::')
        const token = jwt.sign({ id: data.id }, secretKey, { expiresIn: '7d' });
        res.send({ res: true, message: '::admin::login::success::', token })
      } else {
        // res.send('::admin::login::not::match::')
        res.send({ res: false, message: '::admin::login::not::match::' })
      }

      // Log.create({
      //   operName: 'Admin Login',
      //   status: true,
      //   eventInitBy: id,
      //   target: id,
      //   time: moment().format('MMMM Do YYYY, h:mm:ss a')
      // })
    })
    .catch(err => {
      console.log('::admin::login::error:: ---> : ', err)
      res.send({ res: false, message: '::admin::login::failed::' })

      // Log.create({
      //   operName: 'Admin Login',
      //   status: false,
      //   eventInitBy: id,
      //   target: id,
      //   time: moment().format('MMMM Do YYYY, h:mm:ss a')
      // })
    })
});

// router.get('/logout', (req, res) => {
//   req.logout();
//   req.session.destroy();
//   res.send('logout success');
// });

module.exports = router;
