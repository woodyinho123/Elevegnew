//db.js

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://eleveg10:eleveg@cluster0.z9ghmo4.mongodb.net/ElevegDatabase', {
        
            
        });
        console.log('MongoDB connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
