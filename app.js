const express = require('express');
const bodyParser = require('body-parser');
const envelopeRoutes = require('./routes/envelopeRoutes');
const request = require('supertest');

const app = express();
const PORT = process.env.PORT || 3000;

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
  console.log(response1.status);
  envelopeIds.push(response1.body.id);

  const response2 = await request(app)
    .post('/envelopes')
    .send({ name: 'Entertainment', amount: 100 });
  console.log(response2.status);
  envelopeIds.push(response2.body.id);

  const response3 = await request(app)
    .post('/envelopes')
    .send({ name: 'Bills', amount: 100 });
  console.log(response3.status);
  envelopeIds.push(response3.body.id);
}

async function testGetAllEnvelopes() {
  const response = await request(app)
    .get('/envelopes');
  console.log(response.status);
  console.log(response.body.length == envelopeIds.length);
}

async function testGetIndividualEnvelopes() {
  for (const id of envelopeIds) {
    const response = await request(app)
      .get(`/envelopes/${id}`);
    console.log(response.status);
    console.log(response.body.id);
  }
}

async function testUpdateEnvelopes() {
  const updatedAmount = 300;
  for (const id of envelopeIds) {
    const response = await request(app)
      .put(`/envelopes/${id}`)
      .send({ amount: updatedAmount });
    console.log(response.status);
    console.log(response.body.amount);
  }
}

async function testDeleteEnvelope() {
  const response = await request(app)
    .delete(`/envelopes/${envelopeIds[0]}`);
  console.log(response.status);
}

async function testTransferBudgets() {
  const fromEnvelopeId = envelopeIds[1];
  const toEnvelopeId = envelopeIds[2];
  const amountToTransfer = 50;

  const response = await request(app)
    .post('/envelopes/transfer')
    .send({ from: fromEnvelopeId, to: toEnvelopeId, amount: amountToTransfer });
  console.log(response.status);

  // Check if budget was transferred correctly
  const fromEnvelopeResponse = await request(app)
    .get(`/envelopes/${fromEnvelopeId}`);
  const toEnvelopeResponse = await request(app)
    .get(`/envelopes/${toEnvelopeId}`);
  console.log(fromEnvelopeResponse.body.amount);
  console.log(toEnvelopeResponse.body.amount);
}

// Start the server and run tests
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await runTests();
    process.exit(0); // Exit the process after running tests
  });
}

module.exports = app;
