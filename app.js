require('dotenv').config()

const express = require('express')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// Static Files
app.use(express.static('public'));


// Template Engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', './layouts/main')

const port = 3000


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

