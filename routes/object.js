var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(':memory:')

//create a database if not exists
db.serialize(function () {
  db.run('CREATE TABLE IF NOT EXISTS objects (key TEXT, value TEXT, timestamp INTEGER)', (error)=>{
  });
});

/* GET users listing. */
router.get('/:mykey', function(req, res, next) {
  var url = require('url');
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;

  var timestampCondition = (query.timestamp !== undefined ? "AND timestamp <= " + query.timestamp : "");
  db.get("SELECT * FROM objects WHERE key='"+ req.params.mykey +"' " + timestampCondition + " ORDER BY timestamp DESC", function (err, row) {
      if(row !== undefined)
        res.json({
          value: row.value
        });
      else{
        if(timestampCondition === "")
          res.status(404).send("Value not found for requested key.");
        else
          res.status(404).send("Value not found for requested key and timestamp.");
      }
  });

  db.all("SELECT * FROM objects WHERE key='"+ req.params.mykey +"'", function (err, rows) {
    console.log(rows);
  });
});

router.post('/', function(req, res, next) {
  
  db.serialize(function () {
    var stmt = db.prepare("INSERT INTO objects VALUES (?,?,?)");
    var timestamp = Math.floor(Date.now()/1000);
    var key = Object.keys(req.body)[0];
    var value = Object.values(req.body)[0];

    stmt.run(key, value, timestamp);
    stmt.finalize();

    res.json({
      key:key,
      value:value,
      timestamp:timestamp
    });

  });
});

module.exports = router;