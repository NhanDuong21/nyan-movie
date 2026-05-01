require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

global.io = io;

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_movie', (movieId) => {
        socket.join(`movie_${movieId}`);
    });

    socket.on('leave_movie', (movieId) => {
        socket.leave(`movie_${movieId}`);
    });

    socket.on('typing', ({ movieId, username }) => {
        socket.to(`movie_${movieId}`).emit('user_typing', { username });
    });

    socket.on('stop_typing', ({ movieId, username }) => {
        socket.to(`movie_${movieId}`).emit('user_stop_typing', { username });
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

connectDB().then(() => {
    connectRedis();
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error('Failed to connect to the database. Server not started.', error);
    process.exit(1);
});
