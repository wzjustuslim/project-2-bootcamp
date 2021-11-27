import express from 'express';
import pg from 'pg';
import axios from 'axios';

const { Pool } = pg;
const pgConnectConfigs = {
  user: 'issho',
  host: 'localhost',
  database: 'waterbnb',
  port: 5432,
};
const pool = new Pool(pgConnectConfigs);

const PORT = 3004;
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

///
app.get('/landing', (req, res) => {
  res.render('landing');
});

app.get('/listing', (req, res) => {
  const {
    location, checkIn, checkOut, adults,
  } = req.query;

  const searchParams = [location, checkIn, checkOut, adults];

  pool.query('SELECT * FROM lodgings WHERE country=$1 AND availability_start<=$2 AND availability_end>=$3 AND capacity>=$4', searchParams)
    .then((result) => {
      const resultsArray = result.rows;
      const data = { resultsArray };
      console.log(data);
      res.render('listing', data);
    }).catch((error) => {
      console.log(error.stack);
    });
});

app.get('/property', (req, res) => {
  res.render('property');
});

app.get('/confirm', (req, res) => {
  res.render('confirm');
});
///

app.get('/sign-up', (req, res) => {
  res.render('sign-up');
});

app.post('/sign-up', (req, res) => {
  const {
    email, firstName, lastName, birthday, isHost,
  } = req.body;
  const inputData = [firstName, lastName, email, birthday, isHost];
  console.log(inputData);
  // res.render('sign-up');
  pool.query('INSERT INTO users (first_name, last_name, email, birthday, isHost) VALUES ($1, $2, $3, $4, $5) RETURNING *', inputData)
    .then((result) => {
      console.log(result.rows[0]);
      res.render('sign-up');
    }).catch((error) => {
      console.log(error.stack); });
});

app.get('/account', (req, res) => {
  // temp hardcode use cookie next
  const inputData = [1];
  pool.query('SELECT * FROM users WHERE id=$1', inputData)
    .then((result) => {
      console.log(result.rows[0]);
      const outputData = result.rows[0];
      res.render('account', outputData);
    }).catch((error) => {
      console.log(error.stack);
    });
});

app.post('/account', (req, res) => {
  // update details?
});

app.get('/hosting', (req, res) => {
  res.render('hosting');
});

app.post('/hosting', (req, res) => {
  const {
    name, price, capacity, availabilityStart, availabilityEnd, country, hostId,
  } = req.body;
  const inputData = [name, price, capacity, availabilityStart, availabilityEnd, country, hostId];
  pool.query('INSERT INTO lodgings (name, price, capacity, availability_start, availability_end, country, host_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', inputData)
    .then((result) => {
      console.log(result.rows[0]);
      res.render('hosting');
    }).catch((error) => {
      console.log(error.stack);
    });
});

app.listen(PORT);
