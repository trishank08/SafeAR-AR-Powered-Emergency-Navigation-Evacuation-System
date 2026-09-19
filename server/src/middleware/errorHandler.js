export class AppError extends Error{constructor(status,code,message,details){super(message);this.status=status;this.code=code;this.details=details;}}
export function notFound(req,res){res.status(404).json({success:false,error:{code:'NOT_FOUND',message:'Resource not found'}})}
export function errorHandler(err,req,res,next){
  const status=err.status||500; const code=err.code||'INTERNAL_ERROR';
  if(status>=500) req.log?.error({err},'request failed');
  res.status(status).json({success:false,error:{code,message:status>=500&&process.env.NODE_ENV==='production'?'Internal server error':err.message,details:err.details}});
}
