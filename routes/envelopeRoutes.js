const express = require('express');
const router = express.Router();
const envelopeController = require('../controllers/envelopeController');

router.post('/', envelopeController.createEnvelope);
router.get('/', envelopeController.getAllEnvelopes);
router.get('/:id', envelopeController.getEnvelopeById);
router.put('/:id', envelopeController.updateEnvelope);
router.delete('/:id', envelopeController.deleteEnvelope);
router.post('/transfer', envelopeController.transferBudget);

module.exports = router;
