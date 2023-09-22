const app = require('./app');

const connectDB=require('./src/config/connectDb')
const schedule = require('./src/api/v1/services/schedulerService');


require('dotenv').config();

const PORT = process.env.PORT || 3000;

const DATABASE_URL = process.env.DATABASE_URL||"mongodb://localhost:27017/kwikbot";
//database Connection

app.listen(PORT, ()=>{
        connectDB(DATABASE_URL);
    schedule.schedule();

    console.log(`Server is running on port ${PORT}`)
})