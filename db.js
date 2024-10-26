const mongoose = require("mongoose");

const db_uri = process.env.MONGODB_URI;

mongoose.connect(db_uri).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});