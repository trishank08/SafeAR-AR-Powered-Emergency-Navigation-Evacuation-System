import http from 'http';import {Server} from 'socket.io';import {createApp} from './app.js';import {connectDb,disconnectDb} from './config/db.js';import {env} from './config/env.js';
const app=createApp();const server=http.createServer(app);const io=new Server(server,{cors:{origin:env.CLIENT_ORIGIN}});app.set('io',io);io.on('connection',socket=>{socket.on('join-building',id=>socket.join(`building:${id}`));});
let mongoStatus=false;app.set('mongoStatus',false);try{await connectDb();mongoStatus=true;app.set('mongoStatus',true)}catch(e){console.error('MongoDB unavailable; API still starts but DB-backed endpoints will fail until MongoDB is available.');}
server.listen(env.PORT,()=>console.log(`SafeAR API listening on http://localhost:${env.PORT}`));
async function shutdown(){server.close();await disconnectDb();process.exit(0)}process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
