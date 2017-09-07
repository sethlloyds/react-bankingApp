require('dotenv').config()

const express = require('express')
    , bodyParser = require('body-parser')
    , passport = require('passport')
    , Auth0Strategy = require('passport-auth0')
    , massive = require('massive')
    , session = require('express-session');

const app = express()

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());





// DATABASE CONNECTION
massive(process.env.CONNECTIONSTRING).then( db => {
    app.set('db', db);
})

// AUTHENTICATION



let PORT = 3005;
app.listen(PORT, () => {
    console.log(`Listenin' on ye olde port: ${PORT}`);
})
