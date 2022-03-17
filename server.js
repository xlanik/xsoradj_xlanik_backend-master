const express = require('express');
const app = express();
const port = 3000;
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()
const mongoose = require('mongoose');

const databaseUri = process.env.DATABASE_URI

app.use(express.json()) //https://stackoverflow.com/questions/18542329/typeerror-cannot-read-property-id-of-undefined

MongoClient.connect(databaseUri, (err, client) => {
  if (err) return console.error(err)
  console.log('Connected to Database')
  const db = client.db('Autoservis')
  const customers = db.collection('customers')


  app.post('/customers', (req, res) => {
    
      //todo validacia vstupnych dat

      customers.insertOne(req.body).then(() => {
        res.status(201).json(req.body);
      })
  })

  

  app.get('/customers', (req, res) => {
    
    //todo validacia vstupnych dat

    customers.find().toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      res.status(201).json(result);
    });
})

})

app.get('/', function(req, res) {
  res.send('Hello World!')
});


app.listen(port, function() {
  console.log(`Example app listening on port ${port}!`)
});