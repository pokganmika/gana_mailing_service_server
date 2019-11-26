const PythonShell = require('python-shell');

const options = {

}

PythonShell.run('./dbscan.py', options, function (err, results) {
  if (err) {
    throw err;
  }
  console.log('results: %j', results);
} )
