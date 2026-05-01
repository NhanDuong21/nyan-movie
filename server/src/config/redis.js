const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Redis Client Connected successfully.');
});

redisClient.on('ready', () => {
    console.log('Redis Client is ready to use.');
});

redisClient.on('end', () => {
    console.log('Redis Client connection closed.');
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
};

module.exports = { redisClient, connectRedis };
