require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");

const { connectDB } = require('./config/db.js');

const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const testRoutes = require('./routes/test');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || '/';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(BASE_URL, express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: true,
    //cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.set("view engine", "ejs");
connectDB();
app.use('/', authRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);
app.use('/test', testRoutes);
app.get('*', (req, res) => {
    res.status(404).send('Page not found');
});
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});