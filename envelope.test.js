const request = require('supertest');
const app = require('./app');

// Test data
let envelopeIds = [];

describe('Envelopes API', () => {
  it('should create several envelopes using the POST endpoint', async () => {
    const response1 = await request(app)
      .post('/envelopes')
      .send({ name: 'Groceries', amount: 200 });
    expect(response1.status).toBe(201);
    envelopeIds.push(response1.body.id);

    const response2 = await request(app)
      .post('/envelopes')
      .send({ name: 'Entertainment', amount: 100 });
    expect(response2.status).toBe(201);
    envelopeIds.push(response2.body.id);

    const response3 = await request(app)
      .post('/envelopes')
      .send({ name: 'Bills', amount: 100 });
    expect(response3.status).toBe(201);
    envelopeIds.push(response3.body.id);
  });

  it('should get all envelopes that were created', async () => {
    const response = await request(app)
      .get('/envelopes');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(envelopeIds.length);
  });

  it('should get individual envelopes', async () => {
    for (const id of envelopeIds) {
      const response = await request(app)
        .get(`/envelopes/${id}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(id);
    }
  });

  it('should update specific envelopes', async () => {
    const updatedAmount = 300;
    for (const id of envelopeIds) {
      const response = await request(app)
        .put(`/envelopes/${id}`)
        .send({ amount: updatedAmount });
      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(updatedAmount);
    }
  });

  it('should delete an envelope', async () => {
    const response = await request(app)
      .delete(`/envelopes/${envelopeIds[0]}`);
    expect(response.status).toBe(204);
  });

  it('should transfer budgets between two envelopes', async () => {
    const fromEnvelopeId = envelopeIds[0];
    const toEnvelopeId = envelopeIds[1];
    const amountToTransfer = 50;

    const response = await request(app)
      .post('/envelopes/transfer')
      .send({ from: fromEnvelopeId, to: toEnvelopeId, amount: amountToTransfer });
    expect(response.status).toBe(200);

    // Check if budget was transferred correctly
    const fromEnvelopeResponse = await request(app)
      .get(`/envelopes/${fromEnvelopeId}`);
    const toEnvelopeResponse = await request(app)
      .get(`/envelopes/${toEnvelopeId}`);
    expect(fromEnvelopeResponse.body.amount).toBe(300 - amountToTransfer);
    expect(toEnvelopeResponse.body.amount).toBe(300 + amountToTransfer);
  });
});
