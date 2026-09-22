/**
 * gantt.js — Per-process row Gantt renderer
 * Renders one horizontal track per PID, completely avoiding the
 * ganttEmpty detachment bug from the previous single-bar approach.
 */
const Gantt = {
  _entries: [],
  _processMap: {},   // pid → { name, color }

  reset() {
    this._entries    = [];
    this._processMap = {};
    if (document.readyState !== 'loading') this._render();
  },


  update(ganttData) {
    if (!Array.isArray(ganttData)) return;
    this._entries = ganttData;

    // Keep track of process metadata
    ganttData.forEach(e => {
      if (!this._processMap[e.pid]) {
        this._processMap[e.pid] = { name: e.name, color: e.color };
      }
    });

    this._render();
  },

  _render() {
    const rowsEl   = document.getElementById('ganttRows');
    const axisEl   = document.getElementById('ganttAxis');
    const emptyEl  = document.getElementById('ganttEmptyState');
    const legendEl = document.getElementById('ganttLegend');

    // Guard: elements may not exist yet on initial script parse
    if (!rowsEl || !axisEl || !legendEl) return;


    // Empty state
    if (this._entries.length === 0) {
      rowsEl.innerHTML   = '';
      axisEl.innerHTML   = '';
      legendEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'flex';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    const totalTicks = Math.max(...this._entries.map(e => e.end), 1);

    // Group entries by PID (preserve insertion order)
    const byPid = {};
    this._entries.forEach(e => {
      if (!byPid[e.pid]) byPid[e.pid] = [];
      byPid[e.pid].push(e);
    });

    // --- Render rows ---
    rowsEl.innerHTML = '';
    Object.keys(byPid).forEach(pid => {
      const segs = byPid[pid];
      const info = this._processMap[pid] || { name: `P${pid}`, color: '#6C63FF' };

      const wrap = document.createElement('div');
      wrap.className = 'gantt-row-wrap';

      const label = document.createElement('div');
      label.className = 'gantt-row-label';
      label.textContent = info.name;
      label.style.color = info.color;

      const track = document.createElement('div');
      track.className = 'gantt-row-track';

      // Fill track with segments + gaps
      let cursor = 0;
      segs.forEach(seg => {
        // Gap before this segment
        if (seg.start > cursor) {
          const gap = document.createElement('div');
          gap.style.cssText = `flex: ${seg.start - cursor}; background: transparent;`;
          track.appendChild(gap);
        }

        const len = seg.end - seg.start;
        const bar = document.createElement('div');
        bar.className = 'gantt-seg';
        bar.style.flex = len;
        bar.style.background = info.color;
        bar.style.opacity = '0.85';
        bar.setAttribute('data-tip', `${info.name} · ticks ${seg.start}–${seg.end} (${len} ticks)`);

        // Show label only if bar is wide enough (>4% of total)
        if (len / totalTicks > 0.04) {
          bar.textContent = `${seg.start}–${seg.end}`;
          bar.style.fontSize = '9px';
          bar.style.fontWeight = '700';
        }

        // Gradient overlay for the active (last) bar
        if (seg === segs[segs.length - 1] && this._entries[this._entries.length - 1]?.pid === parseInt(pid)) {
          bar.style.boxShadow = `0 0 8px ${info.color}`;
          bar.style.opacity   = '1';
        }

        track.appendChild(bar);
        cursor = seg.end;
      });

      // Fill remaining space
      if (cursor < totalTicks) {
        const tail = document.createElement('div');
        tail.style.flex = totalTicks - cursor;
        track.appendChild(tail);
      }

      wrap.appendChild(label);
      wrap.appendChild(track);
      rowsEl.appendChild(wrap);
    });

    // --- Render axis ---
    axisEl.innerHTML = '';
    axisEl.style.minWidth = '400px';
    const tickStep = totalTicks <= 20 ? 1 : totalTicks <= 50 ? 2 : 5;
    for (let t = 0; t <= totalTicks; t += tickStep) {
      const tick = document.createElement('div');
      tick.className = 'gantt-tick';
      tick.style.flex = tickStep;
      tick.textContent = t;
      axisEl.appendChild(tick);
    }

    // --- Legend ---
    legendEl.innerHTML = '';
    Object.values(this._processMap).forEach(info => {
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `<span class="legend-dot" style="background:${info.color}"></span>${info.name}`;
      legendEl.appendChild(item);
    });
  },
};
