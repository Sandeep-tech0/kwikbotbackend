const express= require('express');
const cors=require('cors');
const corsOptions = require('./src/config/cors');

const app=express();
app.use(cors(corsOptions));


require('./src/api/v1/routes')(app)

module.exports = app;