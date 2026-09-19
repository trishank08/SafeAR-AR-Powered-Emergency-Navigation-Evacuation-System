# API notes
All JSON responses use `{success:true,data:...}` or `{success:false,error:{code,message}}`.
Protected endpoints require `Authorization: Bearer <JWT>`.
Hazard mutation endpoints require the ADMIN role.
