CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email VARCHAR,
  birthday DATE,
  password VARCHAR
);

CREATE TABLE IF NOT EXISTS lodgings (
  id SERIAL PRIMARY KEY,
  name TEXT,
  price FLOAT,
  capacity INT,
  availability_start DATE,
  availability_end DATE,
  country text,
  host_id INT
);

CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  guest_id INT,
  lodging_id INT,
  stay_start DATE,
  stay_end DATE,
  price FLOAT,
  occupancy INT
);