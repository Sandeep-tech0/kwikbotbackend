const mongoose = require('mongoose');

const connectDB = async (DATABASE_URL) => {
    const options = {
        autoIndex: false, // Don't build indexes
        maxPoolSize: 100, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
    };
    try {
          
        await mongoose.connect(DATABASE_URL,options);
        console.log('Database connected successfully');
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDB;