const mongoose = require('mongoose');
require('dotenv').config();

function mongooseConnect() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    } else {
        const uri = process.env.MONGODB_URI;
        return mongoose.connect(uri); 
    }
};

module.exports = mongooseConnect;


