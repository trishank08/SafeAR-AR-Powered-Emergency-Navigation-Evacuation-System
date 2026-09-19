import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ShieldCheck, MapPinned, Mic, AlertTriangle, LogOut, Navigation, HeartPulse, DoorOpen, RefreshCw, UserPlus, LogIn, LoaderCircle } from 'lucide-react';
import { api, setToken, getToken } from './services/api';
import './styles.css';

const DEMO = { email: 'user@safear.local', password: 'User@12345' };

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(mode === 'login' ? DEMO : { name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(mode === 'login' ? DEMO : { name: '', email: '', password: '' });
    setError('');
  }, [mode]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' ? form : { name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password };
      const result = await api(path, { method: 'POST', body });
      if (mode === 'register') {
        setMode('login');
        setForm({ email: body.email, password: body.password });
        setError('Account created. You can now sign in.');
        return;
      }
      setToken(result.data.token);
      localStorage.setItem('safear_user', JSON.stringify(result.data.user));
      onAuthenticated(result.data.user);
    } catch (err) {
      setError(err.message || 'Unable to complete authentication.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="brand"><ShieldCheck /> SAFEAR</div>
        <p className="eyebrow">Emergency navigation platform</p>
        <h1>Move toward safety with confidence.</h1>
        <p>Hazard-aware routing, live updates and AR-ready navigation for controlled environments.</p>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}><LogIn size={16} /> Sign in</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}><UserPlus size={16} /> Sign up</button>
        </div>

        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && <input required minLength="2" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />}
          <input required type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input required minLength="8" type="password" placeholder="Password (8+ characters)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button className="primary auth-submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={17} /> Please wait…</> : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>

        {mode === 'login' && <button className="demo-link" onClick={() => setForm(DEMO)}>Use demo account · user@safear.local</button>}
        {error && <div className={error.startsWith('Account created') ? 'success-alert' : 'alert'}><AlertTriangle size={16} />{error}</div>}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('safear_user') || 'null'));
  const [buildings, setBuildings] = useState([]), [hazards, setHazards] = useState([]), [facilities, setFacilities] = useState([]), [locations, setLocations] = useState([]);
  const [text, setText] = useState(''), [route, setRoute] = useState(null), [loading, setLoading] = useState(false), [error, setError] = useState('');
  const [hazardName, setHazardName] = useState('Fire detected in Corridor B'), [hazardWaypoint, setHazardWaypoint] = useState('');

  const load = async () => {
    if (!getToken()) return;
    try {
      setError('');
      const [b, h, f, l] = await Promise.all([api('/buildings'), api('/hazards?active=true'), api('/emergency-facilities'), api('/locations')]);
      setBuildings(b.data || []); setHazards(h.data || []); setFacilities(f.data || []); setLocations(l.data || []);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { if (user) load(); }, [user]);

  const logout = () => { setToken(''); localStorage.removeItem('safear_user'); setUser(null); setRoute(null); };

  async function voice() { if (!text.trim()) return; try { const r = await api('/voice/intent', { method: 'POST', body: { text } }); setText(`${r.data.intent.replaceAll('_', ' ')} • ${r.data.priority}`); } catch (e) { setError(e.message); } }

  async function createHazard() {
    if (!hazardWaypoint) return setError('Select a corridor waypoint first');
    try { await api('/hazards', { method: 'POST', body: { buildingId: buildings[0]?._id, waypointIds: [hazardWaypoint], name: hazardName, severity: 'HIGH', active: true } }); await load(); }
    catch (e) { setError(e.message); }
  }

  async function calculate() {
    if (!buildings[0] || !facilities.length || !locations.length) return setError('Demo data is not loaded. Start MongoDB and run npm run seed.');
    setLoading(true); setError('');
    try {
      const start = locations.find(w => w.name === 'Lobby') || locations[0];
      const r = await api('/routes/calculate', { method: 'POST', body: { buildingId: buildings[0]._id, startWaypointId: start._id, facilityType: 'EXIT' } });
      setRoute(r.data);
    } catch (e) { setError(e.message); setRoute(null); } finally { setLoading(false); }
  }

  if (!user) return <Auth onAuthenticated={setUser} />;

  return <div><header><div className="brand"><ShieldCheck /> SAFEAR</div><nav><span>Explore</span><span>Emergency</span><span>Help</span></nav><button className="icon" onClick={logout}><LogOut size={18} /></button></header><main>
    <section className="hero"><div><p className="eyebrow">{user.role === 'ADMIN' ? 'ADMIN CONSOLE' : 'CAMPUS SAFETY'}</p><h1>Where do you need to go?</h1><p className="muted">Find a configured emergency destination. SafeAR evaluates available routes against active hazards.</p><div className="search"><input placeholder="Emergency exit, first aid, assembly point…" value={text} onChange={e => setText(e.target.value)} /><button className="voice" onClick={voice}><Mic size={18} /> Voice</button></div></div><div className="status"><span className="dot" /> Live system<br /><b>{hazards.length} active hazards</b></div></section>
    <section className="quick"><button onClick={calculate}><DoorOpen /><span>Emergency Exit</span></button><button><HeartPulse /><span>First Aid</span></button><button><MapPinned /><span>Assembly Point</span></button><button><AlertTriangle /><span>Report Hazard</span></button></section>
    {user.role === 'ADMIN' && <section className="admin-card"><div><p className="eyebrow">ADMIN</p><h3>Broadcast a real hazard</h3><p className="muted">Writes to MongoDB and emits Socket.IO updates.</p></div><input value={hazardName} onChange={e => setHazardName(e.target.value)} placeholder="Hazard description" /><select value={hazardWaypoint} onChange={e => setHazardWaypoint(e.target.value)}><option value="">Select corridor</option>{locations.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}</select><button className="primary" onClick={createHazard}>Create hazard</button></section>}
    {error && <div className="alert"><AlertTriangle size={18} />{error}<button onClick={load}><RefreshCw size={16} /></button></div>}
    <section className="grid"><div className="map"><div className="map-top"><div><b>{buildings[0]?.name || 'CSE Building'}</b><small>Controlled campus map</small></div><button className="small" onClick={load}><RefreshCw size={16} /></button></div><div className="map-canvas"><div className="building"><div className="hall">LOBBY</div><div className="corridor safe">CORRIDOR A</div><div className={`corridor ${hazards.length ? 'danger' : ''}`}>CORRIDOR B</div><div className="exit">EXIT A</div><div className="first">FIRST AID</div></div><div className="map-label user"><Navigation size={15} /> You</div>{hazards.map(h => <div key={h._id} className="hazard-dot"><AlertTriangle size={15} />{h.name}</div>)}</div></div>
    <aside><div className="panel"><div className="panel-title"><b>Nearby</b><span>{facilities.length} configured</span></div>{facilities.slice(0, 4).map(f => <div className="facility" key={f._id}><div className="facility-icon"><DoorOpen size={17} /></div><div><b>{f.name}</b><small>{f.type.replaceAll('_', ' ')} · accessible</small></div><span>→</span></div>)}</div>{route && <div className="route-card"><span className="pill">RECOMMENDED</span><h3>{route.facility.name}</h3><div className="route-meta">{Math.round(route.distance)}m · {route.risk.riskLevel} RISK</div><button className="primary" disabled={loading}><Navigation size={17} /> Start AR navigation</button><small>Route source: {route.risk.source}. AR positioning remains device/environment dependent.</small></div>}</aside></section>
  </main></div>;
}

createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>);
