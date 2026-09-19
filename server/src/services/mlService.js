import { env } from '../config/env.js';
import { calculateRisk } from './routeEngine.js';
export async function predictRisk(features){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),2500);try{const r=await fetch(`${env.ML_SERVICE_URL}/predict`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(features),signal:controller.signal});if(!r.ok)throw new Error(`ML ${r.status}`);return {...await r.json(),source:'ml'};}catch{return {...calculateRisk(features),source:'fallback'};}finally{clearTimeout(timer)}}
