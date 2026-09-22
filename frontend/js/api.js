const API_BASE = (window.location.protocol !== 'file:' &&
  (window.location.port === '8080' || window.location.port === '80' || window.location.port === ''))
  ? window.location.origin
  : 'http://localhost:3000';

const api = {
  async post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  async get(path) {
    const res = await fetch(`${API_BASE}${path}`);
    return res.json();
  },

  startSimulation(data)       { return this.post('/simulation/start', data); },
  addProcess(data)            { return this.post('/simulation/process', data); },
  resetSimulation()           { return this.post('/simulation/reset', {}); },
  stopSimulation()            { return this.post('/simulation/stop', {}); },
  blockCurrentProcess()       { return this.post('/simulation/block-current', {}); },
  triggerInterruption(data)   { return this.post('/interruptions/trigger', data); },
  getVectorTable()            { return this.get('/interruptions/vector-table'); },
  getState()                  { return this.get('/simulation/state'); },
};
