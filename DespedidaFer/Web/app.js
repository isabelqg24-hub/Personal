/* ============================================================
   OPERACIÓN ATLÁNTICA — evaluacion.js
   Sistema de puntuación 1–3 por prueba con suma en tiempo real
   ============================================================ */

const STAGES = [
  { icon: '🧳', name: 'Maleta'    },
  { icon: '🧠', name: 'Ansiedade' },
  { icon: '🛒', name: 'Compras'   },
  { icon: '🏄', name: 'Surf'      },
  { icon: '🎭', name: 'Improv'    },
  { icon: '🎵', name: 'Música'    },
  { icon: '📍', name: 'Morriña'   },
];

const MAX_SCORE = 21;
const scores = new Array(STAGES.length).fill(0);

/* ── DOM REFS ── */
const liveTotal   = document.getElementById('liveTotal');
const gaugeBar    = document.getElementById('gaugeBar');
const gaugePct    = document.getElementById('gaugePct');
const statusBadge = document.getElementById('statusBadge');
const resultScore = document.getElementById('resultScore');
const resultClassif = document.getElementById('resultClassif');
const resultChips = document.getElementById('resultChips');
const sealTxt     = document.getElementById('sealTxt');
const sealScore   = document.getElementById('sealScore');
const toast       = document.getElementById('toast');
const btnReset    = document.getElementById('btnReset');

/* ── WIRE UP BUTTONS ── */
document.querySelectorAll('.stage-card').forEach(card => {
  const idx = parseInt(card.dataset.idx);

  card.querySelectorAll('.sbtn').forEach(btn => {
    btn.addEventListener('click', () => handleScore(card, btn, idx));
  });
});

btnReset.addEventListener('click', resetAll);

/* ── SCORE HANDLER ── */
function handleScore(card, btn, idx) {
  const val = parseInt(btn.dataset.val);

  // Deselect all buttons in this card
  card.querySelectorAll('.sbtn').forEach(b => b.classList.remove('active'));

  if (scores[idx] === val) {
    // Second click on same button → deselect
    scores[idx] = 0;
    card.classList.remove('scored');
    document.getElementById('sd' + idx).textContent = '—';
  } else {
    scores[idx] = val;
    btn.classList.add('active');
    card.classList.add('scored');
    document.getElementById('sd' + idx).textContent = val + ' / 3';
    showToast(STAGES[idx].icon + '  ' + STAGES[idx].name.toUpperCase() + ': ' + val + ' PTO' + (val > 1 ? 'S' : ''));
  }

  updateUI();
}

/* ── UPDATE ALL UI ── */
function updateUI() {
  const total  = scores.reduce((a, b) => a + b, 0);
  const filled = scores.filter(s => s > 0).length;
  const pct    = Math.round((total / MAX_SCORE) * 100);

  // Header gauge + live total
  liveTotal.textContent = total;
  gaugeBar.style.width  = pct + '%';
  gaugePct.textContent  = pct + '%';

  // Results panel score
  resultScore.textContent = total;

  // Seal score
  sealScore.textContent = total;

  // Classification text
  const classif = getClassif(total, filled);
  resultClassif.textContent = classif.label;
  resultClassif.classList.toggle('complete', filled === STAGES.length);

  // Status badge
  if (filled === STAGES.length) {
    statusBadge.textContent = 'CERTIFICADO';
    statusBadge.classList.add('certified');
  } else {
    statusBadge.textContent = 'EN PRUEBAS';
    statusBadge.classList.remove('certified');
  }

  // Seal text
  const sealTextNode = sealTxt.querySelector('textPath') || sealTxt;
  if (filled === STAGES.length) {
    sealTxt.innerHTML = '<textPath href="#sb" startOffset="12%">CERTIFICADO</textPath>';
    sealTxt.setAttribute('fill', '#66BB6A');
  } else {
    sealTxt.innerHTML = '<textPath href="#sb" startOffset="14%">PENDIENTE</textPath>';
    sealTxt.setAttribute('fill', '#FF6B00');
  }

  // Chips breakdown
  updateChips();
}

/* ── CHIPS ── */
function updateChips() {
  resultChips.innerHTML = '';
  STAGES.forEach((stage, i) => {
    const chip = document.createElement('span');
    if (scores[i] > 0) {
      chip.className = 'chip chip-' + scores[i];
      chip.textContent = stage.icon + ' ' + scores[i];
    } else {
      chip.className = 'chip chip-empty';
      chip.textContent = stage.icon + ' —';
    }
    resultChips.appendChild(chip);
  });
}

/* ── CLASSIFICATION ── */
function getClassif(total, filled) {
  if (filled < STAGES.length) return { label: filled === 0 ? 'SIN CALIFICAR' : 'EN CURSO...' };
  if (total <= 7)  return { label: '◈ RECIÉN APROBADO'  };
  if (total <= 11) return { label: '◈ BUEN NIVEL'       };
  if (total <= 15) return { label: '◈ DESTACADO'        };
  if (total <= 19) return { label: '◈ ÉLITE ATLÁNTICO'  };
               return { label: '★ CANDIDATO PERFECTO ★' };
}

/* ── RESET ── */
function resetAll() {
  scores.fill(0);

  document.querySelectorAll('.stage-card').forEach((card, idx) => {
    card.classList.remove('scored');
    card.querySelectorAll('.sbtn').forEach(b => b.classList.remove('active'));
    document.getElementById('sd' + idx).textContent = '—';
  });

  updateUI();
  showToast('↺  EVALUACIÓN REINICIADA');
}

/* ── TOAST ── */
let toastTimer = null;
function showToast(msg) {
  toast.textContent = '▶  ' + msg;
  toast.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.style.display = 'none'; }, 2200);
}

/* ── INIT ── */
updateUI();
