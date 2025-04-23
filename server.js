require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/', require('./routes/auth.js'));

require('./db');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

