const express = require('express');
const languagesRoutes = require('./routes/languages');
const wordsRoutes = require('./routes/words');
const translationsRoutes = require('./routes/translations');

const app = express();

app.use(express.json());

app.use('/languages', languagesRoutes);
app.use('/words', wordsRoutes);
app.use('/translations', translationsRoutes);

module.exports = app;