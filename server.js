const express = require('express');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/db');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();

// Connect to the database
connectDB();

// Initialize passport
require('./config/passport');  // Initialize passport (make sure passport.js is correct)

// Set view engine (assuming you are using EJS for views)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret',  // Use env variable for security
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Mount the auth routes
app.use('/auth', authRoutes);

// Serve the homepage
app.get('/', (req, res) => {
    const welcomeTitle = "Welcome to the Application!";
    res.send(`
        <html>
            <head>
                <title>Homepage</title>
                <style>
                    .welcome-title {
                        font-weight: bold;
                        font-size: 32px;
                        margin-bottom: 20px;
                    }
                </style>
            </head>
            <body>
                <br>
                <div class="welcome-title">${welcomeTitle}</div>

                <p>Hello, and welcome to the Application! If you want to view the whole and complete Application, you 
                    have to go to the 
                    <a href="/auth/signup">Sign Up Page</a> to create an account.
                </p>
            </body>
        </html>
    `);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));