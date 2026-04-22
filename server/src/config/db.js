const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Drop old text index to apply new language_override logic
        try {
            await mongoose.connection.collection('movies').dropIndex('title_text_slug_1');
            console.log('Old movie text index dropped successfully');
        } catch (err) {
            // Index might not exist, ignore
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
