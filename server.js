const app = require('./src/app');
const port = 3001;
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});