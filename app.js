const express = require('express');
const bodyParser = require('body-parser');
const envelopeRoutes = require('./routes/envelopeRoutes');
const request = require('supertest');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/envelopes', envelopeRoutes);

// Define test data
let envelopeIds = [];

// Define test functions
async function runTests() {
  await testCreateEnvelopes();
  await testGetAllEnvelopes();
  await testGetIndividualEnvelopes();
  await testUpdateEnvelopes();
  await testDeleteEnvelope();
  await testTransferBudgets();
}

async function testCreateEnvelopes() {
  const response1 = await request(app)
    .post('/envelopes')
    .send({ name: 'Groceries', amount: 200 });
  envelopeIds.push(response1.body.id);

  const response2 = await request(app)
    .post('/envelopes')
    .send({ name: 'Entertainment', amount: 100 });
  envelopeIds.push(response2.body.id);

  const response3 = await request(app)
    .post('/envelopes')
    .send({ name: 'Bills', amount: 100 });
  envelopeIds.push(response3.body.id);

  if (response1.status == '201' && response2.status == '201' && response3.status == '201'){
    console.log('testCreateEnvelopes()        returned: 201');
  }
  else{
    console.log('testCreateEnvelopes() returned an error');
  }
}

async function testGetAllEnvelopes() {
  const response = await request(app)
    .get('/envelopes');
  allEnvelopes = JSON.parse(response.text);
  console.log('testGetAllEnvelopes()        returned: ' + response.status);
}

async function testGetIndividualEnvelopes() {
  let responseCodes = [];
  for (const id of envelopeIds) {
    const response = await request(app)
      .get(`/envelopes/${id}`);
    responseCodes.push(response.status)
  }
  if(responseCodes.every(code => code === 200)){
    console.log('testGetIndividualEnvelopes() returned: 200');
  }
  else{
    console.log('testGetIndividualEnvelopes() returned an error');
  }
}

async function testUpdateEnvelopes() {
  let responseCodes = [];
  const updatedAmount = 300;
  for (const id of envelopeIds) {
    const response = await request(app)
      .put(`/envelopes/${id}`)
      .send({ amount: updatedAmount });
      responseCodes.push(response.status)
  }
  if(responseCodes.every(code => code === 200)){
    console.log('testUpdateEnvelopes()        returned: 200');
  }
  else{
    console.log('testUpdateEnvelopes()      returned an error');
  }
}

async function testDeleteEnvelope() {
  let id = envelopeIds[0];
  const response = await request(app)
    .delete(`/envelopes/${id}`);
  console.log('testDeleteEnvelope()         returned: ' + response.status);
}

async function testTransferBudgets() {
  const fromEnvelopeId = envelopeIds[1];
  const toEnvelopeId = envelopeIds[2];
  const amountToTransfer = 50;

  const response = await request(app)
    .post('/envelopes/transfer')
    .send({ from: fromEnvelopeId, to: toEnvelopeId, amount: amountToTransfer });
    console.log('testTransferBudgets()         returned: ' + response.status);
}

async function shutdownPool() {
  try {
    await pool.end();
    console.log('Database pool has ended');
  } catch (err) {
    console.error('Error shutting down the pool', err.stack);
  }
}

// Start the server and run tests
if (require.main === module) {

  const server = app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));

  server.keepAliveTimeout = 120 * 1000;
  server.headersTimeout = 120 * 1000;
}

module.exports = app;
