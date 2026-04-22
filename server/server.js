require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Expose io globally so controllers can emit events
global.io = io;

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a movie room for real-time comments
    socket.on('join_movie', (movieId) => {
        socket.join(`movie_${movieId}`);
    });

    // Leave a movie room
    socket.on('leave_movie', (movieId) => {
        socket.leave(`movie_${movieId}`);
    });

    // Typing indicators
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

// Connect to MongoDB, then start server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error('Failed to connect to the database. Server not started.', error);
    process.exit(1);
});
