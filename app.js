const express = require('express');
const bodyParser = require('body-parser');
const envelopeRoutes = require('./routes/envelopeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/envelopes', envelopeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

