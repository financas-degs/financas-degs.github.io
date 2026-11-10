/* Minhas Finanças — app (sem dependências; Firebase carregado sob demanda) */
'use strict';
(() => {

// ---------- utilidades ----------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MSHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const fmt = v => num(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtShort = v => { const n = num(v), a = Math.abs(n); if (a >= 1e6) return (n/1e6).toLocaleString('pt-BR',{maximumFractionDigits:1})+' mi'; if (a >= 1e3) return (n/1e3).toLocaleString('pt-BR',{maximumFractionDigits:1})+' mil'; return n.toLocaleString('pt-BR',{maximumFractionDigits:0}); };
const pad = n => String(n).padStart(2, '0');
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const fmtDate = s => { if (!s) return '—'; const [y, m, d] = String(s).split('-'); return d ? `${d}/${m}/${y}` : `${m}/${y}`; };
const uid = (p = 'id') => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = o => JSON.parse(JSON.stringify(o));
const safeColor = (c, d = '#6366f1') => /^#[0-9a-f]{3,8}$/i.test(String(c || '')) ? c : d;
const parseMoney = s => {
  if (typeof s === 'number') return s;
  let t = String(s || '').replace(/[R$\s]/g, '');
  if (!t) return NaN;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(t);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
};
const moneyIn = v => (v || v === 0) && num(v) !== 0 ? num(v).toFixed(2).replace('.', ',') : '';
const parts = s => String(s || '').split('-').map(Number);
const inMonth = (s, m, y) => { if (!s) return false; const [yy, mm] = parts(s); return yy === y && mm - 1 === m; };
const monthDiff = (s, m, y) => { const [sy, sm] = parts(s); return (y - sy) * 12 + (m - (sm - 1)); };
const monthStr = (m, y) => `${y}-${pad(m + 1)}`;
const isoDay = s => { if (!s) return ''; const t = new Date(s); return isNaN(t) ? '' : `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`; };
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const lsDel = k => { try { localStorage.removeItem(k); } catch {} };

// ---------- ícones ----------
const P = {
  pencil: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  receipt: '<path d="M6 2.5h12V21l-3-2-3 2-3-2-3 2z"/><path d="M9 7.5h6M9 11h6M9 14.5h4"/>',
  down: '<path d="M12 4v15M5.5 12.5 12 19l6.5-6.5"/>',
  up: '<path d="M12 20V5M5.5 11.5 12 5l6.5 6.5"/>',
  repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
  cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.7 12.2a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H6"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20M6 15h4"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
  scale: '<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0z"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M5.7 5.7l12.6 12.6"/>',
  star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>',
  sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevL: '<path d="M15 18l-6-6 6-6"/>',
  chevR: '<path d="M9 18l6-6-6-6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14.5" r="1.2"/>',
  alert: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.5v.01"/>',
  pie: '<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 17l5-5-5-5M15 12H4"/>',
  cloud: '<path d="M7 18a5 5 0 0 1-.6-9.96A6 6 0 0 1 18 8a4.5 4.5 0 0 1-.5 10z"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
  upload: '<path d="M12 16V5M7 10l5-5 5 5M4 20h16"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.5"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  sync: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  send: '<path d="M4 12 20 4l-5 16-3.5-6.5z"/><path d="M11.5 13.5 20 4"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;
const GOOGLE = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
const LOGO = '<svg class="brand-logo" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4338ca"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#lg)"/><path d="M16 42l10-10 7 7 15-15" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="48" cy="24" r="4" fill="#a7f3d0"/></svg>';

// ---------- modelo de dados (compatível com a v14) ----------
const KEYS = ['fixedIncome','earnings','fixedCosts','categories','variableExpenses','cards','cardExpenses','investments','debts','debtsReceivable','payments','negatives','priorities','goals','settings'];
const CARD_LABELS = {
  entradas: 'Total de entradas', saidas: 'Total de saídas', restante: 'Saldo do mês', compromisso: 'Contas fixas',
  invest: 'Investimentos do mês', fatura: 'Faturas do mês', vencido: 'Total vencido', percent: '% comprometido',
  monthlyTotal: 'Total a pagar no mês', negativados: 'Negativados', prioridades: 'Prioridades'
};
const WIDGET_LABELS = {
  chartDonut: 'Gráfico: fluxo de caixa', chartCategory: 'Gráfico: gastos por categoria', chartTrend: 'Gráfico: últimos 6 meses',
  formQuickAdd: 'Lançamento rápido (computador)', tableFixed: 'Central de contas', tableEarnings: 'Entradas e recebíveis', tableInvest: 'Investimentos do mês', goalsCard: 'Metas'
};
const INVEST_TYPES = ['Tesouro','CDB','LCI/LCA','Poupança','Ações','FIIs','Crypto','Outros'];
const LEVELS = ['Alta','Média','Baixa'];
const defaultData = () => ({
  fixedIncome: [], earnings: [], fixedCosts: [],
  categories: [
    { name: 'Alimentação', color: '#f59e0b' }, { name: 'Transporte', color: '#3b82f6' },
    { name: 'Lazer', color: '#ec4899' }, { name: 'Saúde', color: '#10b981' }, { name: 'Casa', color: '#6366f1' }
  ],
  variableExpenses: [], cards: [], cardExpenses: [], investments: [], debts: [], debtsReceivable: [],
  payments: [], negatives: [], priorities: [], goals: [],
  settings: { visibleCards: Object.fromEntries([...Object.keys(CARD_LABELS), ...Object.keys(WIDGET_LABELS)].map(k => [k, true])) }
});

function normalize(d) {
  const base = defaultData();
  const out = {};
  KEYS.forEach(k => { out[k] = d && d[k] != null ? d[k] : base[k]; });
  KEYS.filter(k => k !== 'settings').forEach(k => { if (!Array.isArray(out[k])) out[k] = base[k]; });
  if (typeof out.settings !== 'object' || Array.isArray(out.settings)) out.settings = base.settings;
  out.settings.visibleCards = Object.assign({}, base.settings.visibleCards, out.settings.visibleCards || {});
  const ensureId = (list, p) => list.forEach((x, i) => { if (x && (x.id === undefined || x.id === null || x.id === '')) x.id = `${p}_${i}_${Math.random().toString(36).slice(2, 7)}`; });
  const seen = new Set();
  out.fixedCosts.forEach((c, i) => { if (!c.id || seen.has(c.id)) c.id = 'fix_' + Date.now() + '_' + i; seen.add(c.id); if (!c.startDate) c.startDate = '2024-01'; });
  ensureId(out.variableExpenses, 'var'); ensureId(out.fixedIncome, 'fi'); ensureId(out.earnings, 'ear');
  ensureId(out.investments, 'inv'); ensureId(out.negatives, 'neg'); ensureId(out.priorities, 'pri'); ensureId(out.goals, 'goal');
  out.goals.forEach(g => { g.target = num(g.target); g.initial = num(g.initial); g.monthly = num(g.monthly); });
  ensureId(out.cardExpenses, 'ce'); ensureId(out.debts, 'debt'); ensureId(out.debtsReceivable, 'rec'); ensureId(out.cards, 'c');
  out.categories = out.categories.filter(c => c && c.name);
  ['fixedIncome','earnings','fixedCosts','variableExpenses','cardExpenses','investments','negatives','priorities'].forEach(k => out[k].forEach(x => { x.amount = num(x.amount); }));
  out.debts.concat(out.debtsReceivable).forEach(x => { x.totalAmount = num(x.totalAmount ?? x.amount); x.installments = Math.max(1, parseInt(x.installments) || 1); });
  return out;
}

// ---------- estado ----------
const now = new Date();
const S = {
  data: defaultData(), m: now.getMonth(), y: now.getFullYear(), view: 'inicio',
  mode: 'local', user: null, ready: false, sync: 'local', ver: 0,
  ui: { contasFilter: 'pendentes', contasQ: '', homeQ: '', investAll: false, debtTab: 'pagar', quickType: 'gasto' }
};
const VIEWS = ['simples','inicio','assistente','contas','entradas','fixas','gastos','cartoes','investimentos','metas','dividas','negativados','prioridades','ajustes'];
const NAV = [
  { v: 'inicio', t: 'Início', i: 'home' },
  { v: 'assistente', t: 'Assistente', i: 'sparkle' },
  { v: 'contas', t: 'Contas a pagar', i: 'receipt' },
  { sep: 'Lançamentos' },
  { v: 'entradas', t: 'Entradas', i: 'down' },
  { v: 'fixas', t: 'Contas fixas', i: 'repeat' },
  { v: 'gastos', t: 'Gastos variáveis', i: 'cart' },
  { v: 'cartoes', t: 'Cartões', i: 'card' },
  { v: 'investimentos', t: 'Investimentos', i: 'trend' },
  { sep: 'Planejamento' },
  { v: 'metas', t: 'Metas', i: 'target' },
  { v: 'dividas', t: 'Dívidas e a receber', i: 'scale' },
  { v: 'negativados', t: 'Negativados', i: 'ban' },
  { v: 'prioridades', t: 'Prioridades', i: 'star' },
  { sep: 'Conta' },
  { v: 'ajustes', t: 'Ajustes', i: 'sliders' }
];
const D = () => S.data;
// modo simplificado: só entradas e saídas, dia a dia (usa as mesmas listas do modo completo)
const isSimple = () => !!(D().settings && D().settings.simple);
const percentWithCards = () => !(D().settings && D().settings.percentCards === false);
const NAV_SIMPLE = [{ v: 'simples', t: 'Meu caixa', i: 'home' }, { v: 'assistente', t: 'Assistente', i: 'sparkle' }, { sep: 'Conta' }, { v: 'ajustes', t: 'Ajustes', i: 'sliders' }];
const SIMPLE_VIEWS = ['simples', 'assistente', 'ajustes'];
const navList = () => isSimple() ? NAV_SIMPLE : NAV;
function fixView() {
  if (isSimple() && !SIMPLE_VIEWS.includes(S.view)) S.view = 'simples';
  else if (!isSimple() && S.view === 'simples') S.view = 'inicio';
}

// ---------- persistência ----------
const LOCAL_KEY = 'financas.app.v1';
const Local = {
  load() { const raw = lsGet(LOCAL_KEY); if (!raw) return null; try { return JSON.parse(raw); } catch { return null; } },
  save() { lsSet(LOCAL_KEY, JSON.stringify(S.data)); }
};

const FB_VERSION = '10.14.1';
const Cloud = {
  m: null, auth: null, db: null, unsub: null, lastJson: {}, dirty: new Set(), timer: null, gotServer: false,
  async init(cfg) {
    const base = `https://www.gstatic.com/firebasejs/${FB_VERSION}/`;
    const [a, b, c] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')]);
    this.m = Object.assign({}, a, b, c);
    const app = a.initializeApp(cfg);
    this.auth = b.getAuth(app);
    try { this.auth.languageCode = 'pt-BR'; } catch {}
    try { this.db = c.initializeFirestore(app, { localCache: c.persistentLocalCache({ tabManager: c.persistentMultipleTabManager() }) }); }
    catch (e) { this.db = c.getFirestore(app); }
    b.getRedirectResult(this.auth).catch(e => { if (e && e.code) loginError(e); });
    b.onAuthStateChanged(this.auth, u => onAuth(u));
  },
  start(userId) {
    const { collection, onSnapshot } = this.m;
    this.stop();
    this.gotServer = false;
    let firstHandled = false;
    const col = collection(this.db, 'users', userId, 'data');
    const offlineTimer = setTimeout(() => { if (!S.ready) renderSplash('Sem conexão com a internet', 'Para abrir sua conta pela primeira vez neste aparelho, conecte-se à internet. Depois disso ele funciona offline.'); }, 9000);
    this.unsub = onSnapshot(col, { includeMetadataChanges: true }, snap => {
      let changed = false;
      snap.docChanges().forEach(ch => {
        if (ch.type === 'removed') return;
        const key = ch.doc.id;
        if (!KEYS.includes(key) || this.dirty.has(key)) return;
        const json = ch.doc.data().json;
        if (typeof json !== 'string' || json === this.lastJson[key]) return;
        try { S.data[key] = JSON.parse(json); this.lastJson[key] = json; changed = true; } catch {}
      });
      if (changed) { S.data = normalize(S.data); S.ver++; }
      const fromCache = snap.metadata.fromCache;
      if (!fromCache) this.gotServer = true;
      if (!firstHandled && (!fromCache || !snap.empty)) {
        firstHandled = true; clearTimeout(offlineTimer);
        S.ready = true; renderApp();
        if (snap.empty && !fromCache) offerLocalUpload();
      } else if (changed && S.ready) { render(); }
      setSync(snap.metadata.hasPendingWrites || this.dirty.size ? 'saving' : (fromCache ? 'offline' : 'saved'));
    }, err => {
      console.error(err); setSync('error');
      toast('Não foi possível acessar seus dados: ' + (err.code === 'permission-denied' ? 'permissão negada (verifique as regras do Firestore).' : err.message), true);
    });
  },
  stop() { if (this.unsub) { this.unsub(); this.unsub = null; } clearTimeout(this.timer); this.dirty.clear(); this.lastJson = {}; },
  mark(keys) { keys.forEach(k => this.dirty.add(k)); setSync('saving'); clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(), 700); },
  async flush() {
    clearTimeout(this.timer);
    if (!this.dirty.size || !S.user) return;
    const { doc, writeBatch, serverTimestamp } = this.m;
    const batch = writeBatch(this.db);
    const keys = [...this.dirty]; this.dirty.clear();
    let big = false;
    keys.forEach(k => {
      const json = JSON.stringify(S.data[k]);
      if (json.length > 850000) big = true;
      this.lastJson[k] = json;
      batch.set(doc(this.db, 'users', S.user.uid, 'data', k), { json, updatedAt: serverTimestamp() });
    });
    if (big) toast('Atenção: uma das listas está ficando muito grande. Considere exportar um backup e limpar lançamentos antigos.', true);
    try { await batch.commit(); if (!this.dirty.size) setSync(navigator.onLine === false ? 'offline' : 'saved'); }
    catch (e) { console.error(e); setSync('error'); toast('Erro ao salvar na nuvem: ' + (e.code || e.message), true); }
  }
};

function commit(keys) {
  S.ver++;
  if (S.mode === 'cloud') Cloud.mark(keys); else Local.save();
  render();
}
function replaceAll(newData) {
  S.data = normalize(clone(newData));
  commit(KEYS);
}
window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && S.mode === 'cloud') Cloud.flush(); });
window.addEventListener('pagehide', () => { if (S.mode === 'cloud') Cloud.flush(); });
window.addEventListener('online', () => { if (S.mode === 'cloud') setSync(Cloud.dirty.size ? 'saving' : 'saved'); });
window.addEventListener('offline', () => { if (S.mode === 'cloud') setSync('offline'); });

function setSync(st) {
  S.sync = st;
  $$('.sync').forEach(el => { el.className = 'sync ' + st; const l = el.querySelector('.lbl'); if (l) l.textContent = syncLabel(); });
}
const syncLabel = () => ({ saved: 'Salvo na nuvem', saving: 'Salvando…', offline: 'Offline · enviará depois', error: 'Erro ao salvar', local: 'Só neste aparelho' }[S.sync] || '');

// ---------- pagamentos ----------
let _idx = { ver: -1, pay: new Set(), inv: new Set() };
function payIndex() {
  if (_idx.ver === S.ver) return _idx;
  const pay = new Set(), inv = new Set();
  D().payments.forEach(p => {
    pay.add(`${p.type}|${p.originalId}|${p.targetMonth ?? p.month}|${p.targetYear ?? p.year}`);
    if (p.type === 'card_invoice') inv.add(String(p.originalId));
  });
  _idx = { ver: S.ver, pay, inv };
  return _idx;
}
const isPaid = (type, id, m, y) => type === 'card_invoice' ? payIndex().inv.has(String(id)) : payIndex().pay.has(`${type}|${id}|${m}|${y}`);
function setPaid(type, id, checked, tM = S.m, tY = S.y, payM = S.m, payY = S.y) {
  const sid = String(id);
  const match = p => p.type === type && String(p.originalId) === sid && (type === 'card_invoice' || ((p.targetMonth ?? p.month) === tM && (p.targetYear ?? p.year) === tY));
  if (checked) { if (!D().payments.some(match)) D().payments.push({ type, originalId: sid, month: payM, year: payY, targetMonth: tM, targetYear: tY, date: new Date().toISOString() }); }
  else D().payments = D().payments.filter(p => !match(p));
}
const fixedActive = (c, m, y) => {
  if (c.startDate) { const [sy, sm] = parts(c.startDate); if (y < sy || (y === sy && m < sm - 1)) return false; }
  if (c.endDate) { const [ey, em] = parts(c.endDate); if (y > ey || (y === ey && m > em - 1)) return false; }
  return true;
};
const fixedAmt = (c, m, y) => { const o = c.amounts && c.amounts[monthStr(m, y)]; return o != null ? num(o) : num(c.amount); };
const fixedOver = (c, m, y) => !!(c.amounts && c.amounts[monthStr(m, y)] != null);
const invoiceId = (cardId, m, y) => `inv_${cardId}_${m}_${y}`;

// ---------- cálculos do mês (mesma lógica da v14) ----------
function calc(m, y) {
  const d = D();
  const r = { m, y };
  const earningsMonth = d.earnings.filter(e => inMonth(e.date, m, y));
  const fixedIncomeMonth = d.fixedIncome.filter(x => fixedActive(x, m, y));
  const fixedIncomeTotal = fixedIncomeMonth.reduce((s, x) => s + fixedAmt(x, m, y), 0);
  let income = fixedIncomeTotal + earningsMonth.reduce((s, x) => s + num(x.amount), 0);
  const receivables = [];
  d.debtsReceivable.forEach(rec => {
    if (!rec.date) return;
    const diff = monthDiff(rec.date, m, y), n = rec.installments || 1;
    if (diff >= 0 && diff < n) {
      const amount = num(rec.totalAmount) / n, got = isPaid('receivable_installment', rec.id, m, y);
      if (got) income += amount;
      receivables.push({ id: rec.id, name: rec.name || 'A receber', label: `${diff + 1}/${n}`, amount, isPaid: got, day: parts(rec.date)[2] || 1 });
    }
  });

  const payables = [];
  let fixedTotal = 0;
  d.fixedCosts.forEach(c => {
    if (!fixedActive(c, m, y)) return;
    fixedTotal += fixedAmt(c, m, y);
    payables.push({ type: 'fixed', id: c.id, name: c.name || 'Conta fixa', kind: fixedOver(c, m, y) ? 'Fixa · valor do mês' : 'Fixa', amount: fixedAmt(c, m, y), day: num(c.dueDay) || 1, color: safeColor(c.color, '#3b82f6'), isPaid: isPaid('fixed', c.id, m, y), tM: m, tY: y });
  });
  const varMonth = d.variableExpenses.filter(v => inMonth(v.date, m, y));
  const catTotals = {};
  varMonth.forEach(v => {
    const day = parts(v.date)[2] || 1;
    catTotals[v.category || 'Outros'] = (catTotals[v.category || 'Outros'] || 0) + num(v.amount);
    payables.push({ type: 'variable', id: v.id, name: v.description || v.category || 'Gasto', kind: v.category || 'Variável', amount: num(v.amount), day, color: catColor(v.category), isPaid: isPaid('variable', v.id, m, y), tM: m, tY: y });
  });
  let cardsDue = 0;
  const invoices = [];
  d.cards.forEach(card => {
    const items = d.cardExpenses.filter(e => String(e.cardId) === String(card.id) && inMonth(e.date, m, y));
    const total = items.reduce((s, x) => s + num(x.amount), 0);
    const id = invoiceId(card.id, m, y), paid = isPaid('card_invoice', id);
    invoices.push({ card, items, total, id, paid });
    if (items.length) {
      cardsDue += total;
      payables.push({ type: 'card_invoice', id, name: `Fatura ${card.name}`, kind: 'Fatura', amount: total, day: num(card.dueDay) || 10, color: safeColor(card.color, '#8b5cf6'), isPaid: paid, tM: m, tY: y });
    }
  });
  d.debts.forEach(debt => {
    if (!debt.date) return;
    const diff = monthDiff(debt.date, m, y), n = debt.installments || 1;
    if (diff >= 0 && diff < n) {
      payables.push({ type: 'debt_installment', id: debt.id, name: `${debt.name || 'Dívida'} (${diff + 1}/${n})`, kind: 'Parcela de dívida', amount: num(debt.totalAmount) / n, day: parts(debt.date)[2] || 1, color: '#ef4444', isPaid: isPaid('debt_installment', debt.id, m, y), tM: m, tY: y });
    }
  });
  const investMonth = d.investments.filter(i => inMonth(i.date, m, y));
  const investTotal = investMonth.reduce((s, x) => s + num(x.amount), 0);

  // Saídas = pagamentos marcados neste mês + aportes do mês
  const outflows = investMonth.map(i => ({ desc: `Aporte: ${i.name || 'Investimento'}`, sub: 'Investimento', amount: num(i.amount), tone: 'blue', date: i.date, edit: ['investments', i.id], q: `investments|${i.id}` }));
  d.payments.filter(p => p.month === m && p.year === y).forEach(p => {
    const tM = p.targetMonth ?? p.month, tY = p.targetYear ?? p.year;
    let amount = 0, desc = '', sub = '', date = isoDay(p.date), edit = null, simple = null, q = '';
    if (p.type === 'fixed') { const c = d.fixedCosts.find(x => String(x.id) === String(p.originalId)); if (c) { amount = fixedAmt(c, tM, tY); desc = c.name; sub = `Venc. ${pad(c.dueDay || 1)}/${pad(tM + 1)}/${tY}`; edit = ['fixedCosts', c.id]; q = `fixedCosts|${c.id}|${tM}|${tY}`; } }
    else if (p.type === 'variable') { const v = d.variableExpenses.find(x => String(x.id) === String(p.originalId)); if (v) { amount = num(v.amount); desc = v.description || v.category; sub = `Gasto · ${fmtDate(v.date)}`; if (inMonth(v.date, m, y)) date = v.date; simple = ['variableExpenses', v.id]; q = `variableExpenses|${v.id}`; } }
    else if (p.type === 'debt_installment') { const v = d.debts.find(x => String(x.id) === String(p.originalId)); if (v) { amount = num(v.totalAmount) / (v.installments || 1); desc = v.name; sub = `Parcela · ${pad(tM + 1)}/${tY}`; edit = ['debts', v.id]; q = `debts|${v.id}`; } }
    else if (p.type === 'card_invoice') {
      const ps = String(p.originalId).split('_');
      let iY = tY, iM = tM, cId = '';
      if (ps.length >= 4) { iY = parseInt(ps[ps.length - 1]); iM = parseInt(ps[ps.length - 2]); cId = ps.slice(1, ps.length - 2).join('_'); } else cId = ps[1] || '';
      const card = d.cards.find(c => String(c.id) === cId);
      amount = d.cardExpenses.filter(e => String(e.cardId) === cId && inMonth(e.date, iM, iY)).reduce((s, x) => s + num(x.amount), 0);
      desc = `Fatura ${card ? card.name : 'Cartão'}`; sub = `Venc. ${pad(card ? card.dueDay : 10)}/${pad(iM + 1)}/${iY}`;
    }
    if (amount > 0) outflows.push({ desc, sub, amount, tone: p.type === 'debt_installment' ? 'red' : '', pay: p, date, edit, simple, kind: p.type, q });
  });
  d.negatives.filter(n => n.paid && inMonth(n.paidDate, m, y)).forEach(n => outflows.push({ desc: `Quitação: ${n.description || 'Negativado'}`, sub: `Negativado · ${fmtDate(n.paidDate)}`, amount: num(n.paidAmount ?? n.amount), tone: 'red', date: n.paidDate, edit: ['negatives', n.id], q: `negatives|${n.id}` }));
  const expenses = outflows.reduce((s, x) => s + x.amount, 0);

  // Vencidos: contas fixas não pagas dos 12 meses anteriores
  const overdue = [];
  for (let i = 1; i <= 12; i++) {
    const t = new Date(y, m - i, 1), om = t.getMonth(), oy = t.getFullYear();
    d.fixedCosts.forEach(c => {
      if (!fixedActive(c, om, oy) || isPaid('fixed', c.id, om, oy)) return;
      overdue.push({ type: 'fixed', id: c.id, name: c.name || 'Conta fixa', kind: `Atrasada · ${MSHORT[om]}/${oy}${fixedOver(c, om, oy) ? ' · valor ajustado' : ''}`, amount: fixedAmt(c, om, oy), day: num(c.dueDay) || 1, color: '#ef4444', isPaid: false, tM: om, tY: oy, overdue: true });
    });
  }
  overdue.sort((a, b) => (a.tY - b.tY) || (a.tM - b.tM) || (a.day - b.day));
  payables.sort((a, b) => a.day - b.day);
  const t = new Date();
  const isCur = t.getMonth() === m && t.getFullYear() === y, isPast = (y < t.getFullYear()) || (y === t.getFullYear() && m < t.getMonth());
  payables.forEach(p => { p.late = !p.isPaid && (isPast || (isCur && t.getDate() > p.day)); });

  Object.assign(r, {
    income, fixedIncomeTotal, fixedIncomeMonth, earningsMonth, receivables, payables, overdue, fixedTotal, varMonth, catTotals,
    invoices, cardsDue, investMonth, investTotal, outflows, expenses,
    remaining: income - expenses,
    overdueTotal: overdue.reduce((s, x) => s + x.amount, 0),
    percentBase: fixedTotal + (percentWithCards() ? cardsDue : 0),
    percent: income > 0 ? ((fixedTotal + (percentWithCards() ? cardsDue : 0)) / income) * 100 : 0,
    monthlyTotal: payables.reduce((s, x) => s + x.amount, 0) + investTotal,
    pendingTotal: payables.filter(p => !p.isPaid).reduce((s, x) => s + x.amount, 0),
    paidTotal: payables.filter(p => p.isPaid).reduce((s, x) => s + x.amount, 0),
    negTotal: d.negatives.filter(n => !n.paid).reduce((s, x) => s + num(x.amount), 0),
    priTotal: d.priorities.reduce((s, x) => s + num(x.amount), 0)
  });
  return r;
}
let _memo = { k: '', map: new Map() };
function calcM(m, y) {
  const k = `${S.ver}|${new Date().getDate()}`;
  if (_memo.k !== k) _memo = { k, map: new Map() };
  const key = y * 12 + m;
  if (!_memo.map.has(key)) _memo.map.set(key, calc(m, y));
  return _memo.map.get(key);
}
const carryCfg = () => Object.assign({ enabled: true, startMonth: '', initial: 0 }, D().settings.carry || {});
function autoStart() {
  // primeiro mês em que houve algum lançamento real
  let min = null;
  const take = (yy, mm) => { if (!yy || mm == null || isNaN(yy) || isNaN(mm)) return; const v = yy * 12 + mm; if (min === null || v < min) min = v; };
  const d = D();
  [d.earnings, d.variableExpenses, d.investments].forEach(l => l.forEach(x => { if (x.date) { const [yy, mm] = parts(x.date); take(yy, mm - 1); } }));
  d.payments.forEach(p => { take(p.year, p.month); });
  d.fixedIncome.forEach(i => { if (i.startDate) { const [yy, mm] = parts(i.startDate); take(yy, mm - 1); } });
  d.negatives.forEach(n => { if (n.paid && n.paidDate) { const [yy, mm] = parts(n.paidDate); take(yy, mm - 1); } });
  if (min === null) { const t = new Date(); min = t.getFullYear() * 12 + t.getMonth(); }
  return min;
}
function carryStart() { const c = carryCfg(); if (c.startMonth) { const [yy, mm] = parts(c.startMonth); return yy * 12 + mm - 1; } return autoStart(); }
// saldo que vem dos meses anteriores (sobra ou falta), somado mês a mês
function carryIn(m, y) {
  const c = carryCfg(); if (!c.enabled) return null;
  const start = carryStart(), cur = y * 12 + m;
  if (cur < start) return { prev: 0, start, before: true };
  let prev = num(c.initial);
  for (let k = Math.max(start, cur - 240); k < cur; k++) prev += monthResult(calcM(k % 12, Math.floor(k / 12)));
  return { prev, start, before: false };
}
const C = () => calcM(S.m, S.y);
// resultado do mês = entradas − o que foi marcado como pago (igual para meses passados, atual e futuros)
function monthResult(r) { return r.remaining; }
const isFuture = (m, y) => { const t = new Date(); return y * 12 + m > t.getFullYear() * 12 + t.getMonth(); };
function catColor(name) { const c = D().categories.find(x => x.name === name); return safeColor(c && c.color, '#94a3b8'); }

// ---------- toasts e diálogos ----------
function toast(msg, err = false, action) {
  let box = $('.toasts'); if (!box) { box = document.createElement('div'); box.className = 'toasts'; document.body.appendChild(box); }
  const el = document.createElement('div'); el.className = 'toast' + (err ? ' err' : '');
  el.innerHTML = `<span>${esc(msg)}</span>`;
  if (action) { const b = document.createElement('button'); b.textContent = action.label; b.onclick = () => { action.fn(); el.remove(); }; el.appendChild(b); }
  box.appendChild(el);
  setTimeout(() => el.remove(), err ? 6500 : 3200);
}

let sheetStack = [];
function openSheet({ title, body, foot = '', onMount, wide = false }) {
  const bd = document.createElement('div'); bd.className = 'backdrop';
  const sh = document.createElement('div'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
  if (wide) sh.style.width = 'min(720px, calc(100vw - 32px))';
  sh.innerHTML = `<div class="grabber"></div><div class="sheet-head"><h3>${esc(title)}</h3><button class="icon-btn" data-close aria-label="Fechar">${ic('x')}</button></div><div class="sheet-body">${body}</div>${foot ? `<div class="sheet-foot">${foot}</div>` : ''}`;
  document.body.append(bd, sh);
  const entry = { bd, sh };
  sheetStack.push(entry);
  const close = () => closeSheet(entry);
  bd.onclick = close;
  sh.querySelector('[data-close]').onclick = close;
  requestAnimationFrame(() => { bd.classList.add('show'); sh.classList.add('show'); });
  document.body.style.overflow = 'hidden';
  sh.addEventListener('click', ev => {
    const b = ev.target.closest('[data-sw]'); if (!b) return;
    const box = b.closest('.swatches'); box.querySelectorAll('.sw').forEach(x => x.classList.remove('on')); b.classList.add('on');
    const inp = box.querySelector('input[type=color]'); inp.value = b.dataset.sw;
  });
  sh.addEventListener('input', ev => { if (ev.target.matches('.swatches input[type=color]')) { const box = ev.target.closest('.swatches'); box.querySelectorAll('.sw').forEach(x => x.classList.toggle('on', x.dataset.sw === ev.target.value.toLowerCase())); box.querySelector('.sw-custom').classList.toggle('on', !SWATCHES.includes(ev.target.value.toLowerCase())); } });
  if (onMount) onMount(sh, close);
  const f = sh.querySelector('input:not([type=checkbox]):not([type=color]),select');
  if (f && window.matchMedia('(min-width: 901px)').matches) setTimeout(() => f.focus(), 60);
  return { el: sh, close };
}
function closeSheet(entry) {
  entry = entry || sheetStack[sheetStack.length - 1]; if (!entry) return;
  sheetStack = sheetStack.filter(e => e !== entry);
  entry.bd.classList.remove('show'); entry.sh.classList.remove('show');
  setTimeout(() => { entry.bd.remove(); entry.sh.remove(); }, 230);
  if (!sheetStack.length) document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheetStack.length) closeSheet(); });

function ask(title, msg, okLabel = 'Confirmar', danger = false) {
  return new Promise(res => {
    let done = false;
    const { el, close } = openSheet({
      title, body: `<p style="margin:4px 0 8px;color:var(--text-2)">${msg}</p>`,
      foot: `<button class="btn grow" data-no>Cancelar</button><button class="btn ${danger ? 'danger solid' : 'primary'} grow" data-yes>${esc(okLabel)}</button>`
    });
    el.querySelector('[data-no]').onclick = () => { done = true; close(); res(false); };
    el.querySelector('[data-yes]').onclick = () => { done = true; close(); res(true); };
    const obs = new MutationObserver(() => { if (!document.body.contains(el)) { obs.disconnect(); if (!done) res(false); } });
    obs.observe(document.body, { childList: true });
  });
}

// ---------- formulários genéricos ----------
function fieldHTML(f, val) {
  if (f.showIf && !f.showIf()) return '';
  const id = 'f_' + f.k;
  const lab = `<label for="${id}">${esc(f.label)}${f.req ? '' : ' <span class="muted">(opcional)</span>'}</label>`;
  const cls = `field${f.full ? ' full' : ''}`;
  const ph = f.ph ? ` placeholder="${esc(f.ph)}"` : '';
  const hint = f.hint ? `<span class="hint">${esc(f.hint)}</span>` : '';
  switch (f.type) {
    case 'money': return `<div class="${cls}">${lab}<div class="money"><span>R$</span><input id="${id}" data-k="${f.k}" inputmode="decimal" autocomplete="off" placeholder="0,00" value="${esc(moneyIn(val))}"></div>${hint}</div>`;
    case 'date': return `<div class="${cls}">${lab}<input id="${id}" data-k="${f.k}" type="date" value="${esc(val || '')}">${hint}</div>`;
    case 'month': return `<div class="${cls}">${lab}<input id="${id}" data-k="${f.k}" type="month" value="${esc(val || '')}">${hint}</div>`;
    case 'day': case 'int': return `<div class="${cls}">${lab}<input id="${id}" data-k="${f.k}" type="number" inputmode="numeric" min="${f.min ?? 1}" max="${f.max ?? (f.type === 'day' ? 31 : 999)}" value="${esc(val ?? '')}"${ph}>${hint}</div>`;
    case 'color': {
      const cur = safeColor(val).toLowerCase();
      return `<div class="${cls}">${lab}<div class="swatches">${SWATCHES.map(c => `<button type="button" class="sw${c === cur ? ' on' : ''}" data-sw="${c}" style="background:${c}" aria-label="Cor ${c}"></button>`).join('')}<label class="sw sw-custom" title="Outra cor"><input id="${id}" data-k="${f.k}" type="color" value="${esc(cur)}"></label></div>${hint}</div>`;
    }
    case 'select': {
      const opts = (typeof f.opts === 'function' ? f.opts() : f.opts).map(o => Array.isArray(o) ? o : [o, o]);
      return `<div class="${cls}">${lab}<select id="${id}" data-k="${f.k}">${f.req ? '' : '<option value="">—</option>'}${opts.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(val ?? '') ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>${hint}</div>`;
    }
    case 'toggle': return `<div class="field full"><label class="switch"><span>${esc(f.label)}${f.hint ? `<small>${esc(f.hint)}</small>` : ''}</span><input type="checkbox" data-k="${f.k}"${val ? ' checked' : ''}></label></div>`;
    default: return `<div class="${cls}">${lab}<input id="${id}" data-k="${f.k}" type="text" autocomplete="off" value="${esc(val ?? '')}"${ph}>${hint}</div>`;
  }
}
function readFields(root, fields) {
  const out = {}; let ok = true;
  fields.forEach(f => {
    const el = root.querySelector(`[data-k="${f.k}"]`); if (!el) return;
    const wrap = el.closest('.field'); wrap && wrap.classList.remove('err');
    let v;
    if (f.type === 'toggle') v = el.checked;
    else if (f.type === 'money') { v = parseMoney(el.value); if (!Number.isFinite(v)) v = f.req ? NaN : 0; if (f.req && !(v > 0)) { ok = false; wrap.classList.add('err'); } }
    else if (f.type === 'day' || f.type === 'int') { v = parseInt(el.value); const mn = f.min ?? 1, mx = f.max ?? (f.type === 'day' ? 31 : 999); if (!Number.isFinite(v) || v < mn || v > mx) { if (f.req) { ok = false; wrap.classList.add('err'); } v = f.req ? v : (f.def ?? mn); } }
    else { v = el.value.trim(); if (f.req && !v) { ok = false; wrap.classList.add('err'); } }
    out[f.k] = v;
  });
  if (!ok) { const e = root.querySelector('.field.err input, .field.err select'); e && e.focus(); toast('Preencha os campos destacados.', true); }
  return ok ? out : null;
}
function openForm({ title, fields, values = {}, onSave, onDelete, deleteLabel = 'Excluir', extra = '' }) {
  const { el, close } = openSheet({
    title,
    body: `<form class="fields" novalidate>${fields.map(f => fieldHTML(f, values[f.k])).join('')}</form>${extra}`,
    foot: `${onDelete ? `<button class="btn danger" data-del>${ic('trash')}<span>${esc(deleteLabel)}</span></button>` : ''}<span class="grow"></span><button class="btn" data-cancel>Cancelar</button><button class="btn primary" data-save>Salvar</button>`
  });
  const save = () => { const v = readFields(el, fields); if (v && onSave(v) !== false) close(); };
  el.querySelector('[data-save]').onclick = save;
  el.querySelector('[data-cancel]').onclick = close;
  el.querySelector('form').onsubmit = e => { e.preventDefault(); save(); };
  el.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); save(); } }));
  if (onDelete) el.querySelector('[data-del]').onclick = async () => { if (await ask('Excluir item?', 'Essa ação não pode ser desfeita.', 'Excluir', true)) { onDelete(); close(); } };
  return el;
}
const defaultDate = () => { const t = new Date(); if (t.getMonth() === S.m && t.getFullYear() === S.y) return todayStr(); const last = new Date(S.y, S.m + 1, 0).getDate(); return `${S.y}-${pad(S.m + 1)}-${pad(Math.min(t.getDate(), last))}`; };

// ---------- esquemas das listas ----------
const SWATCHES = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#f59e0b','#10b981','#14b8a6','#0ea5e9','#3b82f6','#64748b','#111827'];
const catOpts = () => D().categories.map(c => c.name);
const SCHEMA = {
  fixedIncome: { title: 'renda fixa', fields: [
    { k: 'description', label: 'Descrição', type: 'text', req: 1, full: 1, ph: 'Ex: Salário' },
    { k: 'amount', label: 'Valor mensal', type: 'money', req: 1, full: 1 },
    { k: 'startDate', label: 'Começa em', type: 'month', hint: 'A partir de quando entra' }, { k: 'endDate', label: 'Termina em', type: 'month', hint: 'Vazio = sem fim' }] },
  earnings: { title: 'entrada extra', fields: [
    { k: 'description', label: 'Descrição', type: 'text', req: 1, full: 1, ph: 'Ex: Freela, comissão, venda' },
    { k: 'amount', label: 'Valor', type: 'money', req: 1 }, { k: 'date', label: 'Data', type: 'date', req: 1 }] },
  fixedCosts: { title: 'conta fixa', fields: [
    { k: 'name', label: 'Nome da conta', type: 'text', req: 1, full: 1, ph: 'Ex: Aluguel, internet, luz' },
    { k: 'amount', label: 'Valor mensal', type: 'money', req: 1 }, { k: 'dueDay', label: 'Dia do vencimento', type: 'day', req: 1 },
    { k: 'startDate', label: 'Começa em', type: 'month', req: 1 }, { k: 'endDate', label: 'Termina em', type: 'month', hint: 'Deixe vazio se não tem fim' },
    { k: 'color', label: 'Cor', type: 'color', full: 1 }] },
  variableExpenses: { title: 'gasto', fields: [
    { k: 'description', label: 'Descrição', type: 'text', req: 1, full: 1, ph: 'Ex: Mercado, farmácia' },
    { k: 'amount', label: 'Valor', type: 'money', req: 1 }, { k: 'date', label: 'Data', type: 'date', req: 1 },
    { k: 'category', label: 'Categoria', type: 'select', req: 1, full: 1, opts: catOpts },
    { k: '_paid', label: 'Já está pago', type: 'toggle', hint: 'Entra no total de saídas do mês' }] },
  cards: { title: 'cartão', fields: [
    { k: 'name', label: 'Nome do cartão', type: 'text', req: 1, full: 1, ph: 'Ex: Nubank' },
    { k: 'limit', label: 'Limite', type: 'money', full: 1 },
    { k: 'closingDay', label: 'Dia de fechamento', type: 'day', req: 1 }, { k: 'dueDay', label: 'Dia de vencimento', type: 'day', req: 1 },
    { k: 'color', label: 'Cor do cartão', type: 'color', full: 1 }] },
  investments: { title: 'aporte', fields: [
    { k: 'name', label: 'Nome', type: 'text', req: 1, full: 1, ph: 'Ex: CDB Banco X' },
    { k: 'category', label: 'Tipo', type: 'select', req: 1, opts: INVEST_TYPES.map(t => [t, t === 'Crypto' ? 'Cripto' : t]) },
    { k: 'rate', label: 'Taxa', type: 'text', ph: 'Ex: 110% CDI' },
    { k: 'amount', label: 'Valor', type: 'money', req: 1 }, { k: 'date', label: 'Data', type: 'date', req: 1 },
    { k: 'goalId', label: 'Para qual meta', type: 'select', full: 1, opts: () => D().goals.map(g => [g.id, `${g.emoji || '🎯'} ${g.name}`]), showIf: () => D().goals.length > 0, hint: 'Conta no progresso da meta' }] },
  debts: { title: 'dívida', fields: [
    { k: 'name', label: 'Descrição', type: 'text', req: 1, full: 1, ph: 'Ex: Empréstimo Itaú' },
    { k: 'totalAmount', label: 'Valor total', type: 'money', req: 1 }, { k: 'installments', label: 'Nº de parcelas', type: 'int', req: 1 },
    { k: 'date', label: 'Data da 1ª parcela', type: 'date', req: 1, full: 1, hint: 'O dia desta data vira o dia de vencimento das parcelas' }] },
  debtsReceivable: { title: 'valor a receber', fields: [
    { k: 'name', label: 'Descrição', type: 'text', req: 1, full: 1, ph: 'Ex: Empréstimo p/ Maria' },
    { k: 'totalAmount', label: 'Valor total', type: 'money', req: 1 }, { k: 'installments', label: 'Nº de parcelas', type: 'int', req: 1 },
    { k: 'date', label: 'Data da 1ª parcela', type: 'date', req: 1, full: 1 }] },
  negatives: { title: 'conta negativada', fields: [
    { k: 'description', label: 'Empresa / descrição', type: 'text', req: 1, full: 1, ph: 'Ex: Loja X' },
    { k: 'amount', label: 'Valor da dívida', type: 'money', req: 1 }, { k: 'contractDate', label: 'Data do contrato', type: 'date' },
    { k: 'paid', label: 'Já quitei', type: 'toggle', hint: 'Sai do total negativado e entra como saída no mês do pagamento' },
    { k: 'paidAmount', label: 'Valor pago', type: 'money', hint: 'Se negociou desconto, coloque o valor pago' }, { k: 'paidDate', label: 'Data do pagamento', type: 'date' }] },
  priorities: { title: 'prioridade', fields: [
    { k: 'description', label: 'Item', type: 'text', req: 1, full: 1, ph: 'Ex: Geladeira nova' },
    { k: 'amount', label: 'Valor estimado', type: 'money', req: 1 }, { k: 'level', label: 'Prioridade', type: 'select', req: 1, opts: LEVELS }] }
};
const DEFAULTS = {
  fixedIncome: () => ({ description: '', amount: 0, startDate: monthStr(S.m, S.y) }),
  earnings: () => ({ description: '', amount: 0, date: defaultDate(), color: '#10b981' }),
  fixedCosts: () => ({ name: '', amount: 0, dueDay: 10, color: '#6366f1', startDate: monthStr(S.m, S.y) }),
  variableExpenses: () => ({ description: '', amount: 0, date: defaultDate(), category: D().categories[0]?.name || '', _paid: true }),
  cards: () => ({ name: '', limit: 0, closingDay: 1, dueDay: 10, color: ['#8b5cf6','#f97316','#0ea5e9','#111827','#16a34a','#e11d48'][D().cards.length % 6] }),
  investments: () => ({ name: '', category: 'Tesouro', rate: '', amount: 0, date: defaultDate() }),
  debts: () => ({ name: '', totalAmount: 0, installments: 1, date: defaultDate() }),
  debtsReceivable: () => ({ name: '', totalAmount: 0, installments: 1, date: defaultDate() }),
  negatives: () => ({ description: '', amount: 0, contractDate: todayStr() }),
  priorities: () => ({ description: '', amount: 0, level: 'Média' })
};
const ID_PREFIX = { fixedIncome: 'fi', earnings: 'ear', fixedCosts: 'fix', variableExpenses: 'var', cards: 'c', investments: 'inv', debts: 'debt', debtsReceivable: 'rec', negatives: 'neg', priorities: 'pri' };

function editItem(key, id) {
  const sc = SCHEMA[key];
  const list = D()[key];
  const isNew = id == null;
  const item = isNew ? DEFAULTS[key]() : list.find(x => String(x.id) === String(id));
  if (!item) return;
  const values = Object.assign({}, item);
  if (key === 'variableExpenses' && !isNew) { const [yy, mm] = parts(item.date); values._paid = isPaid('variable', item.id, mm - 1, yy); }
  const keysTouched = [key];
  openForm({
    title: (isNew ? 'Nova ' : 'Editar ') + sc.title,
    fields: sc.fields, values,
    onSave: v => {
      const paidFlag = v._paid; delete v._paid;
      if (key === 'negatives') { if (v.paid) { if (!v.paidDate) v.paidDate = todayStr(); if (!(v.paidAmount > 0)) v.paidAmount = v.amount; } else { v.paidAmount = null; v.paidDate = ''; } }
      if ((key === 'fixedCosts' || key === 'fixedIncome') && v.endDate && v.startDate && v.endDate < v.startDate) { toast('O mês de término deve ser depois do início.', true); return false; }
      let target;
      if (isNew) { target = Object.assign(item, v, { id: uid(ID_PREFIX[key]) }); delete target._paid; list.push(target); }
      else { target = Object.assign(item, v); if ((key === 'fixedCosts' || key === 'fixedIncome') && !v.endDate) delete target.endDate; if (key === 'fixedIncome' && !v.startDate) delete target.startDate; }
      if (key === 'variableExpenses') {
        D().payments = D().payments.filter(p => !(p.type === 'variable' && String(p.originalId) === String(target.id)));
        if (paidFlag) { const [yy, mm] = parts(target.date); setPaid('variable', target.id, true, mm - 1, yy, mm - 1, yy); }
        keysTouched.push('payments');
      }
      commit(keysTouched);
      toast(isNew ? 'Adicionado' : 'Alterações salvas');
    },
    onDelete: isNew ? null : () => {
      D()[key] = list.filter(x => x !== item);
      if (key === 'variableExpenses') { D().payments = D().payments.filter(p => !(p.type === 'variable' && String(p.originalId) === String(item.id))); keysTouched.push('payments'); }
      if (key === 'cards') { D().cardExpenses = D().cardExpenses.filter(e => String(e.cardId) !== String(item.id)); keysTouched.push('cardExpenses'); }
      commit(keysTouched); toast('Item excluído');
    },
    deleteLabel: key === 'cards' ? 'Excluir cartão' : 'Excluir',
    extra: key === 'cards' && !isNew ? `<p class="muted" style="font-size:12.5px;margin:14px 0 0">Excluir o cartão também apaga as compras lançadas nele.</p>` : (key === 'fixedCosts' && !isNew ? `<p class="muted" style="font-size:12.5px;margin:14px 0 0">Dica: para parar de pagar uma conta sem perder o histórico, preencha <b>Termina em</b> em vez de excluir.</p>` : (key === 'priorities' && !isNew ? `<button type="button" class="btn sm" style="margin-top:14px" data-act="pri2goal" data-id="${esc(item.id)}">${ic('target')} Transformar em meta</button><p class="muted" style="font-size:12.5px;margin:8px 0 0">Vira uma meta com valor e prazo, e o app calcula quanto guardar por mês.</p>` : ''))
  });
}

// ---------- valor de uma conta fixa num mês específico ----------
function editFixedMonth(id, m, y, lkey = 'fixedCosts') {
  const inc = lkey === 'fixedIncome';
  const c = D()[lkey].find(x => String(x.id) === String(id)); if (!c) return;
  const key = monthStr(m, y), over = fixedOver(c, m, y);
  const el = openForm({
    title: `${c.name || c.description || (inc ? 'Renda fixa' : 'Conta fixa')} · ${MONTHS[m].toLowerCase()}/${y}`,
    fields: [{ k: 'amount', label: `Valor de ${MONTHS[m].toLowerCase()}`, type: 'money', req: 1, full: 1, hint: inc ? 'Ex.: salário com hora extra, comissão maior ou menor' : 'Ex.: valor da fatura do mês, ou com juros se atrasou' }],
    values: { amount: fixedAmt(c, m, y) },
    extra: `<p class="muted" style="font-size:13px;margin:14px 0 0">Muda <b>só este mês</b>. Os outros meses continuam com o valor padrão de <b>${fmt(c.amount)}</b>.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">${over ? `<button class="btn sm" data-fm-reset>${ic('undo')} Voltar ao padrão</button>` : ''}<button class="btn ghost sm" data-fm-default>${ic('repeat')} Mudar o valor padrão</button></div>`,
    onSave: v => {
      c.amounts = Object.assign({}, c.amounts);
      if (Math.abs(num(v.amount) - num(c.amount)) < 0.005) delete c.amounts[key]; else c.amounts[key] = num(v.amount);
      if (!Object.keys(c.amounts).length) delete c.amounts;
      commit([lkey]); toast(`Valor de ${MONTHS[m].toLowerCase()} atualizado`);
    }
  });
  const r = el.querySelector('[data-fm-reset]');
  if (r) r.onclick = () => { delete c.amounts[key]; if (!Object.keys(c.amounts).length) delete c.amounts; commit([lkey]); closeSheet(); toast('Voltou ao valor padrão'); };
  el.querySelector('[data-fm-default]').onclick = () => { closeSheet(); editItem(lkey, c.id); };
  focusAmount(el);
}

// ---------- edição rápida: tocar no valor ----------
function focusAmount(el) { setTimeout(() => { const a = el.querySelector('[data-k]'); if (a) { try { a.focus(); a.select(); } catch {} } }, 280); }
const amtBtn = (q, value, cls = '', small = '') => `<button type="button" class="amt num amt-edit${small ? ' stack' : ''}${cls ? ' ' + cls : ''}" data-qamt="${esc(q)}" aria-label="Alterar valor"><span class="amt-v">${value}${ic('pencil')}</span>${small}</button>`;
function fullEdit(key, id) {
  const it = (D()[key] || []).find(x => String(x.id) === String(id)); if (!it) return;
  if ((key === 'earnings' || key === 'variableExpenses') && it.simple) return simpleForm(key === 'earnings' ? 'in' : 'out', id);
  editItem(key, id);
}
function quickAmount(key, id, m = S.m, y = S.y) {
  if (key === 'fixedCosts' || key === 'fixedIncome') return editFixedMonth(id, m, y, key);
  if (key === 'cardExpenses') return editCardExpense(id);
  const it = (D()[key] || []).find(x => String(x.id) === String(id)); if (!it) return;
  const isDebt = key === 'debts' || key === 'debtsReceivable', negPaid = key === 'negatives' && it.paid;
  const field = isDebt ? 'totalAmount' : negPaid ? 'paidAmount' : 'amount';
  const n = it.installments || 1;
  const labels = { earnings: 'Valor da entrada', variableExpenses: 'Valor do gasto', investments: 'Valor do aporte', debts: 'Valor total da dívida', debtsReceivable: 'Valor total a receber', negatives: negPaid ? 'Valor pago' : 'Valor da dívida', priorities: 'Valor estimado' };
  const cur = field === 'paidAmount' ? num(it.paidAmount ?? it.amount) : num(it[field]);
  const el = openForm({
    title: it.description || it.name || (SCHEMA[key] ? SCHEMA[key].title : 'Valor'),
    fields: [{ k: 'v', label: labels[key] || 'Valor', type: 'money', req: 1, full: 1, hint: isDebt && n > 1 ? `Dividido em ${n} parcelas (hoje ${fmt(cur / n)} cada)` : '' }],
    values: { v: cur },
    extra: `<button type="button" class="btn ghost sm" style="margin-top:12px" data-qa-full>${ic('pencil')} Editar tudo (nome, data…)</button>`,
    onSave: v => { it[field] = num(v.v); commit([key]); toast('Valor atualizado'); }
  });
  el.querySelector('[data-qa-full]').onclick = () => { closeSheet(); fullEdit(key, id); };
  focusAmount(el);
}

// ---------- compras no cartão ----------
function addCardPurchase(prefill = {}) {
  if (!D().cards.length) { toast('Cadastre um cartão primeiro.'); editItem('cards'); return; }
  const fields = [
    { k: 'cardId', label: 'Cartão', type: 'select', req: 1, full: 1, opts: () => D().cards.map(c => [c.id, c.name]) },
    { k: 'description', label: 'O que foi comprado', type: 'text', req: 1, full: 1, ph: 'Ex: Tênis, passagem' },
    { k: 'amount', label: 'Valor total', type: 'money', req: 1 }, { k: 'installments', label: 'Parcelas', type: 'int', req: 1, max: 48 },
    { k: 'date', label: 'Data da compra', type: 'date', req: 1, full: 1, hint: 'A fatura é calculada pelo dia de fechamento do cartão' }
  ];
  openForm({ title: 'Nova compra no cartão', fields, values: Object.assign({ cardId: D().cards[0].id, installments: 1, date: todayStr() }, prefill), onSave: v => { saveCardPurchase(v); } });
}
function saveCardPurchase(v, silent = false) {
  const card = D().cards.find(c => String(c.id) === String(v.cardId)); if (!card) return;
  const n = Math.max(1, v.installments), each = Math.round((v.amount / n) * 100) / 100;
  const [py, pm, pd] = parts(v.date), gid = uid('cp');
  for (let i = 0; i < n; i++) {
    let idx = (pm - 1) + i;
    if (pd > num(card.closingDay)) idx++;
    if (num(card.dueDay) < num(card.closingDay)) idx++;
    const last = new Date(py, idx + 1, 0).getDate();
    const inv = new Date(py, idx, Math.min(num(card.dueDay) || 10, last));
    const amount = i === n - 1 ? Math.round((v.amount - each * (n - 1)) * 100) / 100 : each;
    D().cardExpenses.push({ id: uid('ce'), groupId: gid, cardId: card.id, description: v.description, amount, date: `${inv.getFullYear()}-${pad(inv.getMonth() + 1)}-${pad(inv.getDate())}`, installmentLabel: `${i + 1}/${n}`, purchaseDate: v.date });
  }
  if (silent) return;
  commit(['cardExpenses']);
  toast(n > 1 ? `Compra lançada em ${n} parcelas` : 'Compra lançada');
}
function editCardExpense(id) {
  const e = D().cardExpenses.find(x => String(x.id) === String(id)); if (!e) return;
  const group = e.groupId ? D().cardExpenses.filter(x => x.groupId === e.groupId) : [e];
  const fields = [{ k: 'description', label: 'Descrição', type: 'text', req: 1, full: 1 }, { k: 'amount', label: 'Valor desta parcela', type: 'money', req: 1, full: 1 }];
  const el = openForm({
    title: 'Compra no cartão', fields, values: e,
    extra: `<p class="muted" style="font-size:13px;margin:14px 0 0">Parcela ${esc(e.installmentLabel || '1/1')} · fatura de ${fmtDate(e.date)}${e.purchaseDate ? ` · comprado em ${fmtDate(e.purchaseDate)}` : ''}</p>${group.length > 1 ? `<button class="btn danger sm" style="margin-top:12px" data-delall>${ic('trash')} Excluir a compra inteira (${group.length} parcelas)</button>` : ''}`,
    onSave: v => { Object.assign(e, v); if (group.length > 1) group.forEach(g => g.description = v.description); commit(['cardExpenses']); toast('Alterações salvas'); },
    onDelete: () => { D().cardExpenses = D().cardExpenses.filter(x => x !== e); commit(['cardExpenses']); toast('Parcela excluída'); },
    deleteLabel: group.length > 1 ? 'Excluir só esta parcela' : 'Excluir'
  });
  const b = el.querySelector('[data-delall]');
  if (b) b.onclick = async () => { if (await ask('Excluir compra inteira?', `Todas as ${group.length} parcelas de "${esc(e.description)}" serão apagadas.`, 'Excluir tudo', true)) { D().cardExpenses = D().cardExpenses.filter(x => !group.includes(x)); commit(['cardExpenses']); closeSheet(); toast('Compra excluída'); } };
}

// ---------- lançamento rápido ----------
function quickAdd(type) {
  S.ui.quickType = type || S.ui.quickType || 'gasto';
  const tabs = [['gasto', 'cart', 'Gasto'], ['entrada', 'down', 'Entrada'], ['fixa', 'repeat', 'Conta fixa'], ['cartao', 'card', 'Cartão'], ['invest', 'trend', 'Investir']];
  const cfg = {
    gasto: { fields: SCHEMA.variableExpenses.fields, values: DEFAULTS.variableExpenses() },
    entrada: { fields: SCHEMA.earnings.fields, values: DEFAULTS.earnings() },
    cartao: { fields: [
      { k: 'cardId', label: 'Cartão', type: 'select', req: 1, full: 1, opts: () => D().cards.map(c => [c.id, c.name]) },
      { k: 'description', label: 'O que foi comprado', type: 'text', req: 1, full: 1 },
      { k: 'amount', label: 'Valor total', type: 'money', req: 1 }, { k: 'installments', label: 'Parcelas', type: 'int', req: 1, max: 48 },
      { k: 'date', label: 'Data da compra', type: 'date', req: 1, full: 1 }], values: { cardId: D().cards[0]?.id, installments: 1, date: todayStr() } },
    invest: { fields: SCHEMA.investments.fields, values: DEFAULTS.investments() },
    fixa: { fields: [
      { k: 'name', label: 'Nome da conta', type: 'text', req: 1, full: 1, ph: 'Ex: Aluguel, internet, luz' },
      { k: 'amount', label: 'Valor mensal', type: 'money', req: 1 }, { k: 'dueDay', label: 'Dia do vencimento', type: 'day', req: 1 },
      { k: 'startDate', label: 'Começa em', type: 'month', req: 1, hint: 'Primeiro mês' }, { k: 'endDate', label: 'Termina em', type: 'month', hint: 'Vazio = sem fim' }], values: DEFAULTS.fixedCosts() }
  };
  const draw = (sh) => {
    const t = S.ui.quickType, c = cfg[t];
    const body = sh.querySelector('.sheet-body');
    body.innerHTML = `<div class="type-tabs">${tabs.map(([k, i, l]) => `<button type="button" data-qt="${k}" class="${k === t ? 'on' : ''}">${ic(i)}${l}</button>`).join('')}</div>` +
      (t === 'cartao' && !D().cards.length ? `<div class="empty"><div class="ei">${ic('card')}</div>Você ainda não cadastrou nenhum cartão.<br><button class="btn primary sm" style="margin-top:12px" data-newcard>Cadastrar cartão</button></div>` :
      `<form class="fields" novalidate>${c.fields.map(f => fieldHTML(f, c.values[f.k])).join('')}</form>`);
    body.querySelectorAll('[data-qt]').forEach(b => b.onclick = () => { S.ui.quickType = b.dataset.qt; draw(sh); });
    const nc = body.querySelector('[data-newcard]'); if (nc) nc.onclick = () => { closeSheet(); editItem('cards'); };
    const f = body.querySelector('form'); if (f) f.onsubmit = e => { e.preventDefault(); sh.querySelector('[data-save]').click(); };
    body.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sh.querySelector('[data-save]').click(); } }));
  };
  openSheet({
    title: 'Novo lançamento', body: '',
    foot: `<span class="grow"></span><button class="btn" data-cancel>Cancelar</button><button class="btn primary" data-save>Lançar</button>`,
    onMount: (sh, close) => {
      draw(sh);
      sh.querySelector('[data-cancel]').onclick = close;
      sh.querySelector('[data-save]').onclick = () => {
        const t = S.ui.quickType, c = cfg[t];
        if (t === 'cartao' && !D().cards.length) return;
        const v = readFields(sh, c.fields); if (!v) return;
        if (t === 'gasto') {
          const paid = v._paid; delete v._paid;
          const item = Object.assign({ id: uid('var') }, v); D().variableExpenses.push(item);
          if (paid) { const [yy, mm] = parts(item.date); setPaid('variable', item.id, true, mm - 1, yy, mm - 1, yy); }
          commit(['variableExpenses', 'payments']); toast('Gasto lançado');
        } else if (t === 'entrada') { D().earnings.push(Object.assign({ id: uid('ear'), color: '#10b981' }, v)); commit(['earnings']); toast('Entrada lançada'); }
        else if (t === 'fixa') { if (v.endDate && v.endDate < v.startDate) { toast('O mês de término deve ser depois do início.', true); return; } if (!v.endDate) delete v.endDate; D().fixedCosts.push(Object.assign({ id: uid('fix'), color: SWATCHES[D().fixedCosts.length % SWATCHES.length] }, v)); commit(['fixedCosts']); toast('Conta fixa adicionada'); }
        else if (t === 'cartao') saveCardPurchase(v);
        else { D().investments.push(Object.assign({ id: uid('inv') }, v)); commit(['investments']); toast('Aporte lançado'); }
        close();
      };
    }
  });
}

// ---------- detalhes dos indicadores ----------
function details(kind) {
  const c = C();
  let title = '', items = [], total = 0;
  const L = (desc, sub, amount, tone = '', extra = null, q = '') => ({ desc, sub, amount, tone, extra, q });
  switch (kind) {
    case 'entradas':
      title = 'Entradas do mês';
      c.fixedIncomeMonth.forEach(i => items.push(L(i.description, fixedOver(i, S.m, S.y) ? 'Renda fixa · valor do mês' : 'Renda fixa mensal', fixedAmt(i, S.m, S.y), 'pos', null, `fixedIncome|${i.id}|${S.m}|${S.y}`)));
      c.earningsMonth.forEach(i => items.push(L(i.description, fmtDate(i.date), i.amount, 'pos', null, `earnings|${i.id}`)));
      c.receivables.filter(r => r.isPaid).forEach(r => items.push(L(`${r.name} (${r.label})`, 'Recebido', r.amount, 'pos', null, `debtsReceivable|${r.id}`)));
      total = c.income; break;
    case 'saidas':
      title = 'Saídas do mês'; items = c.outflows.map(o => L(o.desc, o.sub, o.amount, o.tone === 'red' ? 'neg' : '', o.pay ? { pay: o.pay } : null, o.q || '')); total = c.expenses; break;
    case 'restante':
      { const ci = carryIn(S.m, S.y);
        title = ci ? 'Saldo acumulado' : 'Saldo do mês';
        if (ci) items.push(L('Saldo anterior', `Sobra/falta acumulada até ${MONTHS[(S.m + 11) % 12].toLowerCase()}`, ci.prev, ci.prev < 0 ? 'neg' : 'pos'));
        items.push(L('Total de entradas', 'Soma do que entrou no mês', c.income, 'pos'), L('Total de saídas', 'Só o que foi marcado como pago + investimentos', -c.expenses, 'neg'));
        total = (ci ? ci.prev : 0) + monthResult(c); }
      break;
    case 'compromisso':
      title = 'Contas fixas (só as que se repetem todo mês)'; items = c.payables.filter(p => p.type === 'fixed').map(p => L(p.name, `Vence dia ${p.day}${p.isPaid ? ' · paga' : ''}`, p.amount, '', null, `fixedCosts|${p.id}|${p.tM}|${p.tY}`)); total = c.fixedTotal; break;
    case 'invest':
      title = 'Patrimônio acumulado';
      const end = new Date(S.y, S.m + 1, 0);
      D().investments.filter(i => i.date && new Date(...(p => [p[0], p[1] - 1, p[2]])(parts(i.date))) <= end).sort((a, b) => b.date.localeCompare(a.date))
        .forEach(i => { items.push(L(i.name, `${i.category || ''}${i.rate ? ' · ' + i.rate : ''} · ${fmtDate(i.date)}`, i.amount, '', null, `investments|${i.id}`)); total += num(i.amount); });
      break;
    case 'fatura':
      title = 'Faturas do mês'; c.invoices.filter(i => i.items.length).forEach(i => items.push(L(`Fatura ${i.card.name}`, `Vence ${pad(i.card.dueDay)}/${pad(S.m + 1)} · ${i.paid ? 'paga' : 'em aberto'}`, i.total, i.paid ? 'pos' : ''))); total = c.cardsDue; break;
    case 'vencido':
      title = 'Contas vencidas'; items = c.overdue.map(o => L(o.name, o.kind, o.amount, 'neg', null, `fixedCosts|${o.id}|${o.tM}|${o.tY}`)); total = c.overdueTotal; break;
    case 'percent':
      title = '% da renda comprometida'; items = [L('Contas fixas do mês', '', c.fixedTotal)].concat(percentWithCards() ? [L('Faturas de cartão do mês', '', c.cardsDue)] : []).concat([L('Total de entradas', '', c.income, 'pos')]); total = null; break;
    case 'monthlyTotal': {
      title = 'Total a pagar no mês (fixas + cartão + gastos + parcelas)';
      const by = t => c.payables.filter(p => p.type === t).reduce((s, x) => s + x.amount, 0);
      [['Contas fixas', 'fixed'], ['Faturas de cartão', 'card_invoice'], ['Gastos variáveis', 'variable'], ['Parcelas de dívidas', 'debt_installment']].forEach(([l, t]) => { const v = by(t); if (v) items.push(L(l, '', v)); });
      if (c.investTotal) items.push(L('Investimentos', 'Aportes do mês', c.investTotal));
      total = c.monthlyTotal; break;
    }
    case 'negativados':
      title = 'Contas negativadas em aberto'; items = D().negatives.filter(n => !n.paid).map(n => L(n.description, n.contractDate ? `Contrato de ${fmtDate(n.contractDate)}` : '', n.amount, 'neg', null, `negatives|${n.id}`)); total = c.negTotal; break;
    case 'prioridades':
      title = 'Prioridades e desejos'; items = D().priorities.map(p => L(p.description, `Prioridade ${p.level}`, p.amount, '', null, `priorities|${p.id}`)); total = c.priTotal; break;
  }
  const body = `<div class="list" data-dsheet>${items.length ? items.map((it, i) => `<div class="row"><div class="grow"><div class="t">${esc(it.desc)}</div>${it.sub ? `<div class="s">${esc(it.sub)}</div>` : ''}</div>${it.q ? amtBtn(it.q, fmt(it.amount), it.tone) : `<div class="amt num ${it.tone}">${fmt(it.amount)}</div>`}${it.extra && it.extra.pay ? `<button class="icon-btn" title="Desfazer pagamento" data-undo="${i}">${ic('undo')}</button>` : ''}</div>`).join('') : `<div class="empty">Nada por aqui neste mês.</div>`}</div>`;
  const foot = total === null ? `<div class="grow"><b style="font-size:20px" class="num">${c.percent.toFixed(1)}%</b> <span class="muted">da renda vai para contas fixas${percentWithCards() ? ' e cartões' : ''}</span><div class="muted" style="font-size:12px;margin-top:4px">${percentWithCards() ? 'Faturas de cartão incluídas' : 'Faturas de cartão não incluídas'} · altere em Ajustes</div></div>` : `<div class="grow muted">Total</div><b class="num" style="font-size:19px">${fmt(total)}</b>`;
  openSheet({
    title: `${title} · ${MONTHS[S.m]}`, body, foot,
    onMount: (sh, close) => sh.querySelectorAll('[data-undo]').forEach(b => b.onclick = async () => {
      const it = items[+b.dataset.undo];
      if (await ask('Desfazer pagamento?', `"${esc(it.desc)}" volta para a lista de contas a pagar.`, 'Desfazer')) {
        const p = it.extra.pay; D().payments = D().payments.filter(x => x !== p); commit(['payments']); close(); toast('Pagamento desfeito');
      }
    })
  });
}

// ---------- gráficos (SVG) ----------
function donut(segs, size = 170, thick = 20) {
  const r = (size - thick) / 2, cx = size / 2, circ = 2 * Math.PI * r;
  const total = segs.reduce((s, x) => s + Math.max(0, x.v), 0);
  let off = 0;
  const arcs = total > 0 ? segs.filter(s => s.v > 0).map(s => { const len = (s.v / total) * circ; const a = `<circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${s.c}" stroke-width="${thick}" stroke-dasharray="${Math.max(0, len - 2)} ${circ}" stroke-dashoffset="${-off}" stroke-linecap="butt"/>`; off += len; return a; }).join('') : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg);display:block;margin:0 auto"><circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="${thick}"/>${arcs}</svg>`;
}
function trendChart() {
  const pts = [];
  for (let i = 5; i >= 0; i--) { const t = new Date(S.y, S.m - i, 1); const r = calcM(t.getMonth(), t.getFullYear()); pts.push({ l: MSHORT[t.getMonth()], a: r.income, b: r.expenses }); }
  const W = 420, H = 190, pl = 40, pb = 24, pt = 10, max = Math.max(1, ...pts.map(p => Math.max(p.a, p.b))) * 1.1;
  const gw = (W - pl) / pts.length, bw = Math.min(16, gw / 3.2);
  const y = v => pt + (H - pt - pb) * (1 - v / max);
  const grid = [0, .5, 1].map(f => { const v = max * f; return `<line x1="${pl}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="var(--border)" stroke-dasharray="3 4"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${fmtShort(v)}</text>`; }).join('');
  const bars = pts.map((p, i) => { const x = pl + gw * i + gw / 2; return `<rect x="${x - bw - 1}" y="${y(p.a)}" width="${bw}" height="${Math.max(0, H - pb - y(p.a))}" rx="4" fill="var(--green)"><title>Entradas ${fmt(p.a)}</title></rect><rect x="${x + 1}" y="${y(p.b)}" width="${bw}" height="${Math.max(0, H - pb - y(p.b))}" rx="4" fill="var(--red)" opacity=".85"><title>Saídas ${fmt(p.b)}</title></rect><text x="${x}" y="${H - 6}" text-anchor="middle">${p.l}</text>`; }).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet">${grid}${bars}</svg><div class="legend"><span><i style="background:var(--green)"></i>Entradas</span><span><i style="background:var(--red)"></i>Saídas</span></div>`;
}
function catBars(catTotals, limit = 6) {
  const arr = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  if (!arr.length) return `<div class="empty"><div class="ei">${ic('pie')}</div>Nenhum gasto variável neste mês.</div>`;
  const max = arr[0][1], tot = arr.reduce((s, x) => s + x[1], 0);
  return arr.slice(0, limit).map(([n, v]) => `<div class="hbar"><div class="hbar-top"><span><i class="dot-c" style="display:inline-block;background:${catColor(n)};margin-right:7px;width:8px;height:8px"></i>${esc(n)}</span><b class="num">${fmt(v)} <span class="muted" style="font-weight:500">· ${Math.round(v / tot * 100)}%</span></b></div><div class="progress"><i style="width:${(v / max) * 100}%;background:${catColor(n)}"></i></div></div>`).join('');
}

// ---------- componentes ----------
const vis = k => D().settings.visibleCards[k] !== false;
function payRow(p, opts = {}) {
  const cls = `row${p.isPaid ? ' paid' : ''}${(p.late || p.overdue) && !p.isPaid ? ' late' : ''}`;
  const sub = p.overdue ? p.kind : `${p.kind} · ${p.late && !p.isPaid ? 'venceu' : 'vence'} dia ${p.day}`;
  return `<div class="${cls}"><input type="checkbox" class="check" aria-label="Marcar como pago" data-pay="${esc(p.type)}" data-id="${esc(p.id)}" data-tm="${p.tM}" data-ty="${p.tY}"${p.isPaid ? ' checked' : ''}><span class="dot-c" style="background:${p.color}"></span><div class="grow"${opts.edit !== false ? ` data-openpay="${esc(p.type)}" data-id="${esc(p.id)}" style="cursor:pointer"` : ''}><div class="t">${esc(p.name)}</div><div class="s">${esc(sub)}</div></div>${p.type === 'fixed' ? amtBtn(`fixedCosts|${p.id}|${p.tM}|${p.tY}`, fmt(p.amount)) : p.type === 'variable' ? amtBtn(`variableExpenses|${p.id}`, fmt(p.amount)) : p.type === 'debt_installment' ? amtBtn(`debts|${p.id}`, fmt(p.amount)) : `<div class="amt num">${fmt(p.amount)}</div>`}</div>`;
}
function emptyBox(icon, text, btn) { return `<div class="empty"><div class="ei">${ic(icon)}</div>${text}${btn ? `<div style="margin-top:12px">${btn}</div>` : ''}</div>`; }
function kpi(key, icon, tone, value, valCls = '') {
  if (!vis(key)) return '';
  return `<button class="kpi" data-detail="${key}"><div class="kpi-top"><span class="kpi-ico tone-${tone}">${ic(icon)}</span><span class="kpi-label">${esc(CARD_LABELS[key])}</span></div><div class="kpi-value num ${valCls}">${value}</div></button>`;
}
function hasAnyData() { const d = D(); return ['fixedIncome','earnings','fixedCosts','variableExpenses','cards','cardExpenses','investments','debts','debtsReceivable','negatives','priorities','goals'].some(k => d[k].length); }

// ---------- telas ----------
function viewInicio() {
  const c = C();
  let h = '';
  if (D().settings.isDemo) h += `<div class="banner demo">${ic('sparkle')}<div class="grow"><b>Você está vendo dados de exemplo.</b> Explore à vontade — quando quiser começar de verdade, remova o exemplo.</div><button class="btn sm" data-act="cleardemo">${ic('trash')} Remover exemplo</button></div>`;
  else if (S.mode === 'local' && !window.FIREBASE_CONFIG) h += `<div class="banner">${ic('info')}<div><b>Modo de demonstração.</b> Os dados ficam salvos só neste navegador. Quando conectarmos o Firebase, tudo passa a sincronizar entre computador e celular.</div></div>`;
  h += askBar();
  if (!hasAnyData()) {
    h += `<div class="card welcome"><div><h2>Bem-vindo(a)${firstName() ? ', ' + esc(firstName()) : ''}! 👋</h2><p class="muted" style="margin:6px 0 0">Comece cadastrando o básico. Depois é só lançar os gastos do dia a dia.</p></div>
      <div class="steps"><button class="step" data-act="new" data-key="fixedIncome"><span class="ico-c tone-green">${ic('down')}</span><b>1. Sua renda</b><span>Salário e entradas fixas</span></button>
      <button class="step" data-act="new" data-key="fixedCosts"><span class="ico-c tone-blue">${ic('repeat')}</span><b>2. Contas fixas</b><span>Aluguel, luz, internet…</span></button>
      <button class="step" data-act="new" data-key="cards"><span class="ico-c tone-violet">${ic('card')}</span><b>3. Cartões</b><span>Fechamento e vencimento</span></button></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-goto="ajustes">${ic('upload')} Importar backup da planilha antiga</button><button class="btn ghost" data-act="demo">${ic('sparkle')} Ver com dados de exemplo</button></div></div>`;
  }
  // herói
  const pct = Math.min(100, c.income > 0 ? (c.expenses / c.income) * 100 : 0);
  if (vis('restante') || vis('entradas') || vis('saidas')) {
    const ci = carryIn(S.m, S.y), res = monthResult(c), final = (ci ? ci.prev : 0) + res;
    h += `<div class="hero" style="margin-top:${hasAnyData() ? 0 : 16}px"><div class="hero-label">${ci ? 'Saldo acumulado' : 'Saldo de ' + MONTHS[S.m].toLowerCase()}</div>
      <div class="hero-value num" data-detail="restante" style="margin-bottom:${ci ? 4 : 16}px">${fmt(final)}</div>
      ${ci ? `<div class="hero-carry" data-detail="restante">Veio do mês anterior <b class="num">${fmt(ci.prev)}</b> <span>·</span> Resultado de ${MONTHS[S.m].toLowerCase()} <b class="num">${res >= 0 ? '+' : ''}${fmt(res)}</b></div>` : ''}
      <div class="hero-row">
        <button class="hero-mini" data-detail="entradas"><span>${ic('down')} Entradas</span><b class="num">${fmt(c.income)}</b></button>
        <button class="hero-mini" data-detail="saidas"><span>${ic('up')} Saídas</span><b class="num">${fmt(c.expenses)}</b></button>
        <button class="hero-mini" data-goto="contas"><span>${ic('receipt')} A pagar</span><b class="num">${fmt(c.pendingTotal)}</b></button>
      </div>
      <div class="hero-bar"><i style="width:${pct}%"></i></div><div class="hero-foot"><span>${Math.round(pct)}% da renda já saiu</span><span>${c.payables.filter(p => !p.isPaid).length} contas pendentes</span></div></div>`;
  }
  const kp = [
    kpi('compromisso', 'repeat', 'blue', fmt(c.fixedTotal)),
    kpi('fatura', 'card', 'violet', fmt(c.cardsDue)),
    kpi('invest', 'trend', 'primary', fmt(c.investTotal)),
    kpi('vencido', 'alert', c.overdueTotal > 0 ? 'red' : 'green', fmt(c.overdueTotal), c.overdueTotal > 0 ? 'neg' : ''),
    kpi('percent', 'pie', c.percent < 30 ? 'green' : c.percent < 50 ? 'amber' : 'red', c.percent.toFixed(1) + '%', c.percent < 30 ? 'pos' : c.percent < 50 ? '' : 'neg'),
    kpi('monthlyTotal', 'calendar', 'blue', fmt(c.monthlyTotal)),
    kpi('negativados', 'ban', c.negTotal > 0 ? 'red' : 'green', fmt(c.negTotal), c.negTotal > 0 ? 'neg' : ''),
    kpi('prioridades', 'star', 'amber', fmt(c.priTotal))
  ].join('');
  if (kp) h += `<div class="kpis" style="margin-top:16px">${kp}</div>`;
  // gráficos
  const charts = [];
  if (vis('chartDonut')) charts.push(`<div class="card"><div class="card-head"><h3>Fluxo de caixa</h3></div><div class="card-body"><div class="chart-wrap">${donut([{ v: Math.max(0, c.remaining), c: 'var(--green)' }, { v: c.expenses, c: 'var(--red)' }])}<div class="donut-center"><div><b class="num ${c.remaining < 0 ? 'neg' : ''}">${fmt(c.remaining)}</b><span>saldo</span></div></div></div><div class="legend" style="justify-content:center"><span><i style="background:var(--green)"></i>Saldo</span><span><i style="background:var(--red)"></i>Saídas</span></div></div></div>`);
  if (vis('chartCategory')) charts.push(`<div class="card"><div class="card-head"><h3>Gastos por categoria</h3><button class="btn ghost sm" data-goto="gastos">Ver</button></div><div class="card-body">${catBars(c.catTotals)}</div></div>`);
  if (vis('chartTrend')) charts.push(`<div class="card"><div class="card-head"><h3>Últimos 6 meses</h3></div><div class="card-body">${trendChart()}</div></div>`);
  if (charts.length) h += `<div class="charts-row">${charts.join('')}</div>`;
  // central de contas + entradas
  const left = [], right = [];
  if (vis('tableFixed')) {
    const q = S.ui.homeQ.toLowerCase();
    const f = arr => q ? arr.filter(p => p.name.toLowerCase().includes(q)) : arr;
    const ov = f(c.overdue), pay = f(c.payables);
    left.push(`<div class="card"><div class="card-head"><h3>Central de contas</h3><span class="sub num">${fmt(c.pendingTotal)} pendente</span></div><div class="card-body">
      <div class="search" style="margin:4px 0 6px">${ic('search')}<input data-q="homeQ" placeholder="Buscar conta…" value="${esc(S.ui.homeQ)}"></div>
      ${ov.length ? `<div class="group-label red">Atrasadas de meses anteriores</div><div class="list">${ov.map(p => payRow(p, { edit: false })).join('')}</div><div class="group-label">Este mês</div>` : ''}
      <div class="list">${pay.length ? pay.map(p => payRow(p)).join('') : emptyBox('receipt', q ? 'Nenhuma conta encontrada.' : 'Nenhuma conta para este mês.', q ? '' : `<button class="btn sm" data-act="new" data-key="fixedCosts">${ic('plus')} Adicionar conta fixa</button>`)}</div></div></div>`);
  }
  if (vis('formQuickAdd')) right.push(quickCard());
  if (vis('tableEarnings')) {
    const rows = [];
    c.fixedIncomeMonth.forEach(i => rows.push(`<div class="row click" data-edit="fixedIncome" data-id="${esc(i.id)}"><span class="ico-c tone-green">${ic('repeat')}</span><div class="grow"><div class="t">${esc(i.description)}</div><div class="s">Renda fixa${fixedOver(i, S.m, S.y) ? ' · valor do mês' : ''}</div></div>${amtBtn(`fixedIncome|${i.id}|${S.m}|${S.y}`, fmt(fixedAmt(i, S.m, S.y)), 'pos')}</div>`));
    c.earningsMonth.forEach(i => rows.push(`<div class="row click" data-edit="earnings" data-id="${esc(i.id)}"><span class="ico-c tone-green">${ic('down')}</span><div class="grow"><div class="t">${esc(i.description)}</div><div class="s">Extra · ${fmtDate(i.date)}</div></div>${amtBtn(`earnings|${i.id}`, fmt(i.amount), 'pos')}</div>`));
    c.receivables.forEach(r => rows.push(`<div class="row${r.isPaid ? ' paid' : ''}"><input type="checkbox" class="check" data-pay="receivable_installment" data-id="${esc(r.id)}" data-tm="${S.m}" data-ty="${S.y}"${r.isPaid ? ' checked' : ''} aria-label="Marcar como recebido"><div class="grow"><div class="t">${esc(r.name)} (${r.label})</div><div class="s">A receber</div></div>${amtBtn(`debtsReceivable|${r.id}`, fmt(r.amount), r.isPaid ? 'pos' : 'muted')}</div>`));
    right.push(`<div class="card"><div class="card-head"><h3>Entradas e recebíveis</h3><button class="btn ghost sm" data-goto="entradas">Ver</button></div><div class="card-body"><div class="list">${rows.length ? rows.join('') : emptyBox('down', 'Nenhuma entrada neste mês.', `<button class="btn sm" data-act="new" data-key="fixedIncome">${ic('plus')} Cadastrar renda</button>`)}</div></div></div>`);
  }
  if (vis('goalsCard')) { const gc = goalsHomeCard(); if (gc) right.push(gc); }
  if (vis('tableInvest')) right.push(`<div class="card"><div class="card-head"><h3>Investimentos do mês</h3><span class="sub num">${fmt(c.investTotal)}</span></div><div class="card-body"><div class="list">${c.investMonth.length ? c.investMonth.map(investRow).join('') : emptyBox('trend', 'Nenhum aporte neste mês.')}</div></div></div>`);
  if (left.length || right.length) h += `<div class="home-grid">${left.length ? `<div class="grid">${left.join('')}</div>` : ''}<div class="grid" style="align-content:start">${right.join('')}</div></div>`;
  return h;
}
function quickCard() {
  return `<div class="card desk-only"><div class="card-head"><h3>Lançamento rápido</h3></div><div class="card-body">
    <form class="fields" data-quickform novalidate>
      <div class="field full"><input data-k="description" placeholder="Descrição (ex: Mercado)" class="input"></div>
      <div class="field"><div class="money"><span>R$</span><input data-k="amount" inputmode="decimal" placeholder="0,00"></div></div>
      <div class="field"><input data-k="date" type="date" value="${defaultDate()}"></div>
      <div class="field full"><select data-k="category">${catOpts().map(n => `<option>${esc(n)}</option>`).join('')}</select></div>
      <div class="field full"><label class="switch"><span>Já está pago</span><input type="checkbox" data-k="_paid" checked></label></div>
      <div class="field full"><button class="btn primary block" type="submit">${ic('plus')} Lançar gasto</button></div>
    </form></div></div>`;
}
function investRow(i) {
  return `<div class="row click" data-edit="investments" data-id="${esc(i.id)}"><span class="ico-c tone-primary">${ic('trend')}</span><div class="grow"><div class="t">${esc(i.name)}</div><div class="s">${esc(i.category === 'Crypto' ? 'Cripto' : (i.category || ''))}${i.rate ? ' · ' + esc(i.rate) : ''} · ${fmtDate(i.date)}${goalTag(i)}</div></div>${amtBtn(`investments|${i.id}`, fmt(i.amount), 'inv')}</div>`;
}

function viewContas() {
  const c = C(), f = S.ui.contasFilter, q = S.ui.contasQ.toLowerCase();
  let list = c.payables.filter(p => (f === 'todas' || (f === 'pagas' ? p.isPaid : !p.isPaid)) && (!q || p.name.toLowerCase().includes(q)));
  const ov = f === 'pagas' ? [] : c.overdue.filter(p => !q || p.name.toLowerCase().includes(q));
  return `<div class="stats"><div class="card stat"><span>Total do mês</span><b class="num">${fmt(c.paidTotal + c.pendingTotal)}</b></div><div class="card stat"><span>Já pago</span><b class="num pos">${fmt(c.paidTotal)}</b></div><div class="card stat"><span>Falta pagar</span><b class="num ${c.pendingTotal ? 'neg' : ''}">${fmt(c.pendingTotal)}</b></div></div>
  <div class="toolbar"><div class="seg">${[['pendentes', 'Pendentes'], ['pagas', 'Pagas'], ['todas', 'Todas']].map(([k, l]) => `<button data-seg="contasFilter" data-v="${k}" class="${f === k ? 'on' : ''}">${l}</button>`).join('')}</div>
  <div class="search">${ic('search')}<input data-q="contasQ" placeholder="Buscar…" value="${esc(S.ui.contasQ)}"></div></div>
  ${ov.length ? `<div class="card" style="margin-bottom:16px;border-color:color-mix(in srgb,var(--red) 35%,var(--border))"><div class="card-head"><h3 class="neg">Atrasadas de meses anteriores</h3><span class="sub num neg">${fmt(c.overdueTotal)}</span></div><div class="card-body"><div class="list">${ov.map(p => payRow(p, { edit: false })).join('')}</div></div></div>` : ''}
  <div class="card"><div class="card-body" style="padding-top:12px"><div class="list">${list.length ? list.map(p => payRow(p)).join('') : emptyBox('check', f === 'pendentes' ? 'Tudo pago neste mês! 🎉' : 'Nenhuma conta aqui.')}</div></div></div>
  <p class="muted" style="font-size:12.5px;margin-top:12px">Marque a caixinha quando pagar. Contas fixas, faturas de cartão, gastos variáveis e parcelas de dívidas aparecem aqui automaticamente.</p>`;
}

function listCard(title, sub, rows, addKey, addLabel, emptyIcon, emptyText) {
  return `<div class="card"><div class="card-head"><div><h3>${esc(title)}</h3>${sub ? `<div class="sub">${sub}</div>` : ''}</div>${addKey ? `<button class="btn sm" data-act="new" data-key="${addKey}">${ic('plus')} ${esc(addLabel)}</button>` : ''}</div><div class="card-body"><div class="list">${rows.length ? rows.join('') : emptyBox(emptyIcon, emptyText)}</div></div></div>`;
}
function viewEntradas() {
  const c = C();
  const fiSub = i => i.startDate || i.endDate ? `${i.startDate ? 'Desde ' + fmtDate(i.startDate) : 'Todo mês'}${i.endDate ? ' até ' + fmtDate(i.endDate) : ''}` : 'Todo mês';
  const fixed = D().fixedIncome.map(i => { const on = fixedActive(i, S.m, S.y); return `<div class="row click" data-edit="fixedIncome" data-id="${esc(i.id)}"><span class="ico-c tone-${on ? 'green' : 'blue'}">${ic('repeat')}</span><div class="grow"><div class="t">${esc(i.description)}</div><div class="s">${fiSub(i)}${on ? (fixedOver(i, S.m, S.y) ? ' · valor do mês' : '') : ' · não conta neste mês'}</div></div>${on ? amtBtn(`fixedIncome|${i.id}|${S.m}|${S.y}`, fmt(fixedAmt(i, S.m, S.y)), 'pos') : `<div class="amt num muted">${fmt(i.amount)}</div>`}</div>`; });
  const extra = c.earningsMonth.slice().sort((a, b) => a.date.localeCompare(b.date)).map(i => `<div class="row click" data-edit="earnings" data-id="${esc(i.id)}"><span class="ico-c tone-green">${ic('down')}</span><div class="grow"><div class="t">${esc(i.description)}</div><div class="s">${fmtDate(i.date)}</div></div>${amtBtn(`earnings|${i.id}`, fmt(i.amount), 'pos')}</div>`);
  const rec = c.receivables.map(r => `<div class="row${r.isPaid ? ' paid' : ''}"><input type="checkbox" class="check" data-pay="receivable_installment" data-id="${esc(r.id)}" data-tm="${S.m}" data-ty="${S.y}"${r.isPaid ? ' checked' : ''} aria-label="Marcar como recebido"><div class="grow"><div class="t">${esc(r.name)} (${r.label})</div><div class="s">Parcela a receber</div></div>${amtBtn(`debtsReceivable|${r.id}`, fmt(r.amount))}</div>`);
  return `<div class="stats"><div class="card stat"><span>Total de entradas</span><b class="num pos">${fmt(c.income)}</b></div><div class="card stat"><span>Renda fixa</span><b class="num">${fmt(c.fixedIncomeTotal)}</b></div><div class="card stat"><span>Extras no mês</span><b class="num">${fmt(c.earningsMonth.reduce((s, x) => s + num(x.amount), 0))}</b></div></div>
  <div class="grid">${listCard('Renda fixa', 'Entra todo mês automaticamente', fixed, 'fixedIncome', 'Adicionar', 'repeat', 'Cadastre seu salário ou outras rendas mensais.')}
  ${listCard(`Entradas extras de ${MONTHS[S.m].toLowerCase()}`, 'Comissões, freelas, vendas…', extra, 'earnings', 'Nova entrada', 'down', 'Nenhuma entrada extra neste mês.')}
  ${rec.length ? listCard('A receber neste mês', 'Marque quando receber', rec, null, '', 'scale', '') : ''}</div>`;
}
function viewFixas() {
  const c = C();
  const active = D().fixedCosts.filter(x => fixedActive(x, S.m, S.y)).sort((a, b) => num(a.dueDay) - num(b.dueDay));
  const inactive = D().fixedCosts.filter(x => !fixedActive(x, S.m, S.y));
  const row = x => { const paid = isPaid('fixed', x.id, S.m, S.y); return `<div class="row${paid ? ' paid' : ''}"><input type="checkbox" class="check" data-pay="fixed" data-id="${esc(x.id)}" data-tm="${S.m}" data-ty="${S.y}"${paid ? ' checked' : ''} aria-label="Marcar como pago"><span class="dot-c" style="background:${safeColor(x.color)}"></span><div class="grow" data-edit="fixedCosts" data-id="${esc(x.id)}" style="cursor:pointer"><div class="t">${esc(x.name)}</div><div class="s">Vence dia ${esc(x.dueDay)} · desde ${fmtDate(x.startDate)}${x.endDate ? ' até ' + fmtDate(x.endDate) : ''}${fixedOver(x, S.m, S.y) ? ' · valor do mês' : ''}</div></div>${amtBtn(`fixedCosts|${x.id}|${S.m}|${S.y}`, fmt(fixedAmt(x, S.m, S.y)))}</div>`; };
  const paidV = active.filter(x => isPaid('fixed', x.id, S.m, S.y)).reduce((s, x) => s + fixedAmt(x, S.m, S.y), 0);
  return `<div class="stats"><div class="card stat"><span>Total fixo do mês</span><b class="num">${fmt(c.fixedTotal)}</b></div><div class="card stat"><span>Pago</span><b class="num pos">${fmt(paidV)}</b></div><div class="card stat"><span>% da renda</span><b class="num">${c.percent.toFixed(1)}%</b></div></div>
  <div class="grid">${listCard(`Contas de ${MONTHS[S.m].toLowerCase()}`, 'Toque no nome para editar', active.map(row), 'fixedCosts', 'Nova conta', 'repeat', 'Nenhuma conta fixa ativa neste mês.')}
  ${inactive.length ? `<div class="card"><div class="card-head"><h3>Fora deste mês</h3><span class="sub">Ainda não começaram ou já terminaram</span></div><div class="card-body"><div class="list">${inactive.map(x => `<div class="row click" data-edit="fixedCosts" data-id="${esc(x.id)}"><span class="dot-c" style="background:${safeColor(x.color)}"></span><div class="grow"><div class="t">${esc(x.name)}</div><div class="s">${fmtDate(x.startDate)}${x.endDate ? ' até ' + fmtDate(x.endDate) : ''}</div></div><div class="amt num muted">${fmt(x.amount)}</div></div>`).join('')}</div></div></div>` : ''}</div>`;
}
function viewGastos() {
  const c = C();
  const items = c.varMonth.slice().sort((a, b) => b.date.localeCompare(a.date));
  const paid = items.filter(v => isPaid('variable', v.id, S.m, S.y)).reduce((s, x) => s + num(x.amount), 0);
  const total = items.reduce((s, x) => s + num(x.amount), 0);
  const rows = items.map(v => { const p = isPaid('variable', v.id, S.m, S.y); return `<div class="row${p ? ' paid' : ''}"><input type="checkbox" class="check" data-pay="variable" data-id="${esc(v.id)}" data-tm="${S.m}" data-ty="${S.y}"${p ? ' checked' : ''} aria-label="Marcar como pago"><div class="grow" data-edit="variableExpenses" data-id="${esc(v.id)}" style="cursor:pointer"><div class="t">${esc(v.description || v.category)}</div><div class="s"><span class="dot-c" style="display:inline-block;width:8px;height:8px;background:${catColor(v.category)};margin-right:5px"></span>${esc(v.category)} · ${fmtDate(v.date)}</div></div>${amtBtn(`variableExpenses|${v.id}`, fmt(v.amount))}</div>`; });
  return `<div class="stats"><div class="card stat"><span>Gastos do mês</span><b class="num">${fmt(total)}</b></div><div class="card stat"><span>Pagos</span><b class="num pos">${fmt(paid)}</b></div><div class="card stat"><span>Pendentes</span><b class="num">${fmt(total - paid)}</b></div></div>
  <div class="home-grid" style="margin-top:0">${listCard(`Gastos de ${MONTHS[S.m].toLowerCase()}`, 'Toque para editar', rows, 'variableExpenses', 'Novo gasto', 'cart', 'Nenhum gasto lançado neste mês.')}
  <div class="grid" style="align-content:start"><div class="card"><div class="card-head"><h3>Por categoria</h3><button class="btn ghost sm" data-act="cats">${ic('tag')} Categorias</button></div><div class="card-body">${catBars(c.catTotals, 20)}</div></div></div></div>`;
}
function cardUsage(card) {
  const unpaid = {};
  D().cardExpenses.filter(e => String(e.cardId) === String(card.id)).forEach(e => { const [y, m] = parts(e.date); const id = invoiceId(card.id, m - 1, y); if (!isPaid('card_invoice', id)) unpaid[id] = (unpaid[id] || 0) + num(e.amount); });
  return Object.values(unpaid).reduce((s, x) => s + x, 0);
}
function viewCartoes() {
  const c = C();
  const ccs = D().cards.map(card => {
    const inv = c.invoices.find(i => i.card === card), used = cardUsage(card), lim = num(card.limit), col = safeColor(card.color, '#8b5cf6');
    return `<div class="cc" data-edit="cards" data-id="${esc(card.id)}" style="background:linear-gradient(135deg, ${col}, color-mix(in srgb, ${col} 55%, #000))">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1"><div><div class="cc-name">${esc(card.name)}</div><div class="cc-meta">Fecha dia ${esc(card.closingDay)} · vence dia ${esc(card.dueDay)}</div></div>${inv && inv.items.length ? `<span class="chip" style="background:rgba(255,255,255,.2);color:#fff">${inv.paid ? 'Paga' : 'Aberta'}</span>` : ''}</div>
      <div style="position:relative;z-index:1"><div class="cc-meta">Fatura de ${MONTHS[S.m].toLowerCase()}</div><div class="cc-val num">${fmt(inv ? inv.total : 0)}</div>
      ${lim > 0 ? `<div class="cc-bar"><i style="width:${Math.min(100, used / lim * 100)}%"></i></div><div class="cc-meta" style="margin-top:6px">Disponível ${fmt(Math.max(0, lim - used))} de ${fmt(lim)}</div>` : ''}</div></div>`;
  }).join('');
  const invs = c.invoices.filter(i => i.items.length).map(i => `<div class="card"><div class="card-head"><div><h3>Fatura ${esc(i.card.name)}</h3><div class="sub">Vence ${pad(i.card.dueDay)}/${pad(S.m + 1)}/${S.y} · ${i.items.length} lançamento(s)</div></div>
    <label class="switch" style="padding:7px 10px"><span style="font-size:13px">${i.paid ? 'Paga' : 'Marcar paga'}</span><input type="checkbox" data-pay="card_invoice" data-id="${esc(i.id)}" data-tm="${S.m}" data-ty="${S.y}"${i.paid ? ' checked' : ''}></label></div>
    <div class="card-body"><div class="list">${i.items.map(e => `<div class="row click" data-cexp="${esc(e.id)}"><div class="grow"><div class="t">${esc(e.description || 'Compra')}</div><div class="s">Parcela ${esc(e.installmentLabel || '1/1')}${e.purchaseDate ? ' · ' + fmtDate(e.purchaseDate) : ''}</div></div>${amtBtn(`cardExpenses|${e.id}`, fmt(e.amount))}</div>`).join('')}</div>
    <div class="row" style="border-top:1px solid var(--border);margin-top:4px"><div class="grow"><b>Total</b></div><b class="num" style="font-size:16px">${fmt(i.total)}</b></div></div></div>`).join('');
  return `<div class="toolbar"><button class="btn primary" data-act="cardbuy">${ic('plus')} Nova compra no cartão</button></div>
    <div class="cc-grid">${ccs}<button class="cc-add" data-act="new" data-key="cards"><span>${ic('plus')}<br>Cadastrar cartão</span></button></div>
    <div class="section-title"><h2>Faturas de ${MONTHS[S.m].toLowerCase()}</h2><span class="muted num">${fmt(c.cardsDue)}</span></div>
    <div class="grid">${invs || `<div class="card">${emptyBox('card', 'Nenhuma compra cai na fatura deste mês.')}</div>`}</div>`;
}
function viewInvest() {
  const c = C(), end = `${S.y}-${pad(S.m + 1)}-31`;
  const acc = D().investments.filter(i => i.date && i.date <= end);
  const accTotal = acc.reduce((s, x) => s + num(x.amount), 0);
  const byCat = {}; acc.forEach(i => { const k = i.category === 'Crypto' ? 'Cripto' : (i.category || 'Outros'); byCat[k] = (byCat[k] || 0) + num(i.amount); });
  const palette = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#64748b'];
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const list = (S.ui.investAll ? D().investments.slice() : c.investMonth.slice()).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return `<div class="stats"><div class="card stat"><span>Aportes no mês</span><b class="num" style="color:var(--blue)">${fmt(c.investTotal)}</b></div><div class="card stat"><span>Patrimônio acumulado</span><b class="num">${fmt(accTotal)}</b></div><div class="card stat"><span>Nº de aportes</span><b class="num">${acc.length}</b></div></div>
  <div class="home-grid" style="margin-top:0"><div class="card"><div class="card-head"><h3>Aportes</h3><div style="display:flex;gap:8px;align-items:center"><div class="seg"><button data-seg="investAll" data-v="0" class="${!S.ui.investAll ? 'on' : ''}">Mês</button><button data-seg="investAll" data-v="1" class="${S.ui.investAll ? 'on' : ''}">Todos</button></div><button class="btn sm" data-act="new" data-key="investments">${ic('plus')} Novo</button></div></div><div class="card-body"><div class="list">${list.length ? list.map(investRow).join('') : emptyBox('trend', 'Nenhum aporte ' + (S.ui.investAll ? 'cadastrado.' : 'neste mês.'))}</div></div></div>
  <div class="card" style="align-self:start"><div class="card-head"><h3>Carteira por tipo</h3></div><div class="card-body">${cats.length ? `<div class="chart-wrap">${donut(cats.map(([, v], i) => ({ v, c: palette[i % 8] })), 160, 18)}<div class="donut-center"><div><b class="num">${fmtShort(accTotal)}</b><span>total</span></div></div></div><div style="margin-top:12px">${cats.map(([n, v], i) => `<div class="hbar-top" style="margin:8px 0"><span><i class="dot-c" style="display:inline-block;width:9px;height:9px;background:${palette[i % 8]};margin-right:8px"></i>${esc(n)}</span><b class="num">${fmt(v)}</b></div>`).join('')}</div>` : emptyBox('pie', 'Sem investimentos até este mês.')}</div></div></div>`;
}
function debtRow(x, key) {
  const n = x.installments || 1, type = key === 'debts' ? 'debt_installment' : 'receivable_installment';
  const paidCount = new Set(D().payments.filter(p => p.type === type && String(p.originalId) === String(x.id)).map(p => `${p.targetMonth ?? p.month}-${p.targetYear ?? p.year}`)).size;
  const each = num(x.totalAmount) / n, diff = x.date ? monthDiff(x.date, S.m, S.y) : -1, cur = diff >= 0 && diff < n;
  const curPaid = cur && isPaid(type, x.id, S.m, S.y);
  const remain = Math.max(0, num(x.totalAmount) - paidCount * each);
  const done = paidCount >= n;
  return `<div class="row" style="align-items:flex-start;padding:14px 4px">${cur ? `<input type="checkbox" class="check" style="margin-top:2px" data-pay="${type}" data-id="${esc(x.id)}" data-tm="${S.m}" data-ty="${S.y}"${curPaid ? ' checked' : ''} aria-label="Marcar parcela do mês">` : `<span class="ico-c tone-${done ? 'green' : key === 'debts' ? 'red' : 'green'}" style="width:26px;height:26px;border-radius:8px">${ic(done ? 'check' : 'calendar')}</span>`}
    <div class="grow" data-edit="${key}" data-id="${esc(x.id)}" style="cursor:pointer"><div class="t">${esc(x.name || '—')}</div>
    <div class="s">${n}x de ${fmt(each)} · ${cur ? `parcela ${diff + 1}/${n} neste mês` : diff < 0 ? 'começa em ' + fmtDate(x.date) : 'parcelas encerradas'}</div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:8px"><div class="progress" style="flex:1"><i style="width:${Math.min(100, paidCount / n * 100)}%;background:${key === 'debts' ? 'var(--red)' : 'var(--green)'}"></i></div><span class="muted" style="font-size:12px;white-space:nowrap">${Math.min(paidCount, n)}/${n} ${key === 'debts' ? 'pagas' : 'recebidas'}</span></div></div>
    ${amtBtn(`${key}|${x.id}`, fmt(x.totalAmount), '', `<small>${done ? 'quitado' : 'falta ' + fmt(remain)}</small>`)}</div>`;
}
function viewDividas() {
  const t = S.ui.debtTab, key = t === 'pagar' ? 'debts' : 'debtsReceivable', list = D()[key];
  const totalAll = list.reduce((s, x) => s + num(x.totalAmount), 0);
  const thisMonth = C().payables.filter(p => p.type === 'debt_installment').reduce((s, x) => s + x.amount, 0);
  const recMonth = C().receivables.reduce((s, x) => s + x.amount, 0);
  return `<div class="toolbar"><div class="seg"><button data-seg="debtTab" data-v="pagar" class="${t === 'pagar' ? 'on' : ''}">Dívidas (a pagar)</button><button data-seg="debtTab" data-v="receber" class="${t === 'receber' ? 'on' : ''}">A receber</button></div></div>
  <div class="stats"><div class="card stat"><span>Valor total</span><b class="num ${t === 'pagar' ? 'neg' : 'pos'}">${fmt(totalAll)}</b></div><div class="card stat"><span>Parcelas neste mês</span><b class="num">${fmt(t === 'pagar' ? thisMonth : recMonth)}</b></div><div class="card stat"><span>Itens</span><b class="num">${list.length}</b></div></div>
  ${listCard(t === 'pagar' ? 'Dívidas e empréstimos' : 'Valores a receber', 'Marque a parcela do mês quando ' + (t === 'pagar' ? 'pagar' : 'receber'), list.map(x => debtRow(x, key)), key, t === 'pagar' ? 'Nova dívida' : 'Novo valor', 'scale', t === 'pagar' ? 'Nenhuma dívida cadastrada. Ótimo!' : 'Ninguém te deve nada por enquanto.')}`;
}
function viewNegativados() {
  const open = D().negatives.filter(n => !n.paid), done = D().negatives.filter(n => n.paid).sort((a, b) => String(b.paidDate).localeCompare(String(a.paidDate)));
  const paidSum = done.reduce((s, n) => s + num(n.paidAmount ?? n.amount), 0);
  const row = n => `<div class="row${n.paid ? ' paid' : ''}"><input type="checkbox" class="check" data-negpay="${esc(n.id)}"${n.paid ? ' checked' : ''} aria-label="Marcar como quitado"><div class="grow" data-edit="negatives" data-id="${esc(n.id)}" style="cursor:pointer"><div class="t">${esc(n.description)}</div><div class="s">${n.paid ? `Quitado em ${fmtDate(n.paidDate)}` : (n.contractDate ? 'Contrato de ' + fmtDate(n.contractDate) : '—')}</div></div>${amtBtn(`negatives|${n.id}`, fmt(n.paid ? (n.paidAmount ?? n.amount) : n.amount), n.paid ? 'pos' : 'neg', n.paid && num(n.paidAmount ?? n.amount) < num(n.amount) ? `<small>de ${fmt(n.amount)}</small>` : '')}</div>`;
  return `<div class="stats"><div class="card stat"><span>Em aberto</span><b class="num ${C().negTotal ? 'neg' : ''}">${fmt(C().negTotal)}</b></div><div class="card stat"><span>Já quitado</span><b class="num pos">${fmt(paidSum)}</b></div><div class="card stat"><span>Contas</span><b class="num">${open.length} aberta(s) · ${done.length} quitada(s)</b></div></div>
  <div class="grid">${listCard('Contas negativadas (Serasa/SPC)', 'Marque a caixinha quando quitar', open.map(row), 'negatives', 'Novo item', 'shield', done.length ? 'Nenhuma conta em aberto. Parabéns! 🎉' : 'Nenhuma conta negativada. 👏')}
  ${done.length ? listCard('Quitadas', 'Histórico do que você já resolveu', done.map(row), null, '', 'check', '') : ''}</div>`;
}
function quitNegative(id) {
  const n = D().negatives.find(x => String(x.id) === String(id)); if (!n) return;
  openForm({
    title: 'Quitar negativado', values: { paidAmount: n.amount, paidDate: todayStr() },
    fields: [{ k: 'paidAmount', label: 'Valor pago', type: 'money', req: 1, hint: 'Se negociou desconto, coloque o valor que pagou' }, { k: 'paidDate', label: 'Data do pagamento', type: 'date', req: 1 }],
    extra: `<p class="muted" style="font-size:13px;margin:14px 0 0">${esc(n.description)} · dívida de ${fmt(n.amount)}. O valor pago entra nas saídas do mês do pagamento.</p>`,
    onSave: v => { Object.assign(n, v, { paid: true }); commit(['negatives']); toast('Quitado! Menos uma 💪'); }
  });
}
function viewPrioridades() {
  const order = { Alta: 0, 'Média': 1, Baixa: 2 }, tone = { Alta: 'red', 'Média': 'amber', Baixa: 'blue' };
  const list = D().priorities.slice().sort((a, b) => (order[a.level] ?? 3) - (order[b.level] ?? 3));
  return `<div class="stats"><div class="card stat"><span>Total estimado</span><b class="num">${fmt(C().priTotal)}</b></div>${LEVELS.map(l => `<div class="card stat"><span>Prioridade ${l.toLowerCase()}</span><b class="num">${fmt(list.filter(x => x.level === l).reduce((s, x) => s + num(x.amount), 0))}</b></div>`).slice(0, 2).join('')}</div>
  ${listCard('Lista de prioridades e desejos', 'O que você quer comprar ou resolver', list.map(p => `<div class="row click" data-edit="priorities" data-id="${esc(p.id)}"><span class="ico-c tone-${tone[p.level] || 'blue'}">${ic('star')}</span><div class="grow"><div class="t">${esc(p.description)}</div><div class="s"><span class="chip ${tone[p.level] || ''}">${esc(p.level)}</span></div></div>${amtBtn(`priorities|${p.id}`, fmt(p.amount))}</div>`), 'priorities', 'Nova prioridade', 'star', 'Sua lista está vazia.')}`;
}
function viewAjustes() {
  const theme = lsGet('financas.theme') || 'auto';
  const u = S.user;
  const account = S.mode === 'cloud' && u ? `<div class="set-row"><span class="avatar">${u.photoURL ? `<img src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">` : esc((u.displayName || u.email || '?')[0].toUpperCase())}</span><div class="grow"><b>${esc(u.displayName || 'Minha conta')}</b><span>${esc(u.email || '')}</span></div><button class="btn danger" data-act="logout">${ic('logout')} Sair</button></div>
    <div class="set-row"><span class="ico-c tone-green">${ic('cloud')}</span><div class="grow"><b>Sincronização ativa</b><span>Tudo o que você lança é salvo na nuvem e aparece em todos os seus aparelhos.</span></div></div>`
    : `<div class="set-row"><span class="ico-c tone-blue">${ic('phone')}</span><div class="grow"><b>Modo local</b><span>Os dados estão só neste navegador. Depois que o Firebase for configurado, você entra com sua conta e tudo sincroniza.</span></div></div>`;
  return `<div class="grid" style="max-width:820px">
  ${D().settings.isDemo ? `<div class="banner demo" style="margin:0">${ic('sparkle')}<div class="grow"><b>Dados de exemplo ativos.</b></div><button class="btn sm" data-act="cleardemo">${ic('trash')} Remover exemplo</button></div>` : ''}
  <div class="card"><div class="card-head"><h3>Conta</h3></div><div class="card-body">${account}</div></div>
  <div class="card"><div class="card-head"><div><h3>Modo de uso</h3><div class="sub">Os dois modos usam os mesmos dados — dá para trocar quando quiser</div></div></div><div class="card-body"><div class="set-row"><div class="grow"><b>${isSimple() ? 'Simples' : 'Completo'}</b><span>${isSimple() ? 'Só entradas e saídas, vendo dia a dia quanto entrou e quanto saiu.' : 'Contas fixas, cartões, investimentos, dívidas e muito mais.'}</span></div><div class="seg"><button data-act="mode" data-v="simple" class="${isSimple() ? 'on' : ''}">Simples</button><button data-act="mode" data-v="full" class="${isSimple() ? '' : 'on'}">Completo</button></div></div></div></div>
  <div class="card"><div class="card-head"><div><h3>Saldo acumulado</h3><div class="sub">A sobra (ou falta) de um mês passa para o próximo</div></div></div><div class="card-body">
    <div class="set-row"><div class="grow"><b>Levar o saldo para o mês seguinte</b><span>Se sobrar R$ 500 em outubro, novembro já começa com +R$ 500. Se faltar, começa negativo.</span></div><label class="switch" style="padding:7px 10px"><input type="checkbox" data-carry="enabled"${carryCfg().enabled ? ' checked' : ''}></label></div>
    ${carryCfg().enabled ? `<div class="set-row"><div class="grow"><b>Começar a contar em</b><span>${carryCfg().startMonth ? 'Escolhido por você' : `Automático: ${MONTHS[carryStart() % 12]} de ${Math.floor(carryStart() / 12)} (primeiro mês com lançamentos)`}</span></div><input type="month" class="input" style="width:auto;min-height:40px;padding:8px 10px" data-carry="startMonth" value="${esc(carryCfg().startMonth || monthStr(carryStart() % 12, Math.floor(carryStart() / 12)))}"></div>
    <div class="set-row"><div class="grow"><b>Saldo inicial</b><span>Quanto você tinha (ou devia) no começo desse mês. Pode ser negativo.</span></div><div class="money" style="width:170px"><span>R$</span><input class="input" style="padding-left:38px;min-height:40px" inputmode="decimal" data-carry="initial" value="${esc(moneyIn(carryCfg().initial))}" placeholder="0,00"></div></div>` : ''}
  </div></div>
  ${isSimple() ? '' : `<div class="card"><div class="card-head"><div><h3>% da renda comprometida</h3><div class="sub">O que entra no cálculo do indicador "% comprometido"</div></div></div><div class="card-body">
    <div class="set-row"><span class="ico-c tone-violet">${ic('card')}</span><div class="grow"><b>Incluir cartão de crédito</b><span>Soma as faturas do mês às contas fixas antes de calcular o % da renda. Desligado, conta só as contas fixas.</span></div><label class="switch" style="padding:7px 10px"><input type="checkbox" data-pctcards${percentWithCards() ? ' checked' : ''}></label></div>
  </div></div>`}
  <div class="card"><div class="card-head"><div><h3>Assistente com IA</h3><div class="sub">Lançar, corrigir e perguntar escrevendo do seu jeito</div></div></div><div class="card-body">
    <div class="set-row"><span class="ico-c tone-primary">${ic('sparkle')}</span><div class="grow"><b>Usar o assistente</b><span>Usa a IA do Google (Gemini, plano gratuito). Para responder, envia sua mensagem e um resumo dos lançamentos dos últimos meses, sem nome nem e-mail. No plano gratuito o Google pode usar esse conteúdo para melhorar os produtos dele. Nada é salvo sem você confirmar.</span></div><label class="switch" style="padding:7px 10px"><input type="checkbox" data-aitoggle${aiOn() ? ' checked' : ''}></label></div>
  </div></div>
  <div class="card"><div class="card-head"><h3>Aparência</h3></div><div class="card-body"><div class="set-row"><div class="grow"><b>Tema</b><span>Claro, escuro ou igual ao do aparelho</span></div><div class="seg">${[['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']].map(([k, l]) => `<button data-theme-set="${k}" class="${theme === k ? 'on' : ''}">${l}</button>`).join('')}</div></div></div></div>
  ${isSimple() ? '' : `<div class="card"><div class="card-head"><div><h3>Painel inicial</h3><div class="sub">Escolha o que aparece na tela de início</div></div></div><div class="card-body"><div class="toggles">
    ${Object.entries(CARD_LABELS).concat(Object.entries(WIDGET_LABELS)).map(([k, l]) => `<label class="switch"><span>${esc(l)}</span><input type="checkbox" data-vis="${k}"${vis(k) ? ' checked' : ''}></label>`).join('')}</div></div></div>`}
  <div class="card"><div class="card-head"><h3>Categorias de gastos</h3><button class="btn sm" data-act="cats">${ic('tag')} Gerenciar</button></div><div class="card-body"><div style="display:flex;flex-wrap:wrap;gap:8px">${D().categories.map(c => `<span class="chip"><i class="dot-c" style="width:8px;height:8px;background:${safeColor(c.color)}"></i>${esc(c.name)}</span>`).join('')}</div></div></div>
  <div class="card"><div class="card-head"><h3>Backup</h3></div><div class="card-body">
    <div class="set-row"><span class="ico-c tone-primary">${ic('download')}</span><div class="grow"><b>Exportar backup</b><span>Baixa um arquivo .json com todos os seus dados</span></div><button class="btn" data-act="export">Exportar</button></div>
    <div class="set-row"><span class="ico-c tone-primary">${ic('upload')}</span><div class="grow"><b>Importar backup</b><span>Aceita o arquivo deste app e o "financas_backup.json" da planilha antiga (v14)</span></div><label class="btn">Escolher arquivo<input type="file" accept=".json,application/json" data-import hidden></label></div></div></div>
  <div class="card"><div class="card-head"><h3>Instalar no celular</h3></div><div class="card-body"><div class="set-row"><span class="ico-c tone-blue">${ic('phone')}</span><div class="grow"><b>Android (Chrome)</b><span>Abra o menu ⋮ e toque em "Instalar app" ou "Adicionar à tela inicial".</span></div></div><div class="set-row"><span class="ico-c tone-blue">${ic('phone')}</span><div class="grow"><b>iPhone (Safari)</b><span>Toque em Compartilhar (quadrado com seta) e depois em "Adicionar à Tela de Início".</span></div></div>${deferredInstall ? `<div style="margin-top:10px"><button class="btn primary" data-act="install">${ic('download')} Instalar agora</button></div>` : ''}</div></div>
  ${!hasAnyData() ? `<div class="card"><div class="card-head"><h3>Dados de exemplo</h3></div><div class="card-body"><div class="set-row"><span class="ico-c tone-amber">${ic('sparkle')}</span><div class="grow"><b>Ver o app preenchido</b><span>Carrega lançamentos fictícios para você explorar. Dá para remover com um clique.</span></div><button class="btn" data-act="demo">Carregar exemplo</button></div></div></div>` : ''}
  <div class="card"><div class="card-head"><h3 class="neg">Zona de perigo</h3></div><div class="card-body"><div class="set-row"><div class="grow"><b>Apagar todos os dados</b><span>Remove tudo desta conta. Faça um backup antes.</span></div><button class="btn danger" data-act="wipe">${ic('trash')} Apagar tudo</button></div></div></div>
  <p class="muted" style="font-size:12px;text-align:center">Minhas Finanças · versão 1.12.3</p></div>`;
}

// ---------- metas (objetivos) ----------
const GOAL_EMOJIS = [['🚗', 'Carro / moto'], ['🏠', 'Casa / imóvel'], ['✈️', 'Viagem'], ['🛟', 'Reserva de emergência'], ['🎓', 'Estudos'], ['💍', 'Casamento / festa'], ['📱', 'Eletrônico'], ['👶', 'Filhos'], ['🛋️', 'Móveis / reforma'], ['💼', 'Negócio próprio'], ['🎁', 'Presente'], ['🎯', 'Outro']];
const GOAL_PRESETS = [
  { emoji: '🛟', name: 'Reserva de emergência', color: '#10b981' },
  { emoji: '🚗', name: 'Carro', color: '#3b82f6' },
  { emoji: '✈️', name: 'Viagem', color: '#0ea5e9' },
  { emoji: '🏠', name: 'Entrada da casa própria', color: '#6366f1' }
];
const nowIdx = () => { const t = new Date(); return t.getFullYear() * 12 + t.getMonth(); };
const monIdx = s => { const [yy, mm] = parts(s); return yy && mm ? yy * 12 + mm - 1 : null; };
const idxLabel = k => `${MSHORT[k % 12].toLowerCase()}/${Math.floor(k / 12)}`;
const idxLong = k => `${MONTHS[k % 12].toLowerCase()} de ${Math.floor(k / 12)}`;
const goalDeposits = g => D().investments.filter(i => i.goalId && String(i.goalId) === String(g.id));
const goalTag = i => { if (!i.goalId) return ''; const g = D().goals.find(x => String(x.id) === String(i.goalId)); return g ? ` · ${esc(g.emoji || '🎯')} ${esc(g.name)}` : ''; };
const monthsPhrase = n => n === 1 ? '1 mês' : `${n} meses`;
// quanto costuma sobrar por mês (antes de investir) nos últimos 3 meses fechados
function avgSurplus() {
  const cur = nowIdx(), start = autoStart(), vals = [];
  for (let k = cur - 3; k < cur; k++) { if (k < start) continue; const r = calcM(k % 12, Math.floor(k / 12)); if (r.income > 0 || r.expenses > 0) vals.push(r.remaining + r.investTotal); }
  return vals.length ? { avg: vals.reduce((s, v) => s + v, 0) / vals.length, n: vals.length } : null;
}
// todos os números de uma meta
function goalStats(g, extra = {}) {
  const deps = goalDeposits(g);
  const target = num(extra.target ?? g.target), initial = num(extra.initial ?? g.initial), monthly = num(extra.monthly ?? g.monthly);
  const deadline = extra.deadline !== undefined ? extra.deadline : g.deadline;
  const depTotal = deps.reduce((s, i) => s + num(i.amount), 0);
  const saved = initial + depTotal, missing = Math.max(0, target - saved);
  const pct = target > 0 ? Math.min(100, saved / target * 100) : 0;
  const cur = nowIdx();
  const created = monIdx(g.createdAt) ?? cur - 2;
  const span = Math.max(1, Math.min(3, cur - created + 1));
  const recent = deps.filter(i => { const k = monIdx(i.date); return k != null && k <= cur && k > cur - span; }).reduce((s, i) => s + num(i.amount), 0);
  const pace = recent / span;
  const thisMonth = deps.filter(i => monIdx(i.date) === cur).reduce((s, i) => s + num(i.amount), 0);
  const dIdx = deadline ? monIdx(deadline) : null;
  const left = dIdx != null ? dIdx - cur + 1 : null;
  const needed = left != null && left > 0 ? missing / left : null;
  const rate = monthly > 0 ? monthly : pace;
  let eta = null;
  if (missing > 0 && rate > 0) { const n = Math.ceil(missing / rate - 1e-9); eta = cur + n - (thisMonth > 0 || monthly <= 0 ? 0 : 1); }
  const plan = needed != null ? needed : (monthly > 0 ? monthly : 0);
  let status;
  if (target > 0 && missing <= 0) status = ['green', 'Concluída 🎉'];
  else if (left != null && left <= 0) status = ['red', 'Prazo passou'];
  else if (needed != null) status = rate <= 0 ? ['amber', 'Comece a guardar'] : rate >= needed * 0.98 ? ['green', 'No ritmo'] : ['amber', 'Abaixo do ritmo'];
  else status = eta != null ? ['blue', 'Sem prazo'] : ['', 'Sem prazo'];
  return { deps, depTotal, saved, missing, pct, pace, thisMonth, left, needed, rate, eta, plan, status, target, done: target > 0 && missing <= 0 };
}
function goalCard(g) {
  const st = goalStats(g), col = safeColor(g.color, '#6366f1');
  const lines = [];
  if (st.done) lines.push(`Você juntou ${fmt(st.saved)}. Parabéns! 🥳`);
  else {
    if (st.left != null && st.left > 0) lines.push(`Guarde <b class="num">${fmt(st.needed)}</b> por mês para chegar até ${idxLabel(monIdx(g.deadline))} <span class="muted">(${monthsPhrase(st.left)})</span>`);
    else if (st.left != null) lines.push(`O prazo era ${idxLabel(monIdx(g.deadline))}. Que tal escolher um novo prazo?`);
    if (st.eta != null) lines.push(`${g.monthly > 0 ? `Guardando ${fmt(g.monthly)} por mês` : `No ritmo dos últimos meses (${fmt(st.pace)}/mês)`}, você chega em <b>${idxLabel(st.eta)}</b>`);
    else if (st.left == null) lines.push(`Sem prazo definido. Toque em <b>Guardar</b> para começar, ou edite a meta para colocar um prazo.`);
  }
  return `<div class="card goal"><div class="goal-top"><span class="goal-ico" style="background:color-mix(in srgb, ${col} 16%, transparent)">${esc(g.emoji || '🎯')}</span>
    <div class="grow" style="min-width:0"><div class="goal-name">${esc(g.name)}</div><span class="chip ${st.status[0]}">${st.status[1]}</span></div>
    <button class="icon-btn" data-act="goaledit" data-id="${esc(g.id)}" aria-label="Editar meta">${ic('pencil')}</button></div>
    <div class="goal-nums"><b class="num">${fmt(st.saved)}</b><span class="muted num">de ${fmt(g.target)}</span></div>
    <div class="progress goal-bar"><i style="width:${st.pct}%;background:${col}"></i></div>
    <div class="goal-foot"><span>${Math.floor(st.pct)}%</span><span>${st.done ? 'meta atingida' : `faltam <b class="num">${fmt(st.missing)}</b>`}</span></div>
    <div class="goal-lines">${lines.map(l => `<p>${l}</p>`).join('')}</div>
    <div class="goal-actions">${st.done ? '' : `<button class="btn primary sm" data-act="goalsave" data-id="${esc(g.id)}">${ic('plus')} Guardar</button>`}<button class="btn ghost sm" data-act="goalhist" data-id="${esc(g.id)}">${ic('calendar')} Histórico${st.deps.length ? ` (${st.deps.length})` : ''}</button></div></div>`;
}
function viewMetas() {
  const goals = D().goals;
  if (!goals.length) return `<div class="card goal-empty"><div class="ei">${ic('target')}</div><h2>Qual é o seu objetivo?</h2>
    <p class="muted">Um carro, uma viagem, a reserva de emergência… Diga quanto custa e até quando você quer. O app calcula quanto guardar por mês e acompanha o seu progresso.</p>
    <div class="goal-presets">${GOAL_PRESETS.map((p, i) => `<button class="step" data-act="goalnew" data-preset="${i}"><span class="goal-ico sm">${p.emoji}</span><b>${esc(p.name)}</b></button>`).join('')}</div>
    <button class="btn primary" data-act="goalnew">${ic('plus')} Criar outra meta</button></div>`;
  const all = goals.map(g => ({ g, st: goalStats(g) }));
  const active = all.filter(x => !x.st.done);
  const totalT = all.reduce((s, x) => s + num(x.g.target), 0), totalS = all.reduce((s, x) => s + x.st.saved, 0);
  const perMonth = active.reduce((s, x) => s + x.st.plan, 0);
  const sur = avgSurplus();
  let insight = '';
  if (sur && perMonth > 0) {
    const ok = sur.avg >= perMonth;
    insight = `<div class="banner ${ok ? 'ok' : 'warn'}">${ic(ok ? 'check' : 'info')}<div>Nos últimos ${sur.n === 1 ? 'mês' : sur.n + ' meses'} sobrou em média <b class="num">${fmt(sur.avg)}</b> por mês (antes de investir). Suas metas pedem <b class="num">${fmt(perMonth)}</b> por mês. ${ok ? 'Dá para cumprir! 💪' : `Faltam cerca de <b class="num">${fmt(perMonth - Math.max(0, sur.avg))}</b> por mês: dá para esticar algum prazo ou cortar alguns gastos.`}</div></div>`;
  }
  const order = x => x.st.done ? 2 : x.st.left != null ? 0 : 1;
  const list = all.slice().sort((a, b) => order(a) - order(b) || (monIdx(a.g.deadline) ?? 1e9) - (monIdx(b.g.deadline) ?? 1e9));
  return `<div class="stats"><div class="card stat"><span>Já guardado</span><b class="num pos">${fmt(totalS)}</b></div><div class="card stat"><span>Total das metas</span><b class="num">${fmt(totalT)}</b></div><div class="card stat"><span>Guardar por mês</span><b class="num" style="color:var(--blue)">${fmt(perMonth)}</b></div></div>
  ${insight}
  <div class="toolbar" style="justify-content:space-between"><span class="muted" style="font-size:13px">${active.length} em andamento${all.length - active.length ? ` · ${all.length - active.length} concluída(s)` : ''}</span><button class="btn sm" data-act="goalnew">${ic('plus')} Nova meta</button></div>
  <div class="goals-grid">${list.map(x => goalCard(x.g)).join('')}</div>
  <p class="muted" style="font-size:12.5px;margin:16px 2px 0">Cada valor guardado entra em <b>Investimentos</b> como aporte e conta nas saídas do mês. Assim o seu saldo mostra o dinheiro que sobra de verdade.</p>`;
}
function goalPreview(el, g) {
  const box = el.querySelector('[data-gprev]'); if (!box) return;
  const val = k => { const i = el.querySelector(`[data-k="${k}"]`); return i ? i.value : ''; };
  const money = k => { const v = parseMoney(val(k)); return Number.isFinite(v) ? v : 0; };
  const target = money('target');
  if (!(target > 0)) { box.innerHTML = `<span class="muted">Preencha o valor do objetivo para ver o plano.</span>`; return; }
  const st = goalStats(g, { target, initial: money('initial'), monthly: money('monthly'), deadline: val('deadline') || '' });
  const sur = avgSurplus(), out = [];
  if (st.done) out.push(`Com o que você já tem guardado, essa meta já está cumprida! 🎉`);
  else {
    if (st.left != null && st.left > 0) out.push(`Para juntar <b>${fmt(st.missing)}</b> até ${idxLong(monIdx(val('deadline')))}, guarde <b>${fmt(st.needed)}</b> por mês (${monthsPhrase(st.left)}).`);
    else if (st.left != null) out.push(`<span class="neg">Esse prazo já passou. Escolha um mês a partir de agora.</span>`);
    if (money('monthly') > 0 && st.eta != null) out.push(`Guardando <b>${fmt(money('monthly'))}</b> por mês, você chega lá em <b>${idxLong(st.eta)}</b>.`);
    if (st.left == null && !(money('monthly') > 0)) out.push(`Coloque um prazo <b>ou</b> quanto quer guardar por mês, e o app monta o plano.`);
    const pm = st.needed ?? (money('monthly') > 0 ? money('monthly') : 0);
    if (sur && sur.avg > 0 && pm > 0) out.push(`Isso é <b>${Math.round(pm / sur.avg * 100)}%</b> do que costuma sobrar por mês (${fmt(sur.avg)}).`);
  }
  box.innerHTML = out.map(x => `<p>${x}</p>`).join('');
}
function editGoal(id, prefill = {}) {
  const isNew = id == null;
  const g = isNew ? Object.assign({ emoji: '🎯', name: '', target: 0, deadline: '', initial: 0, monthly: 0, color: SWATCHES[D().goals.length % SWATCHES.length] }, prefill) : D().goals.find(x => String(x.id) === String(id));
  if (!g) return;
  const fields = [
    { k: 'emoji', label: 'Tipo', type: 'select', req: 1, full: 1, opts: GOAL_EMOJIS.map(([e, l]) => [e, `${e}  ${l}`]) },
    { k: 'name', label: 'Nome da meta', type: 'text', req: 1, full: 1, ph: 'Ex: Carro novo, Viagem para a praia' },
    { k: 'target', label: 'Quanto custa', type: 'money', req: 1 },
    { k: 'deadline', label: 'Até quando', type: 'month', hint: 'Vazio = sem prazo' },
    { k: 'initial', label: 'Já tenho guardado', type: 'money', hint: 'Dinheiro já separado para isso' },
    { k: 'monthly', label: 'Quero guardar por mês', type: 'money', hint: 'Opcional' },
    { k: 'color', label: 'Cor', type: 'color', full: 1 }
  ];
  const el = openForm({
    title: isNew ? 'Nova meta' : 'Editar meta', fields, values: g,
    extra: `<div class="goal-preview" data-gprev></div>${!isNew && goalDeposits(g).length ? `<p class="muted" style="font-size:12.5px;margin:10px 0 0">Já foram guardados ${fmt(goalDeposits(g).reduce((s, i) => s + num(i.amount), 0))} em ${goalDeposits(g).length} aporte(s), que somam no progresso.</p>` : ''}`,
    onSave: v => {
      if (v.deadline && monIdx(v.deadline) < nowIdx()) { toast('O prazo precisa ser deste mês em diante.', true); return false; }
      if (!v.deadline) v.deadline = '';
      if (isNew) {
        const ng = Object.assign({ id: uid('goal'), createdAt: monthStr(new Date().getMonth(), new Date().getFullYear()) }, v);
        D().goals.push(ng);
        const keys = ['goals'];
        if (g.fromPriority) { D().priorities = D().priorities.filter(p => String(p.id) !== String(g.fromPriority)); keys.push('priorities'); }
        commit(keys); toast(g.fromPriority ? 'Prioridade virou meta 🎯' : 'Meta criada 🎯');
        if (location.hash !== '#metas') go('metas');
      } else { Object.assign(g, v); commit(['goals']); toast('Meta atualizada'); }
    },
    onDelete: isNew ? null : () => {
      D().goals = D().goals.filter(x => x !== g);
      D().investments.forEach(i => { if (String(i.goalId) === String(g.id)) delete i.goalId; });
      commit(['goals', 'investments']); toast('Meta excluída');
    },
    deleteLabel: 'Excluir meta'
  });
  const upd = () => goalPreview(el, isNew ? { id: '__new__' } : g);
  el.addEventListener('input', upd); el.addEventListener('change', upd); upd();
}
function saveToGoal(id) {
  const g = D().goals.find(x => String(x.id) === String(id)); if (!g) return;
  const st = goalStats(g);
  const sug = st.needed ?? (num(g.monthly) > 0 ? num(g.monthly) : 0);
  const el = openForm({
    title: `Guardar para ${g.emoji || '🎯'} ${g.name}`,
    fields: [
      { k: 'amount', label: 'Quanto você guardou', type: 'money', req: 1, full: 1, hint: sug > 0 ? `Sugestão do plano: ${fmt(Math.min(sug, st.missing))} por mês` : `Faltam ${fmt(st.missing)}` },
      { k: 'date', label: 'Data', type: 'date', req: 1 },
      { k: 'category', label: 'Onde está guardado', type: 'select', req: 1, opts: INVEST_TYPES.map(t => [t, t === 'Crypto' ? 'Cripto' : t]) }
    ],
    values: { amount: sug > 0 ? Math.round(Math.min(sug, st.missing) * 100) / 100 : 0, date: todayStr(), category: 'Poupança' },
    extra: `<p class="muted" style="font-size:12.5px;margin:14px 0 0">Entra em <b>Investimentos</b> como aporte e conta nas saídas do mês.</p>`,
    onSave: v => {
      D().investments.push({ id: uid('inv'), name: `Meta: ${g.name}`, category: v.category, rate: '', amount: v.amount, date: v.date, goalId: g.id });
      commit(['investments']);
      const after = goalStats(g);
      toast(after.done ? `Meta "${g.name}" concluída! 🎉🎉` : `Guardado! Agora faltam ${fmt(after.missing)}`);
    }
  });
  focusAmount(el);
}
function goalHistory(id) {
  const g = D().goals.find(x => String(x.id) === String(id)); if (!g) return;
  const st = goalStats(g);
  const deps = st.deps.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const rows = deps.map(investRow);
  if (num(g.initial) > 0) rows.push(`<div class="row"><span class="ico-c tone-green">${ic('wallet')}</span><div class="grow"><div class="t">Já tinha guardado</div><div class="s">Valor inicial da meta</div></div><span class="amt num">${fmt(g.initial)}</span></div>`);
  openSheet({
    title: `${g.emoji || '🎯'} ${g.name}`,
    body: `<div data-dsheet><div class="goal-nums" style="margin:0 0 8px"><b class="num">${fmt(st.saved)}</b><span class="muted num">de ${fmt(g.target)}</span></div><div class="progress goal-bar"><i style="width:${st.pct}%;background:${safeColor(g.color)}"></i></div>
      <div class="list" style="margin-top:12px">${rows.length ? rows.join('') : emptyBox('target', 'Nada guardado ainda para esta meta.')}</div></div>`,
    foot: `<span class="grow"></span>${st.done ? '' : `<button class="btn primary" data-act="goalsave" data-id="${esc(g.id)}">${ic('plus')} Guardar</button>`}`,
    onMount: (sh, close) => sh.addEventListener('click', e => { if (e.target.closest('[data-edit],[data-act="goalsave"]')) close(); }, true)
  });
}
function goalsHomeCard() {
  const goals = D().goals; if (!goals.length) return '';
  const list = goals.map(g => ({ g, st: goalStats(g) })).filter(x => !x.st.done).slice(0, 3);
  if (!list.length) return '';
  return `<div class="card"><div class="card-head"><h3>Metas</h3><button class="btn ghost sm" data-goto="metas">Ver</button></div><div class="card-body"><div class="list">${list.map(({ g, st }) => `<div class="row click" data-goto="metas"><span class="goal-ico sm" style="background:color-mix(in srgb, ${safeColor(g.color)} 16%, transparent)">${esc(g.emoji || '🎯')}</span><div class="grow"><div class="t">${esc(g.name)}</div><div class="progress" style="margin-top:6px"><i style="width:${st.pct}%;background:${safeColor(g.color)}"></i></div></div><span class="amt num">${Math.floor(st.pct)}%<small>${fmtShort(st.saved)} de ${fmtShort(g.target)}</small></span></div>`).join('')}</div></div></div>`;
}

// ---------- assistente (IA: Firebase AI Logic + Gemini, plano gratuito) ----------
const AI_SDK = '13.2.0';
const AI_MODELS = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
const AI = { m: null, ai: null, model: 0, busy: false };
const aiOn = () => !(D().settings && D().settings.aiOff);
const chatLog = () => S.ui.chat || (S.ui.chat = []);
const AI_KINDS = { gasto: ['variableExpenses', 'gasto', 'cart'], entrada: ['earnings', 'entrada', 'down'], cartao: ['cardExpenses', 'compra no cartão', 'card'], aporte: ['investments', 'aporte', 'trend'], fixa: ['fixedCosts', 'conta fixa', 'repeat'] };
const S_STR = (description, extra = {}) => Object.assign({ type: 'string', nullable: true, description }, extra);
const AI_SCHEMA = {
  type: 'object', required: ['reply', 'actions'],
  properties: {
    reply: { type: 'string', description: 'Resposta curta e simpática para a pessoa, em português do Brasil, sem markdown' },
    actions: { type: 'array', description: 'Lançamentos para a pessoa confirmar. Vazio quando for só pergunta ou conversa.', items: {
      type: 'object', required: ['op', 'kind'],
      properties: {
        op: { type: 'string', format: 'enum', enum: ['add', 'update', 'delete'] },
        kind: { type: 'string', format: 'enum', enum: ['gasto', 'entrada', 'cartao', 'aporte', 'fixa'] },
        id: S_STR('id de um item existente (só para update/delete)'),
        description: S_STR('descrição curta, ex: Mercado'),
        amount: { type: 'number', nullable: true, description: 'valor em reais; no cartão é o valor total da compra' },
        date: S_STR('data AAAA-MM-DD'),
        category: S_STR('categoria de gasto, exatamente como na lista'),
        cardId: S_STR('id do cartão'),
        installments: { type: 'integer', nullable: true, description: 'número de parcelas no cartão' },
        goalId: S_STR('id da meta (aporte)'),
        dueDay: { type: 'integer', nullable: true, description: 'dia do vencimento (conta fixa)' },
        month: S_STR('AAAA-MM: em conta fixa nova, o mês em que começa; em update de conta fixa, muda o valor só desse mês'),
        paid: { type: 'boolean', nullable: true, description: 'gasto já pago (padrão sim)' }
      } } }
  }
};
function aiSystem() {
  const sm = isSimple();
  return `Você é o assistente do app de finanças pessoais "Minhas Finanças". A pessoa escreve do jeito que fala e você ajuda a lançar, corrigir e apagar movimentações, e responde perguntas sobre o dinheiro dela usando SÓ os dados enviados.
Regras:
- Responda sempre no formato JSON pedido. "reply" é curto (1 a 4 frases), em português do Brasil, simpático, sem markdown. Valores no formato R$ 1.234,56.
- Você NUNCA grava nada: só propõe "actions" e a pessoa confirma no app. Quando houver ações, o reply diz em uma frase o que você preparou e pede para conferir.
- Perguntas e conversa: actions vazio. Faça as contas com cuidado usando a lista e os resumos. Se o dado não existir, diga que não encontrou.
- Datas: converta "hoje", "ontem", "sexta", "dia 5" para AAAA-MM-DD a partir de hoje. Sem data = hoje.
- Gastou/paguei/comprei (à vista, pix, débito, dinheiro) => kind "gasto"${sm ? ' (category vazia)' : ', com a categoria mais parecida da lista'}.
- Recebi/ganhei/entrou/comissão/salário extra => kind "entrada".
${sm ? '- Este usuário usa o modo Simples: use só "gasto" e "entrada".' : `- No cartão / no crédito / parcelado em Nx => kind "cartao" com cardId da lista (se só houver um cartão, use ele; se houver vários e não disse qual, pergunte e não crie a ação), installments (1 se à vista) e amount = valor TOTAL.
- Guardei/investi/apliquei/separei para a meta => kind "aporte" (goalId se mencionar uma meta).
- Conta que se repete todo mês (aluguel, internet, academia) => kind "fixa" com dueDay e month (mês de início).
- "A conta de luz deste mês veio 230" => update da conta fixa com amount e month do mês (muda só aquele mês).`}
- Corrigir ou apagar: use o id de um item da lista "Lançamentos". Nunca invente id. "o último gasto" = o gasto com data mais recente. Se houver mais de um item possível e não der para saber qual, pergunte e não crie a ação.
- Em update, preencha só os campos que mudam.
- Várias coisas numa frase ("gastei 30 de uber e 50 de mercado") => várias actions. Máximo 10.
- Pode dar dicas gerais de organização financeira, mas não recomende investimentos, ações ou produtos específicos.
- Se pedirem algo fora de finanças pessoais, responda brevemente e volte ao assunto.`;
}
function aiContext() {
  const d = D(), sm = isSimple(), cur = nowIdx(), t = new Date();
  const inR = s => { const k = monIdx(s); return k != null && k >= cur - 2 && k <= cur + 1; };
  const L = [];
  L.push(`Hoje: ${todayStr()} (${WDAYS[t.getDay()]}). Mês aberto na tela: ${MONTHS[S.m]} de ${S.y}.`);
  if (!sm) {
    L.push('Categorias de gasto: ' + d.categories.map(c => c.name).join(', '));
    L.push('Cartões (id | nome | fecha dia | vence dia): ' + (d.cards.map(c => `${c.id} | ${c.name} | ${c.closingDay} | ${c.dueDay}`).join(' ; ') || 'nenhum'));
    L.push('Metas (id | nome | valor | guardado | prazo): ' + (d.goals.map(g => `${g.id} | ${g.name} | ${g.target} | ${goalStats(g).saved.toFixed(2)} | ${g.deadline || 'sem prazo'}`).join(' ; ') || 'nenhuma'));
    L.push('Contas fixas (id | nome | valor padrão | vence dia | começa | termina): ' + (d.fixedCosts.map(c => `${c.id} | ${c.name} | ${c.amount} | ${c.dueDay} | ${c.startDate || ''} | ${c.endDate || ''}`).join(' ; ') || 'nenhuma'));
    L.push('Renda fixa: ' + (d.fixedIncome.map(c => `${c.description} ${c.amount}`).join(' ; ') || 'nenhuma'));
  }
  const tx = [];
  d.variableExpenses.filter(x => inR(x.date)).forEach(x => { const [yy, mm] = parts(x.date); tx.push([x.date, `gasto | ${x.id} | ${x.date} | ${x.description || ''} | ${x.category || '-'} | ${num(x.amount)} | ${isPaid('variable', x.id, mm - 1, yy) ? 'pago' : 'não pago'}`]); });
  d.earnings.filter(x => inR(x.date)).forEach(x => tx.push([x.date, `entrada | ${x.id} | ${x.date} | ${x.description || ''} | ${num(x.amount)}`]));
  if (!sm) {
    d.investments.filter(x => inR(x.date)).forEach(x => tx.push([x.date, `aporte | ${x.id} | ${x.date} | ${x.name || ''} | ${num(x.amount)}${x.goalId ? ' | meta ' + x.goalId : ''}`]));
    d.cardExpenses.filter(x => inR(x.date)).forEach(x => { const c = d.cards.find(k => String(k.id) === String(x.cardId)); tx.push([x.purchaseDate || x.date, `cartao | ${x.id} | compra ${x.purchaseDate || '?'} | fatura ${x.date} | ${x.description || ''} | parcela ${x.installmentLabel || '1/1'} | ${num(x.amount)} | ${c ? c.name : ''}`]); });
  }
  tx.sort((a, b) => String(b[0]).localeCompare(String(a[0])));
  L.push(`Lançamentos dos últimos meses (tipo | id | ...), do mais recente para o mais antigo:\n${tx.slice(0, 150).map(x => x[1]).join('\n') || 'nenhum'}`);
  const sums = [];
  for (let k = cur - 2; k <= cur + 1; k++) {
    const r = calcM(k % 12, Math.floor(k / 12));
    const cats = Object.entries(r.catTotals).map(([n, v]) => `${n || 'Sem categoria'} ${v.toFixed(2)}`).join(', ');
    sums.push(`${MONTHS[k % 12]}/${Math.floor(k / 12)}: entradas ${r.income.toFixed(2)}; saídas já pagas ${r.expenses.toFixed(2)}; saldo ${r.remaining.toFixed(2)}${sm ? '' : `; contas fixas ${r.fixedTotal.toFixed(2)}; faturas ${r.cardsDue.toFixed(2)}; aportes ${r.investTotal.toFixed(2)}; total a pagar no mês ${r.monthlyTotal.toFixed(2)}; ainda pendente ${r.pendingTotal.toFixed(2)}`}; gastos por categoria: ${cats || 'nenhum'}`);
  }
  L.push('Resumo por mês:\n' + sums.join('\n'));
  return L.join('\n');
}
async function aiCall(text) {
  if (window.__aiMock) return window.__aiMock(text, aiContext());
  if (!window.FIREBASE_CONFIG) throw Object.assign(new Error('Modo local'), { code: 'local' });
  if (!AI.ai) {
    const base = `https://www.gstatic.com/firebasejs/${AI_SDK}/`;
    const [a, m] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-ai.js')]);
    const app = a.getApps().find(x => x.name === 'assistente') || a.initializeApp(window.FIREBASE_CONFIG, 'assistente');
    // proteção contra uso indevido (App Check com reCAPTCHA v3, gratuito). A chave do site vai em firebase-config.js
    if (window.APP_CHECK_KEY) { try { const ac = await import(base + 'firebase-app-check.js'); ac.initializeAppCheck(app, { provider: new ac.ReCaptchaV3Provider(window.APP_CHECK_KEY), isTokenAutoRefreshEnabled: true }); } catch (e) { console.warn('App Check', e); } }
    AI.m = m; AI.ai = m.getAI(app, { backend: new m.GoogleAIBackend() });
  }
  const hist = chatLog().slice(-9, -1).map(x => `${x.role === 'user' ? 'Pessoa' : 'Assistente'}: ${x.text}`).join('\n');
  const prompt = `${aiContext()}\n\n${hist ? `Conversa até agora:\n${hist}\n\n` : ''}Mensagem nova da pessoa: ${text}`;
  let last = null;
  for (let i = AI.model; i < AI_MODELS.length; i++) {
    const model = AI.m.getGenerativeModel(AI.ai, { model: AI_MODELS[i], systemInstruction: aiSystem(), generationConfig: { responseMimeType: 'application/json', responseSchema: AI_SCHEMA, temperature: 0.2, maxOutputTokens: 2048 } });
    try {
      const res = await model.generateContent(prompt);
      AI.model = i;
      const raw = res.response.text().trim().replace(/^```(json)?/i, '').replace(/```$/, '');
      return JSON.parse(raw);
    } catch (e) {
      const st = e && e.customErrorData && e.customErrorData.status, msg = String(e && e.message || '');
      console.warn('IA', AI_MODELS[i], st, msg);
      last = last && aiStatus(last) === 429 && st !== 429 ? last : e;
      if (/genai config not found|has been deactivated/i.test(msg)) throw e; // problema do projeto, não do modelo
      // modelo inexistente, sem cota gratuita ou que não aceita o pedido: tenta o próximo
      if (st === 404 || st === 429 || st === 400 || /not found|not supported|no longer available|quota|RESOURCE_EXHAUSTED/i.test(msg)) continue;
      throw e;
    }
  }
  throw last || new Error('Nenhum modelo respondeu');
}
const aiStatus = e => e && e.customErrorData && e.customErrorData.status;
function aiDetail(e) {
  const msg = String(e && e.message || ''), i = msg.lastIndexOf(']');
  return (i >= 0 ? msg.slice(i + 1) : msg).replace(/^[:\s]+/, '').trim().slice(0, 220);
}
function aiErrorText(e) {
  const st = e && e.customErrorData && e.customErrorData.status, msg = String(e && e.message || ''), code = e && e.code;
  if (/genai config not found/i.test(msg)) return 'O Firebase ainda não encontrou a chave da IA (Gemini) deste projeto. Isso costuma se resolver sozinho alguns minutos depois de ativar o AI Logic. Se continuar, confira se existe a chave "Gemini Developer API key" em Google Cloud → APIs e serviços → Credenciais.';
  if (/has been deactivated/i.test(msg)) return 'O Firebase pausou a IA deste projeto porque o App Check não está aplicado. No Firebase, abra App Check → APIs → Firebase AI Logic e clique em Aplicar.';
  if (code === 'local') return 'O assistente só funciona com a conta conectada (login com Google ou e-mail).';
  if (navigator.onLine === false) return 'Parece que você está sem internet. Tente de novo quando conectar.';
  if (code === 'AI/api-not-enabled' || code === 'api-not-enabled' || /api-not-enabled|has not been used|is disabled|SERVICE_DISABLED/i.test(msg)) return 'O assistente ainda não foi ativado no Firebase. No console do Firebase, abra "AI Logic", toque em "Começar" e escolha "Gemini Developer API". Depois é só tentar de novo.';
  if (st === 429 || /quota|RESOURCE_EXHAUSTED|Too Many Requests/i.test(msg)) return 'O limite gratuito do assistente foi atingido por agora. Espere um minutinho e tente de novo. (Se acontecer muito, pode ser o limite do dia.)' + (aiDetail(e) ? `\n\nDetalhe: ${aiDetail(e)}` : '');
  if (st === 401 || /app.?check|appcheck|UNAUTHENTICATED/i.test(msg)) return window.APP_CHECK_KEY ? 'A proteção do app (App Check) recusou o pedido. Confira se o domínio financas-degs.github.io está na chave do reCAPTCHA e se o App Check foi registrado no Firebase.' : 'O Firebase está exigindo a proteção do app (App Check), que ainda não foi configurada aqui. Me peça para configurar: é gratuito e leva uns 10 minutos.';
  if (st === 403 || /PERMISSION_DENIED|API key/i.test(msg)) return 'O Firebase recusou o pedido (permissão). Confira se o "AI Logic" está ativado com a "Gemini Developer API".' + (aiDetail(e) ? `\n\nDetalhe: ${aiDetail(e)}` : '');
  if (e instanceof SyntaxError) return 'Não entendi bem a resposta da IA. Pode repetir com outras palavras?';
  return 'Não consegui falar com a IA agora. Tente de novo em instantes.' + (aiDetail(e) ? `\n\nDetalhe${st ? ' (' + st + ')' : ''}: ${aiDetail(e)}` : '');
}
const aiList = kind => D()[AI_KINDS[kind][0]];
const aiFind = a => (aiList(a.kind) || []).find(x => String(x.id) === String(a.id));
const isDay = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) && !isNaN(new Date(s));
const isMon = s => /^\d{4}-\d{2}$/.test(String(s || ''));
// confere a ação da IA e completa o que faltar; devolve null se não dá para usar
function aiClean(raw) {
  const sm = isSimple(), d = D();
  const a = { op: raw.op, kind: raw.kind, state: 'pending' };
  if (!['add', 'update', 'delete'].includes(a.op) || !AI_KINDS[a.kind]) return null;
  if (sm && !['gasto', 'entrada'].includes(a.kind)) return null;
  const amt = raw.amount != null && Number.isFinite(Number(raw.amount)) ? Math.round(Math.abs(Number(raw.amount)) * 100) / 100 : null;
  if (raw.description) a.description = String(raw.description).trim().slice(0, 80);
  if (amt != null) a.amount = amt;
  if (raw.date) a.date = isDay(raw.date) ? raw.date : null;
  if (a.kind === 'gasto') { const c = d.categories.find(c => c.name.toLowerCase() === String(raw.category || '').toLowerCase()); a.category = sm ? '' : (c ? c.name : (a.op === 'add' ? (d.categories.find(c => c.name === 'Outros') || d.categories[0] || { name: '' }).name : undefined)); a.paid = raw.paid !== false; }
  if (a.kind === 'cartao' && a.op === 'add') { const c = d.cards.find(c => String(c.id) === String(raw.cardId)) || (d.cards.length === 1 ? d.cards[0] : null); if (!c) return null; a.cardId = c.id; a.installments = Math.min(48, Math.max(1, parseInt(raw.installments) || 1)); }
  if (a.kind === 'aporte' && raw.goalId && d.goals.some(g => String(g.id) === String(raw.goalId))) a.goalId = raw.goalId;
  if (a.kind === 'fixa') { if (raw.dueDay) a.dueDay = Math.min(31, Math.max(1, parseInt(raw.dueDay) || 10)); if (isMon(raw.month)) a.month = raw.month; }
  if (a.op === 'add') {
    if (!(a.amount > 0)) return null;
    if (!a.date) a.date = todayStr();
    if (!a.description) a.description = a.kind === 'gasto' ? (a.category || 'Gasto') : a.kind === 'entrada' ? 'Entrada' : a.kind === 'aporte' ? 'Aporte' : 'Conta';
    if (a.kind === 'fixa') { if (!a.dueDay) a.dueDay = 10; if (!a.month) a.month = monthStr(new Date().getMonth(), new Date().getFullYear()); }
  } else {
    a.id = raw.id; const it = aiFind(a); if (!it) return null;
    a.label = aiItemLabel(a);
    if (a.op === 'update' && a.amount == null && !a.description && !a.date && !(a.kind === 'gasto' && raw.category) && !a.dueDay && !a.goalId) return null;
    if (a.kind === 'fixa' && a.op === 'update' && a.month && a.amount == null) delete a.month;
  }
  return a;
}
function aiItemLabel(a) {
  const it = aiFind(a); if (!it) return '';
  const name = it.description || it.name || '—';
  return a.kind === 'fixa' ? `${name} · ${fmt(it.amount)}/mês` : `${name} · ${fmt(it.amount)} · ${fmtDate(it.date)}${it.installmentLabel ? ' · parcela ' + it.installmentLabel : ''}`;
}
function aiActionHTML(a, mi, ai) {
  const [, label, icon] = AI_KINDS[a.kind];
  const tone = a.op === 'delete' ? 'red' : a.kind === 'entrada' ? 'green' : a.kind === 'aporte' ? 'primary' : a.kind === 'cartao' ? 'violet' : 'blue';
  let title, rows = [];
  if (a.op === 'add') {
    title = { gasto: 'Novo gasto', entrada: 'Nova entrada', cartao: 'Compra no cartão', aporte: 'Guardar / investir', fixa: 'Nova conta fixa' }[a.kind];
    rows.push(['O quê', esc(a.description)]);
    rows.push(['Valor', `<b class="num">${fmt(a.amount)}</b>${a.kind === 'cartao' && a.installments > 1 ? ` <span class="muted">(${a.installments}x de ${fmt(a.amount / a.installments)})</span>` : ''}`]);
    if (a.kind === 'fixa') rows.push(['Vence', `dia ${a.dueDay} · a partir de ${fmtDate(a.month)}`]);
    else rows.push([a.kind === 'cartao' ? 'Compra em' : 'Data', fmtDate(a.date)]);
    if (a.kind === 'gasto' && a.category) rows.push(['Categoria', esc(a.category)]);
    if (a.kind === 'cartao') { const c = D().cards.find(c => String(c.id) === String(a.cardId)); rows.push(['Cartão', esc(c ? c.name : '?')]); }
    if (a.kind === 'aporte' && a.goalId) { const g = D().goals.find(g => String(g.id) === String(a.goalId)); if (g) rows.push(['Meta', `${esc(g.emoji || '🎯')} ${esc(g.name)}`]); }
  } else if (a.op === 'update') {
    const it = aiFind(a) || {};
    title = `Alterar ${label}`;
    rows.push(['Item', esc(a.label || aiItemLabel(a))]);
    if (a.amount != null) rows.push([a.kind === 'fixa' && a.month ? `Valor de ${fmtDate(a.month)}` : 'Novo valor', `<b class="num">${fmt(a.amount)}</b>`]);
    if (a.description && a.description !== (it.description || it.name)) rows.push(['Novo nome', esc(a.description)]);
    if (a.date && a.date !== it.date) rows.push(['Nova data', fmtDate(a.date)]);
    if (a.kind === 'gasto' && a.category && a.category !== it.category) rows.push(['Categoria', esc(a.category)]);
    if (a.dueDay) rows.push(['Vencimento', 'dia ' + a.dueDay]);
  } else {
    const it = aiFind(a) || {};
    const grp = a.kind === 'cartao' && it.groupId ? D().cardExpenses.filter(x => x.groupId === it.groupId).length : 1;
    title = `Excluir ${label}`;
    rows.push(['Item', esc(a.label || aiItemLabel(a))]);
    if (grp > 1) rows.push(['Atenção', `apaga a compra inteira (${grp} parcelas)`]);
  }
  const k = `${mi}|${ai}`;
  const foot = a.state === 'done' ? `<span class="chip green">${ic('check')} Feito</span>` : a.state === 'discarded' ? `<span class="chip">Descartado</span>` : a.state === 'gone' ? `<span class="chip">Item não existe mais</span>`
    : `<button class="btn sm ${a.op === 'delete' ? 'danger solid' : 'primary'}" data-aiact="ok|${k}">${ic('check')} ${a.op === 'delete' ? 'Excluir' : 'Confirmar'}</button>${a.op !== 'delete' ? `<button class="btn sm" data-aiact="edit|${k}">${ic('pencil')} Ajustar</button>` : ''}<button class="btn ghost sm" data-aiact="no|${k}">Descartar</button>`;
  return `<div class="ai-card${a.state !== 'pending' ? ' settled' : ''}"><div class="ai-card-h"><span class="ico-c tone-${tone}">${ic(a.op === 'delete' ? 'trash' : a.op === 'update' ? 'pencil' : icon)}</span><b>${title}</b></div>
    <div class="ai-rows">${rows.map(([l, v]) => `<div><span>${l}</span><span>${v}</span></div>`).join('')}</div><div class="ai-card-f">${foot}</div></div>`;
}
const AI_SNAP_KEYS = ['variableExpenses', 'earnings', 'investments', 'cardExpenses', 'fixedCosts', 'payments'];
function aiApply(a) {
  const d = D(), sm = isSimple(), keys = new Set([AI_KINDS[a.kind][0]]);
  if (!['add'].includes(a.op) && !aiFind(a)) { a.state = 'gone'; return false; }
  if (a.op === 'add') {
    if (a.kind === 'gasto') { const it = { id: uid('var'), description: a.description, amount: a.amount, date: a.date, category: sm ? '' : (a.category || '') }; if (sm) it.simple = true; d.variableExpenses.push(it); if (a.paid !== false || sm) { const [yy, mm] = parts(it.date); setPaid('variable', it.id, true, mm - 1, yy, mm - 1, yy); } keys.add('payments'); }
    else if (a.kind === 'entrada') { const it = { id: uid('ear'), description: a.description, amount: a.amount, date: a.date, color: '#10b981' }; if (sm) it.simple = true; d.earnings.push(it); }
    else if (a.kind === 'cartao') saveCardPurchase({ cardId: a.cardId, description: a.description, amount: a.amount, installments: a.installments || 1, date: a.date }, true);
    else if (a.kind === 'aporte') d.investments.push(Object.assign({ id: uid('inv'), name: a.description, category: 'Outros', rate: '', amount: a.amount, date: a.date }, a.goalId ? { goalId: a.goalId } : {}));
    else if (a.kind === 'fixa') d.fixedCosts.push({ id: uid('fix'), name: a.description, amount: a.amount, dueDay: a.dueDay || 10, startDate: a.month, color: SWATCHES[d.fixedCosts.length % SWATCHES.length] });
  } else if (a.op === 'update') {
    const it = aiFind(a);
    if (a.kind === 'fixa') {
      if (a.amount != null) { if (a.month) { it.amounts = Object.assign({}, it.amounts); if (Math.abs(a.amount - num(it.amount)) < 0.005) delete it.amounts[a.month]; else it.amounts[a.month] = a.amount; if (!Object.keys(it.amounts).length) delete it.amounts; } else it.amount = a.amount; }
      if (a.description) it.name = a.description; if (a.dueDay) it.dueDay = a.dueDay;
    } else {
      const wasPaid = a.kind === 'gasto' && (() => { const [yy, mm] = parts(it.date); return isPaid('variable', it.id, mm - 1, yy); })();
      if (a.amount != null) it.amount = a.amount;
      if (a.description) { if (a.kind === 'aporte') it.name = a.description; else it.description = a.description; }
      if (a.date && a.kind !== 'cartao') it.date = a.date;
      if (a.kind === 'gasto' && a.category !== undefined && a.category && !sm) it.category = a.category;
      if (a.kind === 'aporte' && a.goalId) it.goalId = a.goalId;
      if (a.kind === 'gasto' && a.date) { d.payments = d.payments.filter(p => !(p.type === 'variable' && String(p.originalId) === String(it.id))); if (wasPaid) { const [yy, mm] = parts(it.date); setPaid('variable', it.id, true, mm - 1, yy, mm - 1, yy); } keys.add('payments'); }
    }
  } else {
    const it = aiFind(a);
    if (a.kind === 'cartao' && it.groupId) d.cardExpenses = d.cardExpenses.filter(x => x.groupId !== it.groupId);
    else d[AI_KINDS[a.kind][0]] = aiList(a.kind).filter(x => x !== it);
    if (a.kind === 'gasto') { d.payments = d.payments.filter(p => !(p.type === 'variable' && String(p.originalId) === String(it.id))); keys.add('payments'); }
  }
  a.state = 'done';
  return [...keys];
}
function aiConfirm(list) {
  const snap = clone(Object.fromEntries(AI_SNAP_KEYS.map(k => [k, D()[k]])));
  const keys = new Set(); let n = 0;
  list.forEach(a => { const k = aiApply(a); if (k) { k.forEach(x => keys.add(x)); n++; } });
  if (!n) { render(); return toast('Esse item não existe mais.', true); }
  commit([...keys]);
  toast(n > 1 ? `${n} itens salvos` : list[0].op === 'delete' ? 'Excluído' : 'Salvo', false, { label: 'Desfazer', fn: () => { Object.assign(S.data, snap); list.forEach(a => { if (a.state === 'done') a.state = 'pending'; }); commit(AI_SNAP_KEYS); } });
}
function aiEdit(a) {
  const sm = isSimple();
  const F = {
    gasto: [{ k: 'description', label: 'Descrição', type: 'text', req: 1, full: 1 }, { k: 'amount', label: 'Valor', type: 'money', req: 1 }, { k: 'date', label: 'Data', type: 'date', req: 1 }].concat(sm ? [] : [{ k: 'category', label: 'Categoria', type: 'select', req: 1, full: 1, opts: catOpts }]),
    entrada: [{ k: 'description', label: 'Descrição', type: 'text', req: 1, full: 1 }, { k: 'amount', label: 'Valor', type: 'money', req: 1 }, { k: 'date', label: 'Data', type: 'date', req: 1 }],
    cartao: [{ k: 'cardId', label: 'Cartão', type: 'select', req: 1, full: 1, opts: () => D().cards.map(c => [c.id, c.name]) }, { k: 'description', label: 'O que foi comprado', type: 'text', req: 1, full: 1 }, { k: 'amount', label: 'Valor total', type: 'money', req: 1 }, { k: 'installments', label: 'Parcelas', type: 'int', req: 1, max: 48 }, { k: 'date', label: 'Data da compra', type: 'date', req: 1, full: 1 }],
    aporte: [{ k: 'description', label: 'Nome', type: 'text', req: 1, full: 1 }, { k: 'amount', label: 'Valor', type: 'money', req: 1 }, { k: 'date', label: 'Data', type: 'date', req: 1 }, { k: 'goalId', label: 'Para qual meta', type: 'select', full: 1, opts: () => D().goals.map(g => [g.id, `${g.emoji || '🎯'} ${g.name}`]), showIf: () => D().goals.length > 0 }],
    fixa: [{ k: 'description', label: 'Nome da conta', type: 'text', req: 1, full: 1 }, { k: 'amount', label: a.op === 'update' && a.month ? `Valor de ${fmtDate(a.month)}` : 'Valor mensal', type: 'money', req: 1 }, { k: 'dueDay', label: 'Dia do vencimento', type: 'day', req: 1 }].concat(a.op === 'add' ? [{ k: 'month', label: 'Começa em', type: 'month', req: 1 }] : [])
  };
  let fields = F[a.kind];
  const it = a.op === 'update' ? aiFind(a) : null;
  const values = Object.assign({}, it ? { description: it.description || it.name, amount: it.amount, date: it.date, category: it.category, dueDay: it.dueDay, goalId: it.goalId } : {}, a);
  if (a.op === 'update' && a.kind === 'cartao') fields = [{ k: 'description', label: 'Descrição', type: 'text', req: 1, full: 1 }, { k: 'amount', label: 'Valor desta parcela', type: 'money', req: 1, full: 1 }];
  openForm({ title: 'Ajustar antes de salvar', fields, values, onSave: v => { Object.keys(v).forEach(k => { if (v[k] !== '' && v[k] != null) a[k] = v[k]; else if (k === 'goalId') delete a.goalId; }); render(); } });
}
async function aiSend(text) {
  text = String(text || '').trim();
  if (!text || AI.busy) return;
  if (!D().settings.aiConsent) {
    const ok = await ask('Antes de começar', 'Para entender o que você escreve, o assistente envia sua mensagem e um resumo dos seus lançamentos dos últimos meses para a IA do Google (Gemini). Seu nome e e-mail <b>não</b> são enviados.<br><br>No plano gratuito, o Google pode usar esse conteúdo para melhorar os produtos dele. Nada é salvo sem você confirmar.', 'Entendi, continuar');
    if (!ok) return;
    D().settings.aiConsent = true; commit(['settings']);
  }
  S.ui.chatDraft = '';
  chatLog().push({ role: 'user', text });
  AI.busy = true;
  if (S.view !== 'assistente') go('assistente'); else render();
  let msg;
  try {
    const out = await aiCall(text) || {};
    const acts = (Array.isArray(out.actions) ? out.actions : []).slice(0, 10).map(x => x && aiClean(x)).filter(Boolean);
    const dropped = (Array.isArray(out.actions) ? out.actions.length : 0) - acts.length;
    msg = { role: 'bot', text: String(out.reply || (acts.length ? 'Preparei isso, confira:' : 'Não entendi. Pode explicar de outro jeito?')).slice(0, 1200), actions: acts };
    if (dropped > 0) msg.note = dropped === 1 ? 'Uma das sugestões não pôde ser usada (faltou valor, cartão ou o item não foi encontrado).' : `${dropped} sugestões não puderam ser usadas (faltou valor, cartão ou o item não foi encontrado).`;
  } catch (e) { console.error(e); msg = { role: 'bot', text: aiErrorText(e), error: true }; }
  AI.busy = false;
  chatLog().push(msg);
  if (S.ready) render();
  aiScroll();
}
function aiScroll() { requestAnimationFrame(() => { const end = document.getElementById('chatend'); if (end) end.scrollIntoView({ block: 'end', behavior: 'smooth' }); }); }
const aiText = s => esc(s).replace(/\n/g, '<br>');
function aiSuggestions() {
  if (isSimple()) return ['Recebi 350 de comissão hoje', 'Gastei 42 de gasolina', 'Quanto entrou este mês?', 'Apaga a última saída'];
  const s = ['Gastei 87 no mercado hoje', 'Recebi 1.200 de comissão', 'Quanto gastei com alimentação este mês?'];
  if (D().cards.length) s.push(`Comprei um tênis de 300 em 3x no ${D().cards[0].name}`);
  if (D().goals.length) s.push(`Guardei 200 para ${D().goals[0].name.toLowerCase()}`);
  s.push('A conta de luz deste mês veio 230', 'Quanto sobra até o fim do mês?');
  return s.slice(0, 6);
}
function askBar() {
  if (!aiOn()) return '';
  return `<form class="ask-bar" data-chatform><span class="ask-ico">${ic('sparkle')}</span><input data-chatq autocomplete="off" enterkeyhint="send" placeholder="${isSimple() ? 'Ex: recebi 350 de comissão hoje' : 'Ex: gastei 87 no mercado hoje'}" aria-label="Escreva para o assistente"><button class="btn primary sm" type="submit" aria-label="Enviar">${ic('send')}</button></form>`;
}
function viewAssistente() {
  if (!aiOn()) return `<div class="card goal-empty"><div class="ei">${ic('sparkle')}</div><h2>Assistente desligado</h2><p class="muted">Você desligou o assistente com IA nos Ajustes.</p><button class="btn primary" data-act="aion">Ligar o assistente</button></div>`;
  const log = chatLog();
  let h = `<div class="chat">`;
  if (!log.length) h += `<div class="chat-intro"><div class="ai-ava">${ic('sparkle')}</div><h2>Oi! Como posso ajudar?</h2><p class="muted">Me conte o que entrou e o que saiu do jeito que você fala. Eu preparo o lançamento e você confirma. Também posso corrigir, apagar e responder perguntas sobre o seu dinheiro.</p>
    <div class="chat-sugs">${aiSuggestions().map(s => `<button class="chip-btn" data-aisug="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>`;
  log.forEach((m, mi) => {
    if (m.role === 'user') h += `<div class="msg me"><div class="bubble">${aiText(m.text)}</div></div>`;
    else {
      const pend = (m.actions || []).filter(a => a.state === 'pending').length;
      h += `<div class="msg bot"><span class="ai-ava sm">${ic('sparkle')}</span><div class="bot-col"><div class="bubble${m.error ? ' err' : ''}">${aiText(m.text)}</div>
        ${(m.actions || []).map((a, ai) => aiActionHTML(a, mi, ai)).join('')}
        ${pend > 1 ? `<button class="btn primary sm" data-aiact="all|${mi}|0">${ic('check')} Confirmar todos (${pend})</button>` : ''}
        ${m.note ? `<p class="muted ai-note">${esc(m.note)}</p>` : ''}</div></div>`;
    }
  });
  if (AI.busy) h += `<div class="msg bot"><span class="ai-ava sm">${ic('sparkle')}</span><div class="bubble typing"><i></i><i></i><i></i></div></div>`;
  h += `<div id="chatend"></div></div>
  <form class="chat-input" data-chatform><input data-chatq autocomplete="off" enterkeyhint="send" placeholder="Escreva aqui…" value="${esc(S.ui.chatDraft || '')}" aria-label="Mensagem para o assistente"${AI.busy ? ' disabled' : ''}><button class="btn primary" type="submit" aria-label="Enviar"${AI.busy ? ' disabled' : ''}>${ic('send')}</button></form>
  <p class="chat-foot muted">A IA pode errar: confira antes de confirmar.${log.length ? ' <button class="linkish" data-act="aiclear">Limpar conversa</button>' : ''}</p>`;
  return h;
}

// ---------- modo simplificado ----------
const WDAYS = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
function setMode(simple) {
  if (isSimple() === simple) return;
  D().settings.simple = simple;
  S.view = simple ? 'simples' : 'inicio';
  try { history.replaceState(null, '', '#' + S.view); } catch {}
  commit(['settings']);
  window.scrollTo(0, 0);
  toast(simple ? 'Modo simples: só entradas e saídas' : 'Modo completo ativado');
}
// todas as movimentações reais do mês, com data (o que entrou e o que saiu)
function simpleMoves(m, y) {
  const c = calcM(m, y), last = new Date(y, m + 1, 0).getDate(), first = `${y}-${pad(m + 1)}-01`, list = [];
  const inM = s => (s && inMonth(s, m, y) ? s : first);
  c.fixedIncomeMonth.forEach(i => list.push({ dir: 'in', date: first, desc: i.description || 'Renda fixa', sub: fixedOver(i, m, y) ? 'Renda fixa · valor do mês' : 'Renda fixa · todo mês', amount: fixedAmt(i, m, y), edit: ['fixedIncome', i.id], q: `fixedIncome|${i.id}|${m}|${y}` }));
  c.earningsMonth.forEach(i => list.push({ dir: 'in', date: i.date, desc: i.description || 'Entrada', amount: num(i.amount), simple: ['earnings', i.id], q: `earnings|${i.id}` }));
  c.receivables.filter(r => r.isPaid).forEach(r => list.push({ dir: 'in', date: `${y}-${pad(m + 1)}-${pad(Math.min(r.day, last))}`, desc: `${r.name} (${r.label})`, sub: 'Valor recebido', amount: r.amount, q: `debtsReceivable|${r.id}` }));
  c.outflows.forEach(o => list.push({ dir: 'out', date: inM(o.date), desc: o.desc || 'Saída', sub: o.simple ? '' : o.sub, amount: o.amount, simple: o.simple, edit: o.edit, q: o.q }));
  return list;
}
function dailyChart(moves, m, y) {
  const n = new Date(y, m + 1, 0).getDate(), inn = Array(n + 1).fill(0), out = Array(n + 1).fill(0);
  moves.forEach(x => { const d = parts(x.date)[2] || 1; (x.dir === 'in' ? inn : out)[d] += x.amount; });
  const W = 440, H = 150, pl = 36, pb = 20, pt = 8, max = Math.max(1, ...inn, ...out) * 1.1;
  const gw = (W - pl) / n, bw = Math.max(2, Math.min(7, gw / 2.6));
  const yv = v => pt + (H - pt - pb) * (1 - v / max);
  const grid = [0, .5, 1].map(f => { const v = max * f; return `<line x1="${pl}" x2="${W}" y1="${yv(v)}" y2="${yv(v)}" stroke="var(--border)" stroke-dasharray="3 4"/><text x="${pl - 6}" y="${yv(v) + 4}" text-anchor="end">${fmtShort(v)}</text>`; }).join('');
  let bars = '';
  for (let d = 1; d <= n; d++) {
    const x = pl + gw * (d - 1) + gw / 2;
    if (inn[d]) bars += `<rect x="${x - bw}" y="${yv(inn[d])}" width="${bw}" height="${Math.max(1, H - pb - yv(inn[d]))}" rx="2" fill="var(--green)"><title>Dia ${d}: entrou ${fmt(inn[d])}</title></rect>`;
    if (out[d]) bars += `<rect x="${x}" y="${yv(out[d])}" width="${bw}" height="${Math.max(1, H - pb - yv(out[d]))}" rx="2" fill="var(--red)" opacity=".85"><title>Dia ${d}: saiu ${fmt(out[d])}</title></rect>`;
    if (d === 1 || d % 5 === 0) bars += `<text x="${x}" y="${H - 5}" text-anchor="middle">${d}</text>`;
  }
  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet">${grid}${bars}</svg><div class="legend"><span><i style="background:var(--green)"></i>Entrou</span><span><i style="background:var(--red)"></i>Saiu</span></div>`;
}
function viewSimples() {
  const c = C(), moves = simpleMoves(S.m, S.y);
  const ci = carryIn(S.m, S.y), res = c.income - c.expenses, final = (ci ? ci.prev : 0) + res;
  const t = new Date(), today = todayStr(), yd = (() => { const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
  let h = '';
  if (D().settings.isDemo) h += `<div class="banner demo">${ic('sparkle')}<div class="grow"><b>Você está vendo dados de exemplo.</b></div><button class="btn sm" data-act="cleardemo">${ic('trash')} Remover exemplo</button></div>`;
  h += askBar();
  h += `<div class="hero"><div class="hero-label">${ci ? 'Saldo acumulado' : 'Saldo de ' + MONTHS[S.m].toLowerCase()}</div>
    <div class="hero-value num" data-detail="restante" style="margin-bottom:${ci ? 4 : 16}px">${fmt(final)}</div>
    ${ci ? `<div class="hero-carry" data-detail="restante">Veio do mês anterior <b class="num">${fmt(ci.prev)}</b> <span>·</span> Resultado de ${MONTHS[S.m].toLowerCase()} <b class="num">${res >= 0 ? '+' : ''}${fmt(res)}</b></div>` : ''}
    <div class="hero-row" style="grid-template-columns:1fr 1fr">
      <button class="hero-mini" data-detail="entradas"><span>${ic('down')} Entrou no mês</span><b class="num">${fmt(c.income)}</b></button>
      <button class="hero-mini" data-detail="saidas"><span>${ic('up')} Saiu no mês</span><b class="num">${fmt(c.expenses)}</b></button>
    </div></div>`;
  h += `<div class="sbtns"><button class="sbig in" data-act="sadd" data-dir="in">${ic('plus')}<span>Entrada<small>Recebi</small></span></button><button class="sbig out" data-act="sadd" data-dir="out"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg><span>Saída<small>Gastei / paguei</small></span></button></div>`;
  // dias
  const byDay = {};
  moves.forEach(x => { (byDay[x.date] = byDay[x.date] || []).push(x); });
  const days = Object.keys(byDay).sort().reverse();
  const chart = moves.length ? `<div class="card schart"><div class="card-head"><h3>Dia a dia</h3><span class="sub">${MONTHS[S.m]}</span></div><div class="card-body">${dailyChart(moves, S.m, S.y)}</div></div>` : '';
  const dayCards = days.map(d => {
    const items = byDay[d].sort((a, b) => (a.dir === b.dir ? 0 : a.dir === 'in' ? -1 : 1));
    const tin = items.filter(x => x.dir === 'in').reduce((s, x) => s + x.amount, 0), tout = items.filter(x => x.dir === 'out').reduce((s, x) => s + x.amount, 0);
    const [yy, mm, dd] = parts(d), wd = WDAYS[new Date(yy, mm - 1, dd).getDay()];
    const label = d === today ? 'Hoje' : d === yd ? 'Ontem' : `${pad(dd)}/${pad(mm)}`;
    const rows = items.map(x => {
      const attr = x.simple ? ` data-sedit="${esc(x.simple[0])}|${esc(x.simple[1])}"` : x.edit ? ` data-edit="${esc(x.edit[0])}" data-id="${esc(x.edit[1])}"` : '';
      return `<div class="row${attr ? ' click' : ''}"${attr}><span class="ico-c tone-${x.dir === 'in' ? 'green' : 'red'}">${ic(x.dir === 'in' ? 'down' : 'up')}</span><div class="grow"><div class="t">${esc(x.desc)}</div>${x.sub ? `<div class="s">${esc(x.sub)}</div>` : ''}</div>${x.q ? amtBtn(x.q, `${x.dir === 'in' ? '+' : '−'} ${fmt(x.amount)}`, x.dir === 'in' ? 'pos' : 'neg') : `<div class="amt num ${x.dir === 'in' ? 'pos' : 'neg'}">${x.dir === 'in' ? '+' : '−'} ${fmt(x.amount)}</div>`}</div>`;
    }).join('');
    return `<div class="sday"><div class="sday-head"><div><b>${label}</b><span>${label.includes('/') ? wd : `${pad(dd)}/${pad(mm)} · ${wd}`}</span></div><div class="sday-tot">${tin ? `<span class="pos num">+ ${fmt(tin)}</span>` : ''}${tout ? `<span class="neg num">− ${fmt(tout)}</span>` : ''}</div></div><div class="list">${rows}</div></div>`;
  }).join('');
  h += `<div class="sgrid${chart ? '' : ' one'}"><div class="card"><div class="card-body" style="padding-top:6px">${dayCards || emptyBox('wallet', `Nada lançado em ${MONTHS[S.m].toLowerCase()} ainda.<br>Toque em <b>Entrada</b> quando receber algo e em <b>Saída</b> quando gastar.`)}</div></div>${chart}</div>`;
  if (c.pendingTotal > 0 && c.payables.some(p => !p.isPaid && p.type !== 'variable')) h += `<p class="muted" style="font-size:12.5px;margin-top:12px">Você também tem ${fmt(c.pendingTotal)} em contas a pagar cadastradas no modo completo. Elas só entram aqui quando forem marcadas como pagas.</p>`;
  return h;
}
function simpleForm(dir = 'in', id) {
  const keyOf = d => (d === 'in' ? 'earnings' : 'variableExpenses');
  const editing = id != null;
  const item = editing ? D()[keyOf(dir)].find(x => String(x.id) === String(id)) : null;
  if (editing && !item) return;
  let cur = dir;
  const fields = () => [
    { k: 'amount', label: cur === 'in' ? 'Quanto entrou?' : 'Quanto saiu?', type: 'money', req: 1, full: 1 },
    { k: 'date', label: 'Dia', type: 'date', req: 1, full: 1 },
    { k: 'description', label: 'Descrição', type: 'text', full: 1, ph: cur === 'in' ? 'Ex: comissão, venda' : 'Ex: mercado, gasolina' }
  ];
  const def = () => (cur === 'in' ? 'Entrada' : 'Saída');
  const draw = (sh, keep) => {
    const vals = keep || (item ? { amount: item.amount, date: item.date, description: item.description } : { date: defaultDate() });
    sh.querySelector('.sheet-body').innerHTML = (editing ? '' : `<div class="type-tabs" style="grid-template-columns:1fr 1fr">${[['in', 'down', 'Entrada'], ['out', 'up', 'Saída']].map(([k, i, l]) => `<button type="button" data-sdir="${k}" class="${k === cur ? 'on' : ''} ${k}">${ic(i)}${l}</button>`).join('')}</div>`) +
      `<form class="fields sform ${cur}" novalidate>${fields().map(f => fieldHTML(f, vals[f.k])).join('')}</form>`;
    sh.querySelector('.sheet-head h3').textContent = editing ? (cur === 'in' ? 'Editar entrada' : 'Editar saída') : (cur === 'in' ? 'Nova entrada' : 'Nova saída');
    sh.querySelector('[data-save]').className = `btn ${cur === 'in' ? 'green' : 'red'}-solid`;
    sh.querySelectorAll('[data-sdir]').forEach(b => b.onclick = () => {
      const keep = {}; sh.querySelectorAll('[data-k]').forEach(el => { keep[el.dataset.k] = el.dataset.k === 'amount' ? parseMoney(el.value) : el.value; });
      cur = b.dataset.sdir; S.ui.simpleDir = cur; draw(sh, keep); const a = sh.querySelector('[data-k="amount"]'); a && a.focus();
    });
    sh.querySelector('form').onsubmit = e => { e.preventDefault(); sh.querySelector('[data-save]').click(); };
    sh.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sh.querySelector('[data-save]').click(); } }));
  };
  const syncPay = it => {
    D().payments = D().payments.filter(p => !(p.type === 'variable' && String(p.originalId) === String(it.id)));
    const [yy, mm] = parts(it.date); setPaid('variable', it.id, true, mm - 1, yy, mm - 1, yy);
  };
  openSheet({
    title: '', body: '',
    foot: `${editing ? `<button class="btn danger" data-del>${ic('trash')}<span>Excluir</span></button>` : ''}<span class="grow"></span><button class="btn" data-cancel>Cancelar</button><button class="btn" data-save>Salvar</button>`,
    onMount: (sh, close) => {
      draw(sh);
      setTimeout(() => { const a = sh.querySelector('[data-k="amount"]'); if (a) a.focus(); }, 280);
      sh.querySelector('[data-cancel]').onclick = close;
      sh.querySelector('[data-save]').onclick = () => {
        const v = readFields(sh, fields()); if (!v) return;
        const key = keyOf(cur), desc = v.description || def();
        if (editing) {
          Object.assign(item, { amount: v.amount, date: v.date, description: desc });
          if (key === 'variableExpenses') { syncPay(item); commit([key, 'payments']); } else commit([key]);
          toast('Alterações salvas');
        } else if (cur === 'in') {
          D().earnings.push({ id: uid('ear'), description: desc, amount: v.amount, date: v.date, color: '#10b981', simple: true });
          commit(['earnings']); toast(`Entrada de ${fmt(v.amount)} lançada`);
        } else {
          const it = { id: uid('var'), description: desc, amount: v.amount, date: v.date, category: '', simple: true };
          D().variableExpenses.push(it); syncPay(it);
          commit(['variableExpenses', 'payments']); toast(`Saída de ${fmt(v.amount)} lançada`);
        }
        const [yy, mm] = parts(v.date);
        if (yy !== S.y || mm - 1 !== S.m) { S.m = mm - 1; S.y = yy; render(); }
        close();
      };
      const del = sh.querySelector('[data-del]');
      if (del) del.onclick = async () => {
        if (!(await ask('Excluir lançamento?', `"${esc(item.description)}" de ${fmt(item.amount)} será apagado.`, 'Excluir', true))) return;
        const key = keyOf(cur);
        D()[key] = D()[key].filter(x => x !== item);
        if (key === 'variableExpenses') { D().payments = D().payments.filter(p => !(p.type === 'variable' && String(p.originalId) === String(item.id))); commit([key, 'payments']); } else commit([key]);
        close(); toast('Lançamento excluído');
      };
    }
  });
}
const VIEW_FN = { simples: viewSimples, inicio: viewInicio, contas: viewContas, entradas: viewEntradas, fixas: viewFixas, gastos: viewGastos, cartoes: viewCartoes, investimentos: viewInvest, dividas: viewDividas, negativados: viewNegativados, prioridades: viewPrioridades, metas: viewMetas, assistente: viewAssistente, ajustes: viewAjustes };
const TITLES = Object.fromEntries(NAV.concat(NAV_SIMPLE).filter(n => n.v).map(n => [n.v, n.t]));
const MONTHLESS = ['assistente', 'negativados', 'prioridades', 'metas', 'ajustes'];

function manageCategories() {
  const draw = sh => {
    sh.querySelector('.sheet-body').innerHTML = `<div class="list">${D().categories.map((c, i) => `<div class="row"><input type="color" value="${safeColor(c.color)}" data-ccolor="${i}" style="width:38px;height:38px;border:0;background:none;padding:0;cursor:pointer"><div class="grow"><input class="input" data-cname="${i}" value="${esc(c.name)}"></div><button class="icon-btn" data-cdel="${i}" aria-label="Excluir categoria">${ic('trash')}</button></div>`).join('')}</div>
      <form class="fields" style="margin-top:14px" data-cadd><div class="field full" style="flex-direction:row;gap:8px"><input class="input" placeholder="Nova categoria" data-cnew><button class="btn primary" type="submit">${ic('plus')}</button></div></form>`;
    sh.querySelectorAll('[data-cname]').forEach(el => el.onchange = () => { const i = +el.dataset.cname, old = D().categories[i].name, nv = el.value.trim(); if (!nv) { el.value = old; return; } D().categories[i].name = nv; D().variableExpenses.forEach(v => { if (v.category === old) v.category = nv; }); commit(['categories', 'variableExpenses']); });
    sh.querySelectorAll('[data-ccolor]').forEach(el => el.onchange = () => { D().categories[+el.dataset.ccolor].color = el.value; commit(['categories']); });
    sh.querySelectorAll('[data-cdel]').forEach(el => el.onclick = async () => { const c = D().categories[+el.dataset.cdel]; const used = D().variableExpenses.filter(v => v.category === c.name).length; if (await ask('Excluir categoria?', used ? `${used} gasto(s) usam "${esc(c.name)}". Eles continuam salvos com esse nome.` : `"${esc(c.name)}" será removida.`, 'Excluir', true)) { D().categories.splice(+el.dataset.cdel, 1); commit(['categories']); draw(sh); } });
    sh.querySelector('[data-cadd]').onsubmit = e => { e.preventDefault(); const v = sh.querySelector('[data-cnew]').value.trim(); if (!v) return; if (D().categories.some(c => c.name.toLowerCase() === v.toLowerCase())) return toast('Essa categoria já existe.', true); D().categories.push({ name: v, color: ['#f59e0b','#3b82f6','#ec4899','#10b981','#6366f1','#ef4444','#14b8a6','#a855f7'][D().categories.length % 8] }); commit(['categories']); draw(sh); };
  };
  openSheet({ title: 'Categorias', body: '', foot: `<span class="grow"></span><button class="btn primary" data-close-ok>Pronto</button>`, onMount: (sh, close) => { draw(sh); sh.querySelector('[data-close-ok]').onclick = close; } });
}

// ---------- backup ----------
function exportData() {
  const blob = new Blob([JSON.stringify(D(), null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `financas-backup-${todayStr()}.json`;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  toast('Backup exportado');
}
function importFile(file) {
  const rd = new FileReader();
  rd.onload = async () => {
    let json; try { json = JSON.parse(rd.result); } catch { return toast('Arquivo inválido: não é um JSON.', true); }
    if (!json || typeof json !== 'object' || !KEYS.some(k => k in json)) return toast('Esse arquivo não parece ser um backup das finanças.', true);
    const n = ['fixedCosts','variableExpenses','cardExpenses','earnings','investments','debts'].reduce((s, k) => s + (Array.isArray(json[k]) ? json[k].length : 0), 0);
    if (await ask('Importar backup?', `Encontramos ${n} lançamentos. <b>Os dados atuais serão substituídos</b> pelos do arquivo.`, 'Importar')) { replaceAll(json); toast('Backup importado com sucesso!'); go('inicio'); }
  };
  rd.readAsText(file);
}
function demoData() {
  const y = S.y, m = S.m, ds = (dm, d) => { const t = new Date(y, m + dm, d); return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`; };
  const d = defaultData();
  d.fixedIncome = [{ id: 'fi1', description: 'Salário', amount: 6200 }, { id: 'fi2', description: 'Aluguel recebido', amount: 900 }];
  d.earnings = [{ id: 'e1', description: 'Comissão de vendas', amount: 1850, date: ds(0, 8) }, { id: 'e2', description: 'Freela', amount: 600, date: ds(-1, 12) }, { id: 'e3', description: 'Comissão', amount: 1400, date: ds(-2, 9) }];
  const st = new Date(y, m - 5, 1), startM = monthStr(st.getMonth(), st.getFullYear());
  d.fixedCosts = [
    { id: 'f1', name: 'Aluguel', amount: 1800, dueDay: 5, color: '#6366f1', startDate: startM },
    { id: 'f2', name: 'Internet', amount: 120, dueDay: 12, color: '#0ea5e9', startDate: startM },
    { id: 'f3', name: 'Energia', amount: 245, dueDay: 18, color: '#f59e0b', startDate: startM },
    { id: 'f4', name: 'Academia', amount: 99, dueDay: 25, color: '#10b981', startDate: startM }];
  d.cards = [{ id: 'c1', name: 'Nubank', limit: 5000, closingDay: 20, dueDay: 27, color: '#8b5cf6' }, { id: 'c2', name: 'Inter', limit: 3000, closingDay: 10, dueDay: 17, color: '#f97316' }];
  d.variableExpenses = [
    { id: 'v1', description: 'Mercado', category: 'Alimentação', amount: 486.3, date: ds(0, 3) }, { id: 'v2', description: 'Combustível', category: 'Transporte', amount: 220, date: ds(0, 6) },
    { id: 'v3', description: 'Cinema', category: 'Lazer', amount: 84, date: ds(0, 10) }, { id: 'v4', description: 'Farmácia', category: 'Saúde', amount: 63.9, date: ds(0, 14) },
    { id: 'v5', description: 'Padaria', category: 'Alimentação', amount: 92.5, date: ds(0, 16) }];
  for (let i = 1; i <= 5; i++) d.variableExpenses.push({ id: 'vp' + i, description: 'Mercado', category: 'Alimentação', amount: 500 + i * 37, date: ds(-i, 5) });
  d.goals = [
    { id: 'g1', emoji: '🛟', name: 'Reserva de emergência', target: 15000, initial: 4000, deadline: monthStr((m + 17) % 12, y + Math.floor((m + 17) / 12)), monthly: 0, color: '#10b981', createdAt: monthStr((m + 9) % 12, y - 1) },
    { id: 'g2', emoji: '🚗', name: 'Carro seminovo', target: 55000, initial: 9000, deadline: `${y + 3}-12`, monthly: 0, color: '#3b82f6', createdAt: monthStr((m + 9) % 12, y - 1) },
    { id: 'g3', emoji: '✈️', name: 'Viagem para o Nordeste', target: 6000, initial: 0, deadline: '', monthly: 400, color: '#0ea5e9', createdAt: monthStr(m, y) }];
  d.investments = [{ id: 'i1', name: 'Tesouro Selic', category: 'Tesouro', rate: '100% Selic', amount: 500, date: ds(0, 10), goalId: 'g1' }, { id: 'i4', name: 'Meta: Reserva de emergência', category: 'Poupança', rate: '', amount: 600, date: ds(-1, 10), goalId: 'g1' }, { id: 'i5', name: 'Meta: Carro seminovo', category: 'CDB', rate: '', amount: 700, date: ds(-1, 12), goalId: 'g2' }, { id: 'i2', name: 'CDB Banco X', category: 'CDB', rate: '110% CDI', amount: 1200, date: ds(-2, 10), goalId: 'g2' }, { id: 'i3', name: 'FII HGLG11', category: 'FIIs', rate: '', amount: 800, date: ds(-4, 15) }];
  d.debts = [{ id: 'd1', name: 'Empréstimo pessoal', totalAmount: 6000, installments: 12, date: ds(-3, 15) }];
  d.debtsReceivable = [{ id: 'r1', name: 'Empréstimo p/ João', totalAmount: 900, installments: 3, date: ds(-1, 20) }];
  d.negatives = [{ id: 'n1', description: 'Loja de Móveis', amount: 780, contractDate: `${y - 1}-03-10` }];
  d.priorities = [{ id: 'p1', description: 'Geladeira nova', amount: 3500, level: 'Alta' }, { id: 'p2', description: 'Viagem de férias', amount: 4200, level: 'Média' }, { id: 'p3', description: 'Notebook', amount: 3800, level: 'Baixa' }];
  d.settings.isDemo = true;
  S.data = normalize(d);
  [['Tênis de corrida', 'c1', 450, 3, ds(-1, 22)], ['Passagem aérea', 'c1', 1260, 6, ds(-2, 2)], ['Supermercado', 'c2', 380, 1, ds(0, 2)], ['Restaurante', 'c1', 156, 1, ds(0, 5)]].forEach(([desc, cardId, amount, inst, date]) => saveCardPurchase({ cardId, description: desc, amount, installments: inst, date }, true));
  for (let i = 1; i <= 5; i++) { const t = new Date(y, m - i, 1); ['f1', 'f2', 'f3', 'f4'].forEach(id => setPaid('fixed', id, true, t.getMonth(), t.getFullYear(), t.getMonth(), t.getFullYear())); setPaid('variable', 'vp' + i, true, t.getMonth(), t.getFullYear(), t.getMonth(), t.getFullYear()); }
  ['f1', 'f2'].forEach(id => setPaid('fixed', id, true));
  ['v1', 'v2', 'v3'].forEach(id => setPaid('variable', id, true));
  for (let i = 1; i <= 3; i++) { const t = new Date(y, m - i, 1); setPaid('debt_installment', 'd1', true, t.getMonth(), t.getFullYear(), t.getMonth(), t.getFullYear()); }
  commit(KEYS);
  toast('Dados de exemplo carregados.', false, { label: 'Remover', fn: clearDemo });
}

async function clearDemo() {
  if (await ask('Remover dados de exemplo?', 'O app volta a ficar vazio, do jeito que estava antes.' + (hasAnyData() ? ' Se você lançou algo enquanto testava, isso também será apagado.' : ''), 'Remover exemplo', true)) {
    replaceAll(defaultData()); toast('Pronto, o app está vazio de novo.');
  }
}

function firstName() {
  const u = S.user; if (!u) return '';
  const n = (u.displayName || '').trim().split(/\s+/)[0] || (u.email || '').split('@')[0].split(/[._-]/)[0];
  return n ? n.charAt(0).toUpperCase() + n.slice(1) : '';
}
function greeting() { const h = new Date().getHours(); return h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }

// ---------- renderização ----------
function navHTML() {
  return navList().map(n => n.sep ? `<div class="nav-sep">${n.sep}</div>` : `<a href="#${n.v}" class="${S.view === n.v ? 'active' : ''}">${ic(n.i)}<span>${n.t}</span></a>`).join('');
}
function userChip() {
  if (S.mode === 'cloud' && S.user) { const u = S.user; return `<div class="user-chip"><span class="avatar">${u.photoURL ? `<img src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">` : esc((u.displayName || u.email || '?')[0].toUpperCase())}</span><div class="who"><b>${esc(u.displayName || 'Minha conta')}</b><span>${esc(u.email || '')}</span></div></div>`; }
  return `<div class="user-chip"><span class="avatar">${ic('phone')}</span><div class="who"><b>Modo local</b><span>Dados neste aparelho</span></div></div>`;
}
function renderApp() {
  const root = $('#app');
  root.innerHTML = `<div class="shell">
    <aside class="sidebar"><div class="brand">${LOGO}<div><div class="brand-name">Minhas Finanças</div><div class="brand-sub">Controle financeiro</div></div></div><nav class="nav" id="nav"></nav><div class="side-foot">${userChip()}</div></aside>
    <div class="main"><header class="topbar" id="topbar"></header><main class="content" id="content"></main></div>
    <nav class="bottom-nav" id="bnav"></nav></div>`;
  render();
}
function render() {
  if (!S.ready || !$('#content')) return;
  fixView();
  const scrollY = window.scrollY, active = document.activeElement, qKey = active && active.dataset ? active.dataset.q : null, caret = qKey ? active.selectionStart : 0;
  $('#nav').innerHTML = navHTML();
  const monthly = !MONTHLESS.includes(S.view);
  const sm = isSimple();
  $('#topbar').innerHTML = `<h1>${(S.view === 'inicio' || S.view === 'simples') && firstName() ? `${greeting()}, ${esc(firstName())} 👋` : esc(TITLES[S.view])}</h1><span class="spacer"></span>
    <div class="seg mode-seg" role="group" aria-label="Modo de visualização"><button data-act="mode" data-v="simple" class="${sm ? 'on' : ''}" title="Só entradas e saídas, dia a dia">Simples</button><button data-act="mode" data-v="full" class="${sm ? '' : 'on'}" title="Contas, cartões, investimentos e mais">Completo</button></div>
    ${monthly ? `${S.m !== new Date().getMonth() || S.y !== new Date().getFullYear() ? `<button class="today-btn" data-act="today" title="Voltar para ${MONTHS[new Date().getMonth()]}">${ic('undo')}<span>Mês atual</span></button>` : ''}<div class="month-picker"><button data-act="prev" aria-label="Mês anterior">${ic('chevL')}</button><button class="label" data-act="pickmonth" title="Escolher mês e ano">${MONTHS[S.m]} ${S.y}</button><button data-act="next" aria-label="Próximo mês">${ic('chevR')}</button></div>` : ''}
    <span class="sync ${S.sync}" title="Status da sincronização"><span class="dot"></span><span class="lbl">${syncLabel()}</span></span>
    <button class="btn primary fab-desktop" data-act="quick">${ic('plus')} Lançar</button>`;
  $('#content').innerHTML = VIEW_FN[S.view]();
  if (sm) {
    $('#bnav').style.gridTemplateColumns = 'repeat(3, 1fr)';
    $('#bnav').innerHTML = `<a href="#simples" class="${S.view === 'simples' ? 'active' : ''}">${ic('home')}<span>Meu caixa</span></a><button data-act="quick" aria-label="Novo lançamento"><span class="fab">${ic('plus')}</span></button><a href="#ajustes" class="${S.view === 'ajustes' ? 'active' : ''}">${ic('sliders')}<span>Ajustes</span></a>`;
  } else {
  $('#bnav').style.gridTemplateColumns = '';
  const tabs = [['inicio', 'home', 'Início'], ['contas', 'receipt', 'Contas'], null, ['cartoes', 'card', 'Cartões']];
  $('#bnav').innerHTML = tabs.map(t => t ? `<a href="#${t[0]}" class="${S.view === t[0] ? 'active' : ''}">${ic(t[1])}<span>${t[2]}</span></a>` : `<button data-act="quick" aria-label="Novo lançamento"><span class="fab">${ic('plus')}</span></button>`).join('') + `<button data-act="menu" class="${['inicio', 'contas', 'cartoes'].includes(S.view) ? '' : 'active'}" style="${['inicio', 'contas', 'cartoes'].includes(S.view) ? '' : 'color:var(--primary)'}">${ic('grid')}<span>Mais</span></button>`;
  }
  if (S.view === 'assistente' && active && active.matches && active.matches('.chat-input [data-chatq]')) { const el = $('.chat-input [data-chatq]'); if (el && !el.disabled) el.focus(); }
  if (qKey) { const el = document.querySelector(`[data-q="${qKey}"]`); if (el) { el.focus(); try { el.setSelectionRange(caret, caret); } catch {} } }
  window.scrollTo(0, scrollY);
}
function pickMonth() {
  let y = S.y;
  const t = new Date();
  const draw = sh => {
    sh.querySelector('.sheet-body').innerHTML = `<div class="year-row"><button class="icon-btn" data-py="-1" aria-label="Ano anterior">${ic('chevL')}</button><b class="num">${y}</b><button class="icon-btn" data-py="1" aria-label="Próximo ano">${ic('chevR')}</button></div>
      <div class="month-grid">${MONTHS.map((n, i) => `<button data-pm="${i}" class="${i === S.m && y === S.y ? 'on' : ''}${i === t.getMonth() && y === t.getFullYear() ? ' now' : ''}">${n}</button>`).join('')}</div>`;
    sh.querySelectorAll('[data-py]').forEach(b => b.onclick = () => { y += +b.dataset.py; draw(sh); });
    sh.querySelectorAll('[data-pm]').forEach(b => b.onclick = () => { S.m = +b.dataset.pm; S.y = y; closeSheet(); render(); });
  };
  openSheet({ title: 'Escolher mês', body: '', foot: `<button class="btn" data-now>${ic('calendar')} Ir para o mês atual</button><span class="grow"></span>`,
    onMount: (sh, close) => { draw(sh); sh.querySelector('[data-now]').onclick = () => { S.m = t.getMonth(); S.y = t.getFullYear(); close(); render(); }; } }).el.style.width = 'min(420px, calc(100vw - 32px))';
}
function openMenu() {
  openSheet({ title: 'Menu', body: `<div class="menu-grid">${navList().filter(n => n.v).map(n => `<a href="#${n.v}" class="${S.view === n.v ? 'active' : ''}" data-menu-link><span class="ico-c tone-primary">${ic(n.i)}</span>${n.t}</a>`).join('')}</div>${S.mode === 'cloud' ? `<button class="btn danger block" style="margin:10px 0 6px" data-act="logout">${ic('logout')} Sair da conta</button>` : ''}`, onMount: (sh, close) => sh.querySelectorAll('[data-menu-link]').forEach(a => a.addEventListener('click', close)) });
}
function go(v) { if (location.hash !== '#' + v) location.hash = v; else route(); }
function route() {
  const v = (location.hash || '').replace('#', '');
  S.view = VIEWS.includes(v) ? v : (S.ready && isSimple() ? 'simples' : 'inicio');
  if (S.ready) { render(); window.scrollTo(0, 0); }
}
window.addEventListener('hashchange', route);

// ---------- eventos ----------
document.addEventListener('click', async e => {
  const t = e.target.closest('[data-aiact],[data-aisug],[data-act],[data-sedit],[data-detail],[data-edit],[data-goto],[data-seg],[data-cexp],[data-openpay],[data-famt],[data-qamt],[data-theme-set]');
  if (!t || !S.ready) return;
  if (t.matches('input')) return;
  if (t.dataset.aisug) return aiSend(t.dataset.aisug);
  if (t.dataset.aiact) {
    const [what, mi, ai] = t.dataset.aiact.split('|'), m = chatLog()[+mi]; if (!m) return;
    if (what === 'all') return aiConfirm((m.actions || []).filter(a => a.state === 'pending'));
    const a = (m.actions || [])[+ai]; if (!a || a.state !== 'pending') return;
    if (what === 'ok') return aiConfirm([a]);
    if (what === 'edit') return aiEdit(a);
    if (what === 'no') { a.state = 'discarded'; return render(); }
    return;
  }
  if (t.dataset.qamt) { const [k, id, mm, yy] = t.dataset.qamt.split('|'); if (t.closest('[data-dsheet]')) closeSheet(); return mm != null && mm !== '' ? quickAmount(k, id, +mm, +yy) : quickAmount(k, id); }
  if (t.dataset.sedit) { const [k, id] = t.dataset.sedit.split('|'); return simpleForm(k === 'earnings' ? 'in' : 'out', id); }
  if (t.dataset.detail) return details(t.dataset.detail);
  if (t.dataset.edit) return editItem(t.dataset.edit, t.dataset.id);
  if (t.dataset.goto) return go(t.dataset.goto);
  if (t.dataset.cexp) return editCardExpense(t.dataset.cexp);
  if (t.dataset.themeSet) { lsSet('financas.theme', t.dataset.themeSet); applyTheme(); return render(); }
  if (t.dataset.seg) { const k = t.dataset.seg; S.ui[k] = k === 'investAll' ? t.dataset.v === '1' : t.dataset.v; return render(); }
  if (t.dataset.famt) return editFixedMonth(t.dataset.famt, +t.dataset.tm, +t.dataset.ty);
  if (t.dataset.openpay) {
    const type = t.dataset.openpay, id = t.dataset.id;
    if (type === 'fixed') return editItem('fixedCosts', id);
    if (type === 'variable') return editItem('variableExpenses', id);
    if (type === 'debt_installment') return editItem('debts', id);
    if (type === 'card_invoice') return go('cartoes');
    return;
  }
  switch (t.dataset.act) {
    case 'prev': S.m--; if (S.m < 0) { S.m = 11; S.y--; } return render();
    case 'next': S.m++; if (S.m > 11) { S.m = 0; S.y++; } return render();
    case 'today': S.m = new Date().getMonth(); S.y = new Date().getFullYear(); return render();
    case 'pickmonth': return pickMonth();
    case 'quick': return isSimple() ? simpleForm(S.ui.simpleDir || 'in') : quickAdd();
    case 'sadd': return simpleForm(t.dataset.dir);
    case 'mode': return setMode(t.dataset.v === 'simple');
    case 'menu': return openMenu();
    case 'new': return editItem(t.dataset.key);
    case 'aiclear': S.ui.chat = []; return render();
    case 'aion': D().settings.aiOff = false; commit(['settings']); return;
    case 'goalnew': return editGoal(null, t.dataset.preset ? GOAL_PRESETS[+t.dataset.preset] : {});
    case 'goaledit': return editGoal(t.dataset.id);
    case 'goalsave': return saveToGoal(t.dataset.id);
    case 'goalhist': return goalHistory(t.dataset.id);
    case 'pri2goal': { const p = D().priorities.find(x => String(x.id) === String(t.dataset.id)); closeSheet(); return editGoal(null, p ? { name: p.description, target: p.amount, fromPriority: p.id } : {}); }
    case 'cardbuy': return addCardPurchase();
    case 'cats': return manageCategories();
    case 'export': return exportData();
    case 'demo': return demoData();
    case 'cleardemo': return clearDemo();
    case 'install': if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; } return;
    case 'logout': if (await ask('Sair da conta?', 'Seus dados continuam salvos na nuvem. É só entrar de novo para ver tudo.', 'Sair')) { sheetStack.slice().forEach(closeSheet); await Cloud.flush(); Cloud.stop(); S.ready = false; S.data = defaultData(); await Cloud.m.signOut(Cloud.auth); } return;
    case 'wipe': if (await ask('Apagar todos os dados?', 'Tudo será removido desta conta e de todos os aparelhos. <b>Não dá para desfazer.</b>', 'Apagar tudo', true)) { replaceAll(defaultData()); toast('Dados apagados'); } return;
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (!S.ready) return;
  if (t.dataset.pay) {
    const type = t.dataset.pay, tm = +t.dataset.tm, ty = +t.dataset.ty;
    setPaid(type, t.dataset.id, t.checked, tm, ty, S.m, S.y);
    commit(['payments']);
    if (t.checked) toast(type === 'receivable_installment' ? 'Marcado como recebido' : 'Marcado como pago', false, { label: 'Desfazer', fn: () => { setPaid(type, t.dataset.id, false, tm, ty); commit(['payments']); } });
    return;
  }
  if (t.dataset.negpay) {
    const n = D().negatives.find(x => String(x.id) === String(t.dataset.negpay)); if (!n) return;
    if (t.checked) { t.checked = false; quitNegative(n.id); }
    else { t.checked = true; ask('Desmarcar quitação?', `"${esc(n.description)}" volta para as contas em aberto.`, 'Desmarcar').then(ok => { if (ok) { n.paid = false; n.paidAmount = null; n.paidDate = ''; commit(['negatives']); } }); }
    return;
  }
  if (t.dataset.carry) {
    const k = t.dataset.carry, cfg = carryCfg();
    if (k === 'enabled') cfg.enabled = t.checked;
    else if (k === 'startMonth') cfg.startMonth = t.value || '';
    else { const raw = String(t.value).trim(), neg = raw.startsWith('-'), v = parseMoney(raw.replace('-', '')); cfg.initial = Number.isFinite(v) ? (neg ? -v : v) : 0; }
    D().settings.carry = cfg; commit(['settings']); return;
  }
  if (t.dataset.aitoggle !== undefined) { D().settings.aiOff = !t.checked; commit(['settings']); toast(t.checked ? 'Assistente ligado' : 'Assistente desligado'); return; }
  if (t.dataset.pctcards !== undefined) { D().settings.percentCards = t.checked; commit(['settings']); toast(t.checked ? 'Cartão incluído no % comprometido' : 'Cartão removido do % comprometido'); return; }
  if (t.dataset.vis) { D().settings.visibleCards[t.dataset.vis] = t.checked; commit(['settings']); return; }
  if (t.dataset.import !== undefined && t.files && t.files[0]) { importFile(t.files[0]); t.value = ''; }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.chatq !== undefined) { S.ui.chatDraft = t.value; return; }
  if (t.dataset.q) { S.ui[t.dataset.q] = t.value; render(); }
});
document.addEventListener('submit', e => {
  const f = e.target;
  if (f.matches('[data-chatform]')) { e.preventDefault(); const i = f.querySelector('[data-chatq]'); const v = i ? i.value : ''; if (i) i.value = ''; aiSend(v); return; }
  if (!f.matches('[data-quickform]')) return;
  e.preventDefault();
  const fields = [{ k: 'description', type: 'text', req: 1 }, { k: 'amount', type: 'money', req: 1 }, { k: 'date', type: 'date', req: 1 }, { k: 'category', type: 'select', req: 1 }, { k: '_paid', type: 'toggle' }];
  const v = readFields(f, fields); if (!v) return;
  const paid = v._paid; delete v._paid;
  const item = Object.assign({ id: uid('var') }, v); D().variableExpenses.push(item);
  if (paid) { const [yy, mm] = parts(item.date); setPaid('variable', item.id, true, mm - 1, yy, mm - 1, yy); }
  commit(['variableExpenses', 'payments']); toast('Gasto lançado');
});

// ---------- tema ----------
function applyTheme() {
  const pref = lsGet('financas.theme') || 'auto';
  const dark = pref === 'dark' || (pref === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = dark ? '#0a0f1d' : '#4f46e5';
}
if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { applyTheme(); });

// ---------- login ----------
function renderSplash(title = 'Carregando…', sub = '') {
  $('#app').innerHTML = `<div class="splash"><div>${sub ? `<div class="ei" style="margin:0 auto 14px;width:52px;height:52px;border-radius:16px;background:var(--surface-2);display:grid;place-items:center">${ic('cloud')}</div>` : '<div class="spinner"></div>'}<div style="font-weight:650;color:var(--text)">${esc(title)}</div>${sub ? `<div style="max-width:340px;margin-top:6px;font-size:14px">${esc(sub)}</div><button class="btn" style="margin-top:16px" onclick="location.reload()">${ic('sync')} Tentar de novo</button>` : ''}</div></div>`;
}
let loginMode = 'login';
function renderLogin() {
  const m = loginMode;
  $('#app').innerHTML = `<div class="login">
    <div class="login-art"><div class="brand" style="padding:0">${LOGO}<div class="brand-name" style="color:#fff">Minhas Finanças</div></div>
      <div><h1>Suas finanças organizadas, em qualquer aparelho.</h1><p>Contas, cartões, investimentos e dívidas em um só lugar, sincronizados entre computador e celular.</p>
      <div class="login-feats"><div>${ic('sync')} Sincroniza automaticamente</div><div>${ic('shield')} Cada pessoa vê só os próprios dados</div><div>${ic('phone')} Instale no celular como um app</div></div></div>
      <div style="font-size:13px;opacity:.7;position:relative;z-index:1">Gratuito · feito com carinho</div></div>
    <div class="login-box"><div class="login-card">
      <h2>${m === 'signup' ? 'Criar conta' : m === 'reset' ? 'Recuperar senha' : 'Entrar'}</h2>
      <p class="lead">${m === 'signup' ? 'Leva menos de um minuto.' : m === 'reset' ? 'Enviaremos um link para o seu e-mail.' : 'Acesse com sua conta para ver seus dados.'}</p>
      ${m !== 'reset' ? `<button class="gbtn" id="gbtn">${GOOGLE} Continuar com Google</button><div class="divider">ou com e-mail</div>` : ''}
      <form class="fields" id="lform" novalidate>
        ${m === 'signup' ? `<div class="field"><label for="ln">Seu nome</label><input id="ln" autocomplete="name"></div>` : ''}
        <div class="field"><label for="le">E-mail</label><input id="le" type="email" autocomplete="email" inputmode="email"></div>
        ${m !== 'reset' ? `<div class="field"><label for="lp">Senha</label><input id="lp" type="password" autocomplete="${m === 'signup' ? 'new-password' : 'current-password'}" placeholder="${m === 'signup' ? 'Mínimo 6 caracteres' : ''}"></div>` : ''}
        <div class="field"><button class="btn primary block" type="submit" id="lsub" style="padding:12px">${m === 'signup' ? 'Criar conta' : m === 'reset' ? 'Enviar link' : 'Entrar'}</button></div>
      </form>
      <div class="form-err" id="lerr"></div>
      <div class="login-links">${m === 'login' ? `<button data-lm="signup">Criar conta</button><button data-lm="reset">Esqueci a senha</button>` : `<button data-lm="login">← Voltar para entrar</button>`}</div>
    </div></div></div>`;
  $$('[data-lm]').forEach(b => b.onclick = () => { loginMode = b.dataset.lm; renderLogin(); });
  const g = $('#gbtn');
  if (g) g.onclick = async () => {
    const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = Cloud.m;
    const prov = new GoogleAuthProvider(); prov.setCustomParameters({ prompt: 'select_account' });
    try { await signInWithPopup(Cloud.auth, prov); }
    catch (err) { if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/cancelled-popup-request'].includes(err.code)) { try { await signInWithRedirect(Cloud.auth, prov); } catch (e2) { loginError(e2); } } else loginError(err); }
  };
  $('#lform').onsubmit = async e => {
    e.preventDefault();
    const email = $('#le').value.trim(), pass = $('#lp') ? $('#lp').value : '', btn = $('#lsub');
    $('#lerr').textContent = '';
    if (!email) return loginError({ code: 'auth/missing-email' });
    btn.disabled = true;
    try {
      if (m === 'reset') { await Cloud.m.sendPasswordResetEmail(Cloud.auth, email); $('#lerr').style.color = 'var(--green)'; $('#lerr').textContent = 'Pronto! Confira seu e-mail (veja também a caixa de spam).'; }
      else if (m === 'signup') { const cr = await Cloud.m.createUserWithEmailAndPassword(Cloud.auth, email, pass); const name = $('#ln').value.trim(); if (name) { await Cloud.m.updateProfile(cr.user, { displayName: name }); S.user = Cloud.auth.currentUser; } }
      else await Cloud.m.signInWithEmailAndPassword(Cloud.auth, email, pass);
    } catch (err) { loginError(err); }
    btn.disabled = false;
  };
}
function loginError(err) {
  const map = {
    'auth/invalid-email': 'E-mail inválido.', 'auth/missing-email': 'Digite seu e-mail.', 'auth/missing-password': 'Digite sua senha.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.', 'auth/wrong-password': 'E-mail ou senha incorretos.', 'auth/user-not-found': 'Não existe conta com esse e-mail.',
    'auth/email-already-in-use': 'Já existe uma conta com esse e-mail. Tente entrar.', 'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas. Espere alguns minutos e tente de novo.', 'auth/network-request-failed': 'Sem conexão com a internet.',
    'auth/popup-closed-by-user': 'A janela do Google foi fechada antes de terminar.', 'auth/unauthorized-domain': 'Este endereço ainda não foi autorizado no Firebase (Authentication → Configurações → Domínios autorizados).',
    'auth/operation-not-allowed': 'Esse tipo de login não está ativado no Firebase (Authentication → Método de login).'
  };
  const el = $('#lerr'); const msg = map[err && err.code] || ('Não foi possível entrar: ' + ((err && (err.code || err.message)) || 'erro desconhecido'));
  if (el) { el.style.color = ''; el.textContent = msg; } else toast(msg, true);
}
function onAuth(user) {
  sheetStack.slice().forEach(closeSheet);
  if (!user) { S.user = null; S.ready = false; Cloud.stop(); renderLogin(); return; }
  S.user = user; S.ready = false; S.data = defaultData(); S.ver++;
  renderSplash('Carregando seus dados…');
  Cloud.start(user.uid);
}
async function offerLocalUpload() {
  const local = Local.load();
  if (!local) return;
  const n = normalize(local);
  const count = ['fixedIncome','earnings','fixedCosts','variableExpenses','cards','cardExpenses','investments','debts'].reduce((s, k) => s + n[k].length, 0);
  if (!count) return;
  if (await ask('Enviar dados deste aparelho?', `Encontramos ${count} lançamentos salvos neste navegador (do modo local). Quer enviá-los para a sua conta?`, 'Enviar para a conta')) { replaceAll(n); lsDel(LOCAL_KEY); toast('Dados enviados para a nuvem'); }
}

// ---------- PWA ----------
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; if (S.view === 'ajustes') render(); });
function registerSW() {
  try {
    if (!('serviceWorker' in navigator) || location.protocol !== 'https:' || window.self !== window.top) return;
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
      // procura versão nova ao abrir e sempre que o app volta para a tela
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    }).catch(() => {});
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloading) return;
      reloading = true;
      const doReload = async () => { if (S.mode === 'cloud') await Promise.race([Cloud.flush(), new Promise(r => setTimeout(r, 1500))]); location.reload(); };
      if (sheetStack.length) toast('Nova versão do app disponível.', false, { label: 'Atualizar', fn: doReload });
      else doReload();
    });
  } catch {}
}

// ---------- início ----------
async function boot() {
  applyTheme();
  route();
  const cfg = window.FIREBASE_CONFIG;
  if (cfg && cfg.apiKey) {
    S.mode = 'cloud'; S.sync = 'saving';
    renderSplash('Conectando…');
    try { await Cloud.init(cfg); }
    catch (e) { console.error(e); renderSplash('Não foi possível conectar', 'Verifique sua internet. Se o problema continuar, confira a configuração do Firebase.'); }
  } else {
    S.mode = 'local'; S.sync = 'local';
    const saved = Local.load();
    S.data = normalize(saved || defaultData());
    S.ready = true;
    renderApp();
  }
  registerSW();
}
window.__app = { S, calc, normalize };
boot();
})();
