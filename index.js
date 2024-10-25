
//done this cors to manage the error of cross origin resource sharing error 
const io = require('socket.io')(8080,{
    cors:{
        origin:"*"
    }
});

const mongoose = require('mongoose');
const mongoURI='mongodb+srv://avacadohmm:zqt422ScUKQxHwRn@cluster0.anwcb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Define the schema for messages
const messageSchema = new mongoose.Schema({
  name: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

// Create a model from the schema to interact with the messages collection in MongoDB
const Message = mongoose.model('Message', messageSchema);


//const mongoURI = 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/chatApp?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error('Error connecting to MongoDB Atlas:', error));











// const cors=require('cors');
// io.use(cors());
const users={}

io.on('connection',socket =>{
    socket.on('new-user-joined', async (name) => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
      
        // Fetch previous messages from MongoDB and send them to the newly joined user
        try {
          const messages = await Message.find().sort({ timestamp: 1 }).limit(10);
          socket.emit('previous-messages', messages);
        } catch (error) {
          console.error('Error fetching previous messages:', error);
        }
      });
      
socket.on('send', (message) => {
    // Create a new message document with the user's name and message
    const newMessage = new Message({
      name: users[socket.id],
      message: message,
    });

    // Save the message to MongoDB
    newMessage.save()
      .then(() => {
        // Broadcast the message to all other users
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
      })
      .catch((error) => console.error('Error saving message:', error));
  });
socket.on('disconnect',message=>{
    socket.broadcast.emit('left',users[socket.id]);
    delete users[socket.id];
});
})
