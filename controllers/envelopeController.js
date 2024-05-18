let envelopes = [];

exports.createEnvelope = (req, res) => {
  const { name, amount } = req.body;
  const envelope = { id: Date.now().toString(), name, amount };
  envelopes.push(envelope);
  res.status(201).json(envelope);
};

exports.getAllEnvelopes = (req, res) => {
  res.status(200).json(envelopes);
};

exports.getEnvelopeById = (req, res) => {
  const envelope = envelopes.find(env => env.id === req.params.id);
  if (!envelope) {
    return res.status(404).json({ message: 'Envelope not found' });
  }
  res.status(200).json(envelope);
};

exports.updateEnvelope = (req, res) => {
  const envelopeIndex = envelopes.findIndex(env => env.id === req.params.id);
  if (envelopeIndex === -1) {
    return res.status(404).json({ message: 'Envelope not found' });
  }
  const updatedEnvelope = { ...envelopes[envelopeIndex], ...req.body };
  envelopes[envelopeIndex] = updatedEnvelope;
  res.status(200).json(updatedEnvelope);
};

exports.deleteEnvelope = (req, res) => {
  const envelopeIndex = envelopes.findIndex(env => env.id === req.params.id);
  if (envelopeIndex === -1) {
    return res.status(404).json({ message: 'Envelope not found' });
  }
  envelopes.splice(envelopeIndex, 1);
  res.status(204).json();
};

exports.transferBudget = (req, res) => {
  const { from, to, amount } = req.body;
  const fromEnvelope = envelopes.find(env => env.id === from);
  const toEnvelope = envelopes.find(env => env.id === to);
  if (!fromEnvelope || !toEnvelope) {
    return res.status(404).json({ message: 'Envelope not found' });
  }
  if (fromEnvelope.amount < amount) {
    return res.status(400).json({ message: 'Insufficient funds in the source envelope' });
  }
  fromEnvelope.amount -= amount;
  toEnvelope.amount += amount;
  res.status(200).json({ message: 'Budget transferred successfully' });
};
