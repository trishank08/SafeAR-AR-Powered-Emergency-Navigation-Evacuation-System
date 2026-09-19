import mongoose from 'mongoose';
import { env } from './env.js';
export async function connectDb(){
  mongoose.set('strictQuery',true);
  await mongoose.connect(env.MONGODB_URI,{serverSelectionTimeoutMS:5000,connectTimeoutMS:5000});
  console.log('MongoDB connected');
}
export async function disconnectDb(){if(mongoose.connection.readyState) await mongoose.disconnect();}
