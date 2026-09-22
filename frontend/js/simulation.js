/* ==========================================
   simulation.js — Main UI Controller
   ========================================== */

// Auto-detect backend URL:
// - file:// (abrir directo) → dev local en :3000
// - puerto 8080/80/443 (Docker/nginx) → mismo origen
// - cualquier otro puerto (ej: :5500 Live Server) → dev local en :3000
const API_BASE_URL = (window.location.protocol !== 'file:' &&
  (window.location.port === '8080' || window.location.port === '80' || window.location.port === ''))
  ? window.location.origin
  : 'http://localhost:3000';

let ws            = null;
let pendingProcs  = [];
let pidCounter    = 1;
let globalQuantum = 4;
let quantumUsed   = 0;

// ── DOM ───────────────────────────────────
const $ = id => document.getElementById(id);

// ── INIT ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadVectorTable();
  bindEvents();
  updatePendingUI();
});

// ── EVENT BINDING ─────────────────────────
function bindEvents() {
  $('btnDemo').addEventListener('click', handleDemo);
  $('btnDismissGuide').addEventListener('click', () => $('guideBanner').style.display = 'none');

  $('btnAddProcess').addEventListener('click', handleAddProcess);
  $('btnStart').addEventListener('click',  handleStart);
  $('btnStop').addEventListener('click',   handleStop);
  $('btnReset').addEventListener('click',  handleReset);

  $('btnTimerInt').addEventListener('click',     () => triggerInterrupt('TIMER'));
  $('btnIoInt').addEventListener('click',        () => triggerInterrupt('IO_COMPLETED'));
  $('btnHwInt').addEventListener('click',        () => triggerInterrupt('HARDWARE'));
  $('btnBlockCurrent').addEventListener('click', handleBlockCurrent);
  $('btnClearLog').addEventListener('click',     clearLog);

  // Sync quantum input
  $('inputQuantum').addEventListener('input', e => { globalQuantum = parseInt(e.target.value) || 4; });
}

// ── DEMO ──────────────────────────────────
async function handleDemo() {
  await handleReset();
  pendingProcs = [
    { pid: 1, name: 'Proceso A', burstTime: 8,  arrivalTime: 0, priority: 1 },
    { pid: 2, name: 'Proceso B', burstTime: 5,  arrivalTime: 0, priority: 2 },
    { pid: 3, name: 'Proceso C', burstTime: 10, arrivalTime: 0, priority: 3 },
  ];
  pidCounter = 4;
  globalQuantum = 4;
  $('inputQuantum').value = 4;
  updatePendingUI();
  advanceGuide(2);
  showToast('✓ 3 procesos cargados. Iniciando…', 'success');
  // Auto-start
  setTimeout(() => handleStart(), 400);
}

// ── ADD PROCESS ───────────────────────────
function handleAddProcess() {
  const pid     = parseInt($('inputPid').value);
  const name    = $('inputName').value.trim() || `Proceso ${pid}`;
  const burst   = parseInt($('inputBurst').value);
  const arrival = parseInt($('inputArrival').value) || 0;

  if (!pid || !burst) return showToast('PID y Burst Time son requeridos', 'error');
  if (pendingProcs.some(p => p.pid === pid)) return showToast(`PID ${pid} ya existe en la cola`, 'error');

  pendingProcs.push({ pid, name, burstTime: burst, arrivalTime: arrival, priority: 1 });
  pidCounter = pid + 1;

  // Auto-increment form
  $('inputPid').value  = pidCounter;
  const letters = 'ABCDEFGHIJKLMNOP';
  $('inputName').value = `Proceso ${letters[(pidCounter - 1) % letters.length] || pidCounter}`;

  updatePendingUI();
  advanceGuide(pendingProcs.length > 0 ? 2 : 1);
  showToast(`✓ ${name} (PID ${pid}, ${burst} ticks) agregado`, 'success');
}

function updatePendingUI() {
  const header = $('pendingHeader');
  const list   = $('pendingList');
  if (pendingProcs.length === 0) {
    header.style.display = 'none';
    list.innerHTML = '';
    return;
  }
  header.style.display = 'flex';
  $('pendingCount').textContent = pendingProcs.length;
  list.innerHTML = '';
  const COLORS = ['#6C63FF','#FF6584','#43E97B','#F7971E','#4FACFE','#FA709A','#30CFD0'];
  pendingProcs.forEach((p, i) => {
    const chip = document.createElement('div');
    chip.className = 'proc-chip';
    chip.innerHTML = `
      <span class="proc-chip-dot" style="background:${COLORS[i % COLORS.length]}"></span>
      <span class="proc-chip-name">${p.name}</span>
      <span class="proc-chip-pid">PID ${p.pid}</span>
      <span class="proc-chip-burst">${p.burstTime}t</span>
    `;
    list.appendChild(chip);
  });
}

// ── SIMULATION CONTROLS ───────────────────
async function handleStart() {
  if (pendingProcs.length === 0) return showToast('Agrega al menos un proceso antes de iniciar', 'error');

  globalQuantum = parseInt($('inputQuantum').value) || 4;
  quantumUsed   = 0;

  openWS();

  try {
    await apiFetch('/simulation/start', 'POST', {
      algorithm: 'ROUND_ROBIN',
      quantum:   globalQuantum,
      processes: pendingProcs,
    });
  } catch(e) {
    return showToast('Error conectando al backend en :3000', 'error');
  }

  pendingProcs = [];
  updatePendingUI();

  $('btnStart').disabled = true;
  $('btnStop').disabled  = false;

  setStatus('active');
  Gantt.reset();
  clearISR();
  showQuantumCounter(true);
  advanceGuide(3);
  showToast('▶ Simulación Round Robin iniciada', 'success');
}

async function handleStop() {
  try { await apiFetch('/simulation/stop', 'POST', {}); } catch(_) {}
  closeWS();
  setStatus('done');
  $('btnStart').disabled = false;
  $('btnStop').disabled  = true;
  showQuantumCounter(false);
  showToast('■ Simulación detenida', 'info');
}

async function handleReset() {
  closeWS();
  try { await apiFetch('/simulation/reset', 'POST', {}); } catch(_) {}
  pendingProcs = [];
  pidCounter   = 1;
  quantumUsed  = 0;
  $('inputPid').value  = 1;
  $('inputName').value = 'Proceso A';
  $('btnStart').disabled = false;
  $('btnStop').disabled  = true;
  setStatus('inactive');
  $('tickBadge').textContent = '0';
  showCpuIdle();
  clearISR();
  Gantt.reset();
  showQuantumCounter(false);
  updatePendingUI();
  clearQueues();
  resetMetrics();
  clearLog();
  advanceGuide(1);
  showToast('↺ Simulación reiniciada', 'info');
}

async function handleBlockCurrent() {
  try {
    const data = await apiFetch('/simulation/block-current', 'POST', {});
    if (data.error) return showToast(data.error, 'error');
    showToast('⊘ Proceso movido a cola de bloqueados', 'info');
  } catch(_) { showToast('Error al comunicar con el backend', 'error'); }
}

// ── INTERRUPT TRIGGERS ────────────────────
async function triggerInterrupt(type) {
  const pid      = parseInt($('inputInterruptPid').value) || 1;
  const ioDevice = $('inputIoDevice').value;
  try {
    const data = await apiFetch('/interruptions/trigger', 'POST', { type, pid, ioDevice });
    if (data.error) return showToast(data.error, 'error');

    const labels = { TIMER: '⏱ Timer', IO_COMPLETED: '💾 E/S lista', HARDWARE: '🖥 Hardware' };
    showToast(`${labels[type] || type} → PID ${pid}`, 'warning');
    advanceGuide(4);
  } catch(_) { showToast('Error al enviar interrupción', 'error'); }
}

// ── WebSocket ─────────────────────────────
function openWS() {
  closeWS();
  ws = io(API_BASE_URL);
  ws.on('simulation.update', data => {
    try { handleStreamEvent(data); } catch(_) {}
  });
  ws.on('connect_error', () => {});
}
function closeWS() {
  if (ws) { ws.disconnect(); ws = null; }
}

function handleStreamEvent(data) {
  // Tick
  if (data.tick !== undefined) $('tickBadge').textContent = data.tick;

  // Quantum counter
  if (data.runningProcess && data.tick !== undefined) {
    // Estimate quantum used from log (last timer interrupt tick vs now)
    updateQuantumDisplay(data);
  }

  // CPU
  if (data.runningProcess) {
    showCpuRunning(data.runningProcess);
  } else if (!data.event || data.event !== 'TIMER_INTERRUPT') {
    showCpuIdle();
  }

  // ISR
  if (data.isr && data.event && data.event !== 'SIMULATION_COMPLETE') {
    showISR(data);
    flashCpu();
  }

  // Queues
  updateQueues(data);

  // Gantt — always update on every event
  if (data.gantt) Gantt.update(data.gantt);

  // Log
  if (data.interruptionLog) updateLog(data.interruptionLog);

  // Metrics
  if (data.metrics) {
    $('metricInterrupts').textContent  = data.metrics.totalInterruptions;
    $('metricWait').textContent        = data.metrics.avgWaitingTime;
    $('metricTurnaround').textContent  = data.metrics.avgTurnaroundTime;
    $('metricCpu').textContent         = `${data.metrics.cpuUtilization}%`;
  }

  // Done
  if (data.event === 'SIMULATION_COMPLETE') {
    setStatus('done');
    $('btnStart').disabled = false;
    $('btnStop').disabled  = true;
    showQuantumCounter(false);
    showToast('✅ Simulación completada', 'success');
  }
}

// ── CPU PANEL ─────────────────────────────
function showCpuRunning(proc) {
  $('cpuIdleMsg').style.display = 'none';
  $('cpuRunning').style.display = 'block';

  $('cpuProcName').textContent = proc.name;
  $('cpuProcState').textContent = proc.state || 'RUNNING';
  $('cpuProcBadge').textContent = `P${proc.pid}`;
  $('cpuProcBadge').style.cssText = `background:${proc.color}22;color:${proc.color};border-color:${proc.color}66`;

  const pct = proc.burstTime > 0 ? Math.max(4, (proc.remainingBurst / proc.burstTime) * 100) : 4;
  $('cpuBurstBar').style.width = `${pct}%`;
  $('cpuBurstLabel').textContent = `${proc.remainingBurst} / ${proc.burstTime} ticks`;

  if (proc.registers) {
    setReg('regPC', proc.registers.PC ?? '—');
    setReg('regSP', proc.registers.SP ?? '—');
    setReg('regAX', proc.registers.AX ?? 0);
    setReg('regBX', proc.registers.BX ?? 0);
  }

  // Sync interrupt PID input
  $('inputInterruptPid').value = proc.pid;
}

function setReg(id, val) {
  const el = $(id);
  if (el.textContent !== String(val)) {
    el.textContent = val;
    el.classList.add('changed');
    setTimeout(() => el.classList.remove('changed'), 300);
  }
}

function showCpuIdle() {
  $('cpuIdleMsg').style.display = 'flex';
  $('cpuRunning').style.display = 'none';
}

function flashCpu() {
  const card = document.querySelector('.cpu-card');
  card.classList.remove('interrupted');
  void card.offsetWidth; // force reflow
  card.classList.add('interrupted');
}

// ── QUANTUM COUNTER ───────────────────────
function showQuantumCounter(visible) {
  $('quantumCounter').style.display = visible ? 'flex' : 'none';
}

function updateQuantumDisplay(data) {
  // Count ticks since last timer interrupt for this process
  const log = data.interruptionLog || [];
  const lastTimer = [...log].reverse().find(e => e.type === 'TIMER');
  const lastTimerTick = lastTimer ? lastTimer.tick : 0;
  const used = Math.min(data.tick - lastTimerTick, globalQuantum);
  const pct  = (used / globalQuantum) * 100;

  $('qcFill').style.width = `${pct}%`;
  $('qcVal').textContent  = `${used}/${globalQuantum}`;

  // Turn red when close to expiry
  $('qcFill').style.background = pct >= 75 ? 'var(--red)' : pct >= 50 ? 'var(--orange)' : 'var(--green)';
}

// ── ISR PANEL ─────────────────────────────
function showISR(data) {
  $('isrEmpty').style.display = 'none';
  $('isrFlow').style.display  = 'block';

  // Badge
  const badge = $('isrTypeBadge');
  badge.style.display = 'inline-block';
  badge.textContent   = data.event || 'ISR';

  // Address
  const addr = $('isrAddr');
  if (data.isr?.vectorAddress) {
    addr.style.display = 'inline';
    addr.textContent   = data.isr.vectorAddress;
  }

  // ISR name
  $('isrName').textContent = data.isr?.name ?? '—';

  // Saved context
  if (data.savedContext) {
    const sc = data.savedContext, r = sc.registers || {};
    $('savedCtxBody').innerHTML = `PID: <b>${sc.pid}</b><br>PC: ${r.PC??'—'}<br>AX: ${r.AX??0}`;
  }

  // Restored context
  if (data.restoredContext) {
    const rc = data.restoredContext, r = rc.registers || {};
    $('restoredCtxBody').innerHTML = `PID: <b>${rc.pid}</b><br>PC: ${r.PC??'—'}<br>AX: ${r.AX??0}`;
  } else if (data.affectedProcess) {
    const ap = data.affectedProcess;
    $('restoredCtxBody').innerHTML = `PID: <b>${ap.pid}</b><br>${ap.previousState} → <b>${ap.newState}</b>`;
  }

  // Steps — animate sequentially
  const stepsEl = $('isrSteps');
  stepsEl.innerHTML = '';
  stepsEl.style.counterReset = 'step';
  if (data.isr?.steps) {
    data.isr.steps.forEach((step, i) => {
      const li = document.createElement('li');
      li.textContent = step;
      li.style.animationDelay = `${i * 70}ms`;
      if (i === data.isr.steps.length - 1) li.classList.add('active-step');
      stepsEl.appendChild(li);
    });
  }
}

function clearISR() {
  $('isrEmpty').style.display = 'flex';
  $('isrFlow').style.display  = 'none';
  $('isrTypeBadge').style.display = 'none';
  $('isrAddr').style.display  = 'none';
  $('isrSteps').innerHTML     = '';
  $('savedCtxBody').textContent   = '—';
  $('restoredCtxBody').textContent = '—';
  $('isrName').textContent    = '—';
}

// ── QUEUES ────────────────────────────────
function updateQueues(data) {
  renderQueue($('readyQueue'),      data.readyQueue,      $('readyCount'));
  renderQueue($('blockedQueue'),    data.blockedQueue,    $('blockedCount'));
  renderQueue($('terminatedQueue'), data.terminatedQueue, $('terminatedCount'));
}

function renderQueue(container, items, countEl) {
  if (!Array.isArray(items)) return;
  countEl.textContent = items.length;
  container.innerHTML = '';
  if (items.length === 0) {
    container.innerHTML = '<div class="queue-empty">Vacía</div>';
    return;
  }
  items.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'proc-chip';
    chip.innerHTML = `
      <span class="proc-chip-dot" style="background:${p.color || '#6C63FF'}"></span>
      <span class="proc-chip-name">${p.name ?? 'P'+p.pid}</span>
      <span class="proc-chip-pid">PID ${p.pid}</span>
      <span class="proc-chip-burst">${p.remainingBurst ?? '?'}t</span>
    `;
    container.appendChild(chip);
  });
}

function clearQueues() {
  ['readyQueue','blockedQueue','terminatedQueue'].forEach(id => {
    $(id).innerHTML = '<div class="queue-empty">Vacía</div>';
  });
  ['readyCount','blockedCount','terminatedCount'].forEach(id => $(id).textContent = '0');
}

// ── LOG ───────────────────────────────────
let _lastLogLen = 0;

function updateLog(log) {
  if (!log || log.length === _lastLogLen) return;
  _lastLogLen = log.length;

  const listEl = $('logList');
  listEl.innerHTML = '';

  if (log.length === 0) {
    listEl.innerHTML = '<div class="log-empty">Los eventos de interrupción aparecerán aquí</div>';
    return;
  }

  [...log].reverse().forEach(entry => {
    const badgeClass = `badge-${entry.type}` in {'badge-TIMER':1,'badge-IO_COMPLETED':1,'badge-HARDWARE':1}
      ? `badge-${entry.type}` : 'badge-default';

    const el = document.createElement('div');
    el.className = 'log-entry';
    el.innerHTML = `
      <span class="log-tick">t=${entry.tick}</span>
      <span class="log-badge ${badgeClass}">${entry.type}</span>
      <span class="log-action">PID ${entry.pid} · ${entry.action}${entry.ioDevice ? ' · '+entry.ioDevice : ''}</span>
    `;
    listEl.appendChild(el);
  });
}

function clearLog() {
  _lastLogLen = 0;
  $('logList').innerHTML = '<div class="log-empty">Los eventos de interrupción aparecerán aquí</div>';
}

// ── VECTOR TABLE ──────────────────────────
async function loadVectorTable() {
  try {
    const data = await apiFetch('/interruptions/vector-table', 'GET');
    const tbody = $('vectorTableBody');
    tbody.innerHTML = '';
    (data.vectorTable || []).forEach(v => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${v.vector}</td><td>${v.type}</td><td class="vec-isr">${v.isr}</td><td class="vec-addr">${v.address}</td>`;
      tbody.appendChild(tr);
    });
  } catch(_) {
    $('vectorTableBody').innerHTML = '<tr><td colspan="4" style="color:var(--text-muted);padding:10px;text-align:center">Backend no disponible</td></tr>';
  }
}

// ── STATUS & GUIDE ────────────────────────
function setStatus(state) {
  const dot   = $('statusDot');
  const label = $('statusLabel');
  dot.className = 'status-dot';
  if (state === 'active') { dot.classList.add('active'); label.textContent = 'Simulando…'; }
  else if (state === 'done') { dot.classList.add('done'); label.textContent = 'Completado'; }
  else { label.textContent = 'Inactivo'; }
}

function advanceGuide(step) {
  document.querySelectorAll('.guide-step').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.step) === step);
  });
}

function resetMetrics() {
  ['metricInterrupts','metricWait','metricTurnaround'].forEach(id => $(id).textContent = '0');
  $('metricCpu').textContent = '0%';
}

// ── API HELPER ────────────────────────────
async function apiFetch(path, method = 'GET', body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE_URL}${path}`, opts);
  return res.json();
}

// ── TOAST ─────────────────────────────────
function showToast(msg, type = 'info') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const colors = { success:'#3DD68C', error:'#FF4D6D', warning:'#F7971E', info:'#4FACFE' };
  const toast = document.createElement('div');
  Object.assign(toast.style, {
    position:'fixed', bottom:'22px', right:'22px', zIndex:'9999',
    padding:'9px 16px', borderRadius:'8px',
    background:'#161920', border:`1px solid ${colors[type]||'#555'}`,
    color: colors[type]||'#fff', fontSize:'12px', fontWeight:'500',
    boxShadow:'0 4px 20px rgba(0,0,0,0.5)',
    animation:'fadeUp .2s ease', maxWidth:'300px', fontFamily:'Inter,sans-serif',
  });
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
