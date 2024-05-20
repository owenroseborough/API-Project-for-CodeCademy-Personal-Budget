//local database connection settings
//const pool = new Pool({
//  user: 'postgres',
//  host: 'localhost',
//  database: 'codecademypersonalbudget',
//  password: 'password',
//  port: 5432,
//});

const { Pool } = require('pg');
const fetch = require('node-fetch');
const DATABASE_URL = process.env.DATABASE_URL;
// Database connection
const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function connectAndQuery(query, values) {
  try {
    const client = await pool.connect();
    const res = await client.query(query, values);
    client.release();
    return res;
  } catch (err) {
    console.error('Query error', err.stack);
  } 
}
// Example usage
//connectAndQuery('SELECT * FROM employees');

exports.pool;
exports.connectAndQuery;

let envelopes = [];

exports.createEnvelope = async (req, res) => {
  //need to send this back:
  //response1.body.id
  const { name, amount } = req.body;
  const id = Date.now().toString();

  const query = 'INSERT INTO envelope (id, name, amount) VALUES ($1, $2, $3)';
  const values = [id, name, amount];

  const databaseResponse = await connectAndQuery(query, values);

  res.status(201).json({ id , databaseResponse });
};

exports.getAllEnvelopes = async (req, res) => {

  const query = 'SELECT * FROM envelope';
  const values = [];

  const databaseResponse = await connectAndQuery(query, values);
  res.status(200).json(databaseResponse.rows);
};

exports.getEnvelopeById = async (req, res) => {
  const query = 'SELECT * FROM envelope WHERE id = $1';
  const values = [req.params.id];

  const databaseResponse = await connectAndQuery(query, values);

  if (databaseResponse.rows.length == 0) {
    return res.status(404).json({ message: 'Envelope not found' });
  }
  res.status(200).json(databaseResponse.rows);
};

exports.updateEnvelope = async (req, res) => {
  const query = 'UPDATE envelope SET amount = $1 WHERE id = $2';
  const { amount } = req.body;
  const values = [amount, req.params.id];

  const databaseResponse = await connectAndQuery(query, values);
  
  res.status(200).json(databaseResponse.rows);
};

exports.deleteEnvelope = async (req, res) => {
  const query = 'DELETE FROM envelope WHERE id = $1';
  const values = [req.params.id];

  const databaseResponse = await connectAndQuery(query, values);
  
  res.status(200).json(databaseResponse.rows);
};

exports.transferBudget = async (req, res) => {
  const { from, to, amount } = req.body;
  const query = 'SELECT amount FROM envelope WHERE id = $1';
  const values = [from];

  const databaseResponse = await connectAndQuery(query, values);

  //check that database has enough money in row to take from
  if (databaseResponse.rows[0].amount < amount) {
    return res.status(400).json({ message: 'Insufficient funds in the source envelope' });
  }

  //take money from from envelope
  const query1 = 'UPDATE envelope SET amount = amount - $1 WHERE id = $2';
  const values1 = [amount, from];

  const databaseResponse1 = await connectAndQuery(query1, values1);

  //add money to to envelope
  const query2 = 'UPDATE envelope SET amount = amount + $1 WHERE id = $2';
  const values2 = [amount, to];

  const databaseResponse2 = await connectAndQuery(query2, values2);

  res.status(200).json({ message: 'Budget transferred successfully' });
};
