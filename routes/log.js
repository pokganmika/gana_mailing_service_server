const express = require('express');
const Log = require('../models').Log;
const moment = require('moment');
const router = express.Router();

router.get('/', async (req, res, next) => { 
  try {
    const data = await Log.findAll();
    console.log('::total::log::success::check:: ---> : ', data);
    const tempData = JSON.parse(JSON.stringify(data, null, 2));
    const result = [];

    for (let i = 0; i < tempData.length; i++) { 
      tempData[i].key = tempData[i].key.toString();
      
      if (tempData[i].status === true) {
        tempData[i].status = 'Success';
      } else if (tempData[i].status === false) {
        tempData[i].status = 'Fail';
      } else { 
        tempData[i].status = 'Error';
      }

      if (tempData[i].operName === 'Modify Subscriber') { 
        if (tempData[i].target[tempData[i].target.length - 1] === '1') {
          tempData[i].target = tempData[i].target.slice(0, tempData[i].target.length - 1) + true;
        } else if (tempData[i].target[tempData[i].target.length - 1] === '0'){ 
          tempData[i].target = tempData[i].target.slice(0, tempData[i].target.length - 1) + false;
        }
      }

      result.unshift(tempData[i]);
    }
    res.send(result);

  } catch (err) { 
    console.log('::total::log::error::check:: ---> : ', err);
    res.send(err);

  }
  
  // await Log.findAll()
  //   .then(data => { 
  //     // TODO: can't see the data
  //     // console.log('::total::log::success::check:: ---> : ', data);
  //     console.log('::total::log::success::check:: ---> : ', JSON.stringify(data, null, 2));
  //     const tempData = JSON.parse(JSON.stringify(data, null, 2));
  //     const result = [];
      
  //     for (let i = 0; i < tempData.length; i++) { 
  //       tempData[i].key = tempData[i].key.toString();

  //       if (tempData[i].status === true) {
  //         tempData[i].status = 'Success';
  //       } else if (tempData[i].status === false) {
  //         tempData[i].status = 'Fail';
  //       } else { 
  //         tempData[i].status = 'Error';
  //       }

  //       // if (tempData[i].operName === 'Modify Subscriber' && tempData[i].target[tempData[i].target.length - 1] === ('1' || '0')) { 
  //       if (tempData[i].operName === 'Modify Subscriber') { 
  //         if (tempData[i].target[tempData[i].target.length - 1] === '1') {
  //           tempData[i].target = tempData[i].target.slice(0, tempData[i].target.length - 1) + true;
  //         } else if (tempData[i].target[tempData[i].target.length - 1] === '0'){ 
  //           tempData[i].target = tempData[i].target.slice(0, tempData[i].target.length - 1) + false;
  //         }
  //       }

  //       result.unshift(tempData[i]);
  //     }
  //     res.send(result);
  //   })
  //   .catch(err => { 
  //     console.log('::total::log::error::check:: ---> : ', err);
  //     res.send(err);
  //   });
})

//-----

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
