const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerOptions = require('../config/swaggerConfig');

const swaggerDocs = swaggerJsdoc(swaggerOptions);

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = router;
