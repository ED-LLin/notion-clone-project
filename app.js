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
const rateLimiter = require('./server/middleware/rateLimiter');
const blacklistChecker = require('./server/middleware/blacklistChecker');
const logger = require('./server/config/logger');

const app = express()
const port = process.env.PORT || 3000;

// 檢查 ip 是否為黑名單
app.use(blacklistChecker);

// 用 rate limiter 限制流量
if (process.env.NODE_ENV !== 'test') {
    app.use(rateLimiter);
} else {
    logger.info('rateLimiter is paused for test');
}

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


// Static Files
app.use(express.static('public'));
connectDB();

// Template Engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', './layouts/main')

// Routes
app.use('/api-docs', require('./server/routes/swagger'));
app.use('/dashboard', require('./server/routes/dashboard'));
app.use('/fetch-content', require('./server/routes/fetchContent'));
app.use('/', require('./server/routes/auth'));
app.use('/', require('./server/routes/index'));
app.use('/', require('./server/routes/redis'));

app.listen(port, '0.0.0.0', () => {
    logger.info(`Server is running on port ${port}`)
});