const path = require('path');
const express = require('express');
const blogRoutes = require('./routes/main');
const db = require('./data/database');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();

app.use(cookieParser())
// Activate EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static('public')); // Serve static files (e.g. CSS files)
app.use(blogRoutes);
app.use(function (error, req, res, next) {
    // Default error handling function
    // Will become active whenever any route / middleware crashes
    console.log(error);
    res.status(500).render('500');
});

const port = process.env.APP_PORT;

db.connectToDb().then(function () {
    console.log(`App Started [http://localhost:${port}/]`)
    console.log(`Database ${db.database_name} Connected`)
    app.listen(port);
});