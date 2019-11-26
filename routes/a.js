var a = require('../SubscribeTable.json');

var b = [];
for (let i = 0; i < 10; i++) {
  b.push(a[i]["email"])
}

console.log(a[0]);
