const { response } = require('express');
const pool = require('../db/index.js');
const bcrypt=require('bcryptjs');
const axios  = require('axios');
const jwt=require('jsonwebtoken');

// it shows the register page
exports.getRegister=(req,res)=>{
    res.render('register');
}

// handling the register form submission
exports.postRegister=async(req,res)=>{
    const {username,email,password}=req.body;

    if(!username || !email || !password){
        return res.status(400).send("Please fill all the fields");

    }

    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        return res.status(400).send("Please enter a valid email address");
    }

    if(password.length<6){
        return res.status(400).send("Password must be at least 6 characters long");
    }

    try {

        // if user already exists
        const exisitingUser=await pool.query(
            'SELECT * FROM users WHERE username=$1 or email=$2',
            [username,email]
        );

        if(exisitingUser.rows.length>0){
            return res.status(400).send("User already exists with this username or email");
        }

        // hash the password
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        // create a new user
        await pool.query(
            'INSERT INTO users (username,email,password) VALUES ($1,$2,$3)',
            [username,email,hashedPassword]
        );

        res.status(201).send("User registered successfully");
        
    } catch (error) {
        console.error("Registration error=>",error);
        res.status(500).send("Somehting went wrong. Please try again");
    }
}

// it shows the login page
exports.getLogin=(req,res)=>{
    res.render('login');
}

// handling the login form submission
exports.postLogin=async(req,res)=>{
    const {username, password, 'g-recaptcha-response': recaptchaToken} = req.body;

    if(!username || !password || !recaptchaToken){
        return res.status(400).send("Please fill all the fields");
    }

    try {
        // verify recatcha
        const {data}=await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null,{
            params:{
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: recaptchaToken
            },
        });

        if(!data.success){
            return res.status(400).send("Recaptcha verification failed. Please try again");
        }

        // find the user
        const result=await pool.query(
            'SELECT * FROM users WHERE username = $1 or email = $1',
            [username]
        );

        if(result.rows.length===0){
            return res.status(400).send("User not found. Please register first");
        }

        const user=result.rows[0];

        // check if the password is correct
        const validPassword=await bcrypt.compare(password,user.password);
        if(!validPassword){
            return res.status(400).send("Invalid password. Please try again");
        }

        //create a jwt
        const token=jwt.sign(
            {id: user.id, username: user.username, email: user.email},
            process.env.JWT_SECRET_KEY,
            {expiresIn: '5m'}
        );

        // set the token in a cookie
        res.cookie('token', token,{httpOnly: true});
        res.redirect('/profile');
        
    } catch (error) {
        console.error("Login error=>",error);
        res.status(500).send("Somehting went wrong. Please try again");
    }
}

exports.getProfile=async(req,res)=>{
    try {
        const {id}=req.user;

        const result=await pool.query(
            'SELECT id, username, email FROM users WHERE id = $1',
            [id]
        );

        if(result.rows.length===0){
            return res.redirect('/login');
        }

        const user=result.rows[0];
        res.render('profile', {user});
        
    } catch (error) {
        console.error("Profile error=>",error);
        res.status(500).send("Somehting went wrong. Please try again");
    }
}

// clearing the cookie and redirecting to login page
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
  };
  
