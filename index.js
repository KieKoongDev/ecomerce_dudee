const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();

app.set("view engine", "ejs");

app.use('/', express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Routes
const prefix = '/v1/api';

app.get('/', (req, res) => {
    res.render('index');
});

app.get(prefix, (req, res) => {
    res.json({
        message: 'server is running',
        status: 200,
        date: new Date()
    });
});

// Connect to MongoDB
require("./db");

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});