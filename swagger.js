const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Languages API',
      version: '1.0.0',
    },
  },
  apis: ['./app.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

module.exports = swaggerDocs;