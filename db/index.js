const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

pool.connect()
.then(()=>{
    console.log('Connected to the database');
})
.catch((err)=>{
    console.error('Error connecting to the database', err);
});

module.exports = pool;