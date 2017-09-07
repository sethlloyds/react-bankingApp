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
passport.use(new Auth0Strategy({
    domain: process.env.AUTH_DOMAIN,
    clientID: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    callbackURL: process.env.AUTH_CALLBACK
}, function(accessToken, 
        refreshToken, 
        extraParams, 
        profile, 
        done) {
    const db = app.get('db');

    db.find_user(profile.id).then( user => {
        if(user[0]) {
            return done(null, user);
        } else {
            db.creat_user([profile.displayName, profile.emails[0].value, profile.picture, profile.id]).then( user => {
                return done(null, user[0]);
            })
        }
    })
}))

// THIS IS INVOKED ONE TIME TO SET THINGS UP
passport.serializeUser(function(user, done) {
    done(null, user)
})

// USER COMES FROM SESSION - THIS IS INVOKED FOR EVERY ENDPOINT
passport.deserializeUser(function(user, done) {
    console.log(user)
    app.get('db').find_session_user(user[0].id).then( user => {
        return done(null, user[0]);
    })
})

app.get('/auth', passport.authenticate('auth0'));

app.get('/auth/callback', passport.authenticate('auth0', {
    successRedirect: 'http://localhost:3000/#/private',
    failureRedirect: 'http://localhost:3000/#/'
}))

app.get('auth/me', (req, res) => {
    if(!req.user) {
        return res.status(404).send('User not found')
    } else {
        return res.status(200).send(req.user)
    }
})

app.get('/auth/logout', (req, res) => {
    req.logOut() // Passport gives us this to terminate a login session.
    return res.redirect(302, 'http://localhost:3000/#/');
    // res.redirect comes from express to redirect the user to the given URL. 302 is the default status code for res.redirect.
})

let PORT = 3005;
app.listen(PORT, () => {
    console.log(`List'n'n on ye olde port: ${PORT}`);
})
