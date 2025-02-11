#!/bin/bash

psql -U postgres -d dbox-fm <<EOF
CREATE TABLE IF NOT EXISTS test (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL
);

INSERT INTO test (name, age) VALUES
  ('James', 42),
  ('Diana', 21),
  ('Michel', 13),
  ('Michelle', 101);

EOF
