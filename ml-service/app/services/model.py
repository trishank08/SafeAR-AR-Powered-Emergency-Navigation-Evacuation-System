from pathlib import Path
import joblib, numpy as np
from sklearn.ensemble import RandomForestClassifier
FEATURES=['distance','crowdLevel','hazardDistance','turns','width','floor','stairCount','historicalIncidents','blocked']
MODEL_PATH=Path(__file__).resolve().parents[2]/'risk_model.joblib'

def train():
 rng=np.random.default_rng(42);X=[];y=[]
 for _ in range(2500):
  row=[rng.uniform(20,500),rng.uniform(0,1),rng.uniform(5,150),rng.integers(0,8),rng.uniform(.8,3),rng.integers(0,4),rng.integers(0,5),rng.integers(0,8),rng.integers(0,2)]
  score=.0008*row[0]+.3*row[1]+(.55 if row[2]<20 else .2 if row[2]<50 else 0)+.03*row[3]+max(0,1-row[4]/2)*.08+.03*row[6]+.03*row[7]+row[8]
  X.append(row);y.append(1 if score>.55 else 0)
 m=RandomForestClassifier(n_estimators=160,max_depth=8,random_state=42,class_weight='balanced');m.fit(np.array(X),y);joblib.dump({'model':m,'features':FEATURES},MODEL_PATH);return m

def load(): return joblib.load(MODEL_PATH) if MODEL_PATH.exists() else {'model':train(),'features':FEATURES}
