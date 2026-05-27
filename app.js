const express=require('express');
const connectDb = require('./app/config/db');
const dotenv=require('dotenv')
const path=require('path');
const fs=require('fs')
dotenv.config()
const app=express()
connectDb()

// static
app.use('uploads',express.static(path.join(__dirname,'/uploads')))
app.use('/uploads',express.static('uploads'))
// set body parser
app.use(express.json({
    limit:'50mb',
    extended:true
}));
app.use(express.urlencoded({extended:true}))

app.use('/api/auth', require('./app/router/authRoutes'));
app.use('/api/questions', require('./app/router/questionRoutes'));
app.use('/api/categories', require('./app/router/categoryRoutes'));



const PORT=7005;
app.listen(PORT,()=>{
    console.log(`server is running on Port ${PORT}`);
})