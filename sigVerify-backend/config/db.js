require('dotenv').config();
const Pool = require('pg').Pool;

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: "localhost",
    port: 5432,
    database: "sigverifydb"
});

module.exports = pool;