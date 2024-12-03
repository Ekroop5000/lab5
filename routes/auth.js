const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Signup Page
router.get('/signup', (req, res) => {
    res.render('signup');
});

// Signup Action
router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password }); // No need to hash here anymore
        await user.save();
        res.redirect('/auth/login');
    } catch (error) {
        res.status(400).send('Error during signup: ' + error.message);
    }
});

// Login Page
router.get('/login', (req, res) => {
    res.render('login', { errorMessage: null, username: null, password: null }); // Pass null initially for username, password, and errorMessage
});

// Login Action (Single Route)
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    try {
        // Log incoming data for debugging
        console.log('Login attempt with username:', username);

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            // User not found
            console.log('User not found');
            return res.render('login', { 
                errorMessage: 'Incorrect username or password.',
                username: username, // Pass username back to retain in the form
                password: password  // Pass password back to retain in the form
            });
        }

        // Log the user found for debugging
        console.log('User found:', user);

        // Compare password with stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch');
            return res.render('login', { 
                errorMessage: 'Incorrect username or password.',
                username: username, // Pass username back to retain in the form
                password: password  // Pass password back to retain in the form
            });
        }

        // If username and password match, log the user in manually
        console.log('Login successful');
        req.login(user, (err) => {
            if (err) return next(err);
            return res.redirect('/auth/welcome'); // Redirect to the welcome page after successful login
        });
    } catch (err) {
        console.error('Login error:', err);
        return next(err); // Handle any errors (like database issues)
    }
});

// Welcome Page
router.get('/welcome', (req, res) => {
    if (req.user) {
        res.render('welcome', { username: req.user.username }); // Render welcome with username
    } else {
        res.redirect('/auth/login'); // Redirect to login if not authenticated
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send('Error logging out: ' + err);
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;