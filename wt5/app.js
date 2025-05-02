// app.js - Main server file
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Mock user database (replace with real database in production)
const users = [
  { username: 'admin', password: 'password123' },
  { username: 'user', password: 'user123' }
];

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'pentex-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Middleware to make user info available to all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.isLoggedIn = req.session.isLoggedIn;
  next();
});

// Routes
// Home page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Login page route
app.get('/login', (req, res) => {
  // If user is already logged in, redirect to home
  if (req.session.isLoggedIn) {
    return res.redirect('/?success=You are already logged in');
  }
  
  // Serve the login page
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// GET method - handles logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/?success=You have been successfully logged out');
});

// POST method - processes login form submission
app.post('/login', (req, res) => {
  const { username, password, rememberMe } = req.body;
  
  // Find user in our mock database
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Set session variables
    req.session.isLoggedIn = true;
    req.session.user = { username: username };
    
    // If remember me is checked, extend session time
    if (rememberMe) {
      req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    }
    
    // Redirect to home with success message
    res.redirect('/?success=Welcome back, ' + username + '!');
  } else {
    // Redirect back to login with error
    res.redirect('/login?error=Invalid username or password');
  }
});

// API endpoint to check login status
app.get('/api/user', (req, res) => {
  if (req.session.isLoggedIn) {
    res.json({
      isLoggedIn: true,
      username: req.session.user.username
    });
  } else {
    res.json({
      isLoggedIn: false
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});