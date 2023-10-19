const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.createNewUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        // Hash the password with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const newUser = await pool.query(
          "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
          [first_name, last_name, email, hashedPassword]  // Use the hashed password here
        );
    
        res.json(newUser.rows[0]);
    } catch (error) {
        console.error("Error in /api/users post: ", error);
        res.status(500).json({ error: "Internal Server Error." });
    };
};

exports.checkLoginCredentials = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Hash the password with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const newUser = await pool.query(
          "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
          [first_name, last_name, email, hashedPassword]  // Use the hashed password here
        );
    
        res.json(newUser.rows[0]);
    } catch (error) {
        console.error("Error in /api/users post: ", error);
        res.status(500).json({ error: "Internal Server Error." });
    };
};
