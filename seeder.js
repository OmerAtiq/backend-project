const fs = require('fs')
const mongoose = require('mongoose')
const colors = require ('colors')
const dotenv = require ('dotenv')
//load env file
dotenv.config({path : './config/config.env'})

//load models
 const Bootcamp = require ('./model/bootcamp.js')
const Course = require('./model/course')
const User = require('./model/User.js')
const Review = require('./model/Review')

 //connect to db
 mongoose.connect(process.env.MONGOURL)

 //read json
 
 const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/data/bootcamps.json`, 'utf-8'))

 const courses = JSON.parse(fs.readFileSync(`${__dirname}/data/courses.json`, 'utf-8'));

 const users = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8'));

 const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));
 

 const importData = async () => {
     try{
         await Bootcamp.create(bootcamps)
         await Course.create(courses)
         await User.create(users)
         await Review.create(reviews);
         console.log('Data imported....'.green.inverse)
         process.exit(1)
     }
     catch(err){
         console.log(err)
     }
 }

 const deleteData = async () =>{
     try{
         await Bootcamp.deleteMany()
         await Course.deleteMany()
         await User.deleteMany()
         await Review.deleteMany();
         console.log('Data Destroyed....'.red.inverse)
     }
     catch(err){
         console.log(err)
     }
 }

 if(process.argv[2] === '-i'){
     importData()
 }
 else if(process.argv[2] === '-d'){
     deleteData()
 }