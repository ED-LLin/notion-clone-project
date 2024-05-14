require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./server/config/db');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');

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



// Static Files
app.use(express.static('public'));
connectDB();

// Template Engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', './layouts/main')

// Routes
app.use('/', require('./server/routes/auth'));
app.use('/', require('./server/routes/index'));
app.use('/', require('./server/routes/dashboard'));


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

