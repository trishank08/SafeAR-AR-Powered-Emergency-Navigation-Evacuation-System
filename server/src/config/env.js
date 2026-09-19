import 'dotenv/config';
import { z } from 'zod';
const schema=z.object({NODE_ENV:z.enum(['development','test','production']).default('development'),PORT:z.coerce.number().default(5000),MONGODB_URI:z.string().default('mongodb://127.0.0.1:27017/safear'),JWT_SECRET:z.string().min(16).default('dev-only-change-me-please-123456'),CLIENT_ORIGIN:z.string().default('http://localhost:5173'),ML_SERVICE_URL:z.string().default('http://127.0.0.1:8000'),OPENAI_API_KEY:z.string().optional(),VAPI_API_KEY:z.string().optional(),GOOGLE_MAPS_API_KEY:z.string().optional()});
export const env=schema.parse(process.env);
