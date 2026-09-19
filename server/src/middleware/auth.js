import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';
export function auth(req,res,next){try{const h=req.headers.authorization||'';if(!h.startsWith('Bearer ')) throw new AppError(401,'AUTH_REQUIRED','Authentication required');req.user=jwt.verify(h.slice(7),env.JWT_SECRET);next()}catch(e){next(new AppError(401,'AUTH_INVALID','Invalid or expired authentication'))}}
export function requireRole(...roles){return (req,res,next)=>{if(!req.user||!roles.includes(req.user.role)) return next(new AppError(403,'FORBIDDEN','Insufficient permissions'));next()}}
