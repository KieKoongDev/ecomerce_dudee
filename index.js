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
    res.render('index', {
        version: process.env.npm_package_version,
    });
});

app.get(prefix, (req, res) => {
    res.json({
        message: 'server is running',
        version: process.env.npm_package_version,
        status: 200,
        date: new Date()
    });
});

app.use(`${prefix}/users`, require("./routes/userRoute"));
app.use(`${prefix}/user-logs`, require("./routes/userLogRoute"));
app.use(`${prefix}/auth`, require("./routes/authRoute"));
app.use(`${prefix}/products`, require("./routes/productRoute"));

// Connect to MongoDB
require("./db");

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});