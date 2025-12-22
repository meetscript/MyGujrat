import {Server} from "socket.io";
import express from "express";
import http from "http";
import cors from "cors";

const app = express();
app.use(cors({  origin:process.env.NODE_ENV==="production"?true:"http://localhost:5173", credentials: true }));
const server = http.createServer(app);

const io = new Server(server, {
  cors: { 
    origin:process.env.NODE_ENV==="production"?true:"http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});


const userSocketMap = {} ; 

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on('connection', (socket)=>{
    console.log("✅ User connected:", socket.id);
    const userId = socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id;
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect',()=>{
        if(userId){
            delete userSocketMap[userId];
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
})

export {app, server, io};