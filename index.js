const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path'); // Import path module

const PORT = process.env.PORT || 8080; // Use environment port

const mongoURI = process.env.MONGODB_URI; // Use environment variable for MongoDB URI

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

// Create HTTP server
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Welcome to the Chat App!</h1>');
    } else {
        const filePath = path.join(__dirname, 'public', req.url);
        res.sendFile(filePath, (err) => {
            if (err) {
                res.writeHead(err.status, err.statusText);
                res.end();
            }
        });
    }
});

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const users = {};

io.on('connection', socket => {
    socket.on('new-user-joined', async (name) => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);

        try {
            const messages = await Message.find().sort({ timestamp: 1 }).limit(10);
            socket.emit('previous-messages', messages);
        } catch (error) {
            console.error('Error fetching previous messages:', error);
        }
    });

    socket.on('send', (message) => {
        const newMessage = new Message({
            name: users[socket.id],
            message: message,
        });

        newMessage.save()
            .then(() => {
                socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
            })
            .catch((error) => console.error('Error saving message:', error));
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
});

// Listen on the specified port
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
