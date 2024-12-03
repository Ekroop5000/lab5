const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

passport.use(new LocalStrategy(
    {
        usernameField: 'username', // Field used for username
        passwordField: 'password' // Field used for password
    },
    async (username, password, done) => {
        try {
            // Find the user by username
            const user = await User.findOne({ username });
            
            if (!user) {
                console.log(`User with username ${username} not found.`);
                return done(null, false, { message: 'Incorrect username or password.' });
            }

            console.log(`User found: ${user.username}, password hash: ${user.password}`);

            // Compare the entered password with the stored hashed password
            const isMatch = await bcrypt.compare(password, user.password);
            console.log(`Password comparison: ${isMatch}`);

            if (!isMatch) {
                console.log(`Password mismatch for username: ${username}`);
                return done(null, false, { message: 'Incorrect username or password.' });
            }

            // Successfully authenticated, return the user
            console.log(`Login successful for username: ${username}`);
            return done(null, user);
        } catch (err) {
            console.error(`Error during authentication: ${err.message}`);
            return done(err);
        }
    }
));

// Serialize user into the session
passport.serializeUser((user, done) => {
    done(null, user.id); // Store the user's ID in the session
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Fetch the user from the database by ID
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});