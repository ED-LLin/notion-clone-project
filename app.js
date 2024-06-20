require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./server/config/db');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const redisClient = require('./server/config/redisClient');

const app = express()
const port = process.env.PORT || 3000;

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI
    })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));

// Swagger API Docs
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Notion-Clone-Project API docs',
      version: '1.0.0',
      description: '這是 Notion-Clone-Project 的 API 文件，提供了使用者認證、筆記管理和搜尋功能的詳細說明。',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./server/routes/*.js', './server/controllers/*.js'], // Added controllers folder
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Static Files
app.use(express.static('public'));
connectDB();

// Template Engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', './layouts/main')

// Routes
app.use('/', require('./server/routes/auth'));
app.use('/', require('./server/routes/dashboard'));
app.use('/', require('./server/routes/index'));
app.use('/', require('./server/routes/redis'));

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`)
})

