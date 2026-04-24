const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        try {
            const indexes = await mongoose.connection.collection('movies').indexInformation();
            if (Object.keys(indexes).includes('title_text')) {
                await mongoose.connection.collection('movies').dropIndex('title_text');
            }
        } catch (err) {
            // Index might not exist, ignore
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
