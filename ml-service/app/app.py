from flask import Flask,request,jsonify
from flask_cors import CORS
from .services.model import load,FEATURES
app=Flask(__name__);CORS(app);bundle=load();model=bundle['model']
@app.get('/health')
def health(): return jsonify({'status':'ok','model':'random_forest','features':FEATURES})
@app.post('/predict')
def predict():
 data=request.get_json(silent=True) or {}
 try:
  row=[[float(data.get(f,0)) for f in FEATURES]];p=float(model.predict_proba(row)[0][1]);level='LOW' if p<.3 else 'MEDIUM' if p<.6 else 'HIGH' if p<.8 else 'CRITICAL';return jsonify({'risk_score':round(p,3),'risk_level':level,'source':'ml'})
 except Exception as e:return jsonify({'error':'INVALID_FEATURES','message':str(e)}),400
if __name__=='__main__': app.run(host='0.0.0.0',port=8000)
