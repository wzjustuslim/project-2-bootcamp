import express from 'express';
import pg from 'pg';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import jsSHA from 'jssha';

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
app.use(cookieParser());

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '/public')));

const makeSaltHash = (str, salt) => {
  const cryo = 'shenhe';
  let seq;

  if (salt) {
    seq = `${str}-${cryo}`;
  } else {
    seq = str;
  }

  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  shaObj.update(seq);
  const hashedStr = shaObj.getHash('HEX');
  return hashedStr;
};

// route complete
app.get('/landing', (req, res) => {
  res.render('landing');
});

// route complete
app.get('/listing', (req, res) => {
  const {
    location, checkIn, checkOut, adults,
  } = req.query;

  const searchParams = [location, checkIn, checkOut, adults];

  pool.query('SELECT * FROM lodgings WHERE country=$1 AND availability_start<=$2 AND availability_end>=$3 AND capacity>=$4', searchParams)
    .then((result) => {
      const resultsArray = result.rows;
      const data = {
        resultsArray, location, checkIn, checkOut, adults,
      };
      console.log(data);
      res.render('listing', data);
    }).catch((error) => {
      console.log(error.stack);
    });
});

// route complete
app.get('/property/:id', (req, res) => {
  const {
    location, checkIn, checkOut, adults,
  } = req.query;

  const { id } = req.params;

  const searchParams = [id];

  pool.query('SELECT * FROM lodgings WHERE id=$1', searchParams)
    .then((result) => {
      const resultsArray = result.rows;

      const data = {
        resultsArray, location, checkIn, checkOut, adults,
      };
      console.log(data);
      res.render('property', data);
    }).catch((error) => {
      console.log(error.stack);
    });
});

// route complete
app.post('/property/:id', (req, res) => {
  if (!(req.cookies.userName) || !(req.cookies.loggedInHash)) {
    res.status(403).send('please login');
  }

  const { userName, loggedInHash } = req.cookies;
  const hashCookie = makeSaltHash(userName, true);

  if (hashCookie !== loggedInHash) {
    res.status(403).send('please login');
  }

  const {
    guestId, lodgingId, stayStart, stayEnd, price, occupancy,
  } = req.body;

  const inputData = [guestId, lodgingId, stayStart, stayEnd, price, occupancy];
  console.log(inputData);
  pool.query('INSERT INTO reservations (guest_id, lodging_id, stay_start, stay_end, price, occupancy) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', inputData)
    .then((result) => {
      console.log(result.rows[0]);
      res.redirect('http://localhost:3004/landing');
    })
    .catch((error) => {
      console.log(error.stack);
    });
});

// route complete
app.get('/sign-up', (req, res) => {
  res.render('sign-up');
});

// route complete
app.post('/sign-up', (req, res) => {
  const {
    email, firstName, lastName, birthday, password,
  } = req.body;

  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  shaObj.update(password);
  const hashedPassword = shaObj.getHash('HEX');

  const inputData = [firstName, lastName, email, birthday, hashedPassword];
  console.log(inputData);

  // res.render('sign-up');
  pool.query('INSERT INTO users (first_name, last_name, email, birthday, password) VALUES ($1, $2, $3, $4, $5) RETURNING *', inputData)
    .then((result) => {
      console.log(result.rows[0]);
      res.redirect('http://localhost:3004/landing');
    }).catch((error) => {
      console.log(error.stack);
    });
});

// route complete
app.get('/login', (req, res) => {
  res.render('login');
});

// working here
app.post('/login', (req, res) => {
  const searchParams = [req.body.email];
  pool.query('SELECT * FROM users WHERE email=$1', searchParams)
    .then((result) => {
      if (result.rows.length === 0) {
        res.status(403).send('login failed');
        throw new Error('no such user');
      }

      const user = result.rows[0];

      const hashedPassword = makeSaltHash(req.body.password, false);

      if (user.password !== hashedPassword) {
        res.status(403).send('login failed');
        throw new Error('wrong password');
      }

      res.cookie('userName', req.body.email);
      res.cookie('loggedInHash', makeSaltHash(req.body.email, true));

      res.send('login ok');
    }).catch((error) => {
      console.log(error.stack);
    });
});

// admin host
app.get('/hosting', (req, res) => {
  res.render('hosting');
});

// admin post
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
