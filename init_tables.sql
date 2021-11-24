CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email VARCHAR,
  birthday DATE,
  isHost BOOLEAN
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
