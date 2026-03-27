// ══════════════════════════════════════════════════
//  NAD Argentina · App de Ventas
//  Firebase Firestore + Vanilla JS
// ══════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, updateDoc, getDocs,
  query, orderBy, limit, onSnapshot, serverTimestamp, increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── 🔧 CONFIGURACIÓN FIREBASE ──────────────────────
// Reemplazá estos valores con los de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCV5inB3DHmRQBjM_N-Yz63I5pQvhyw_tY",
  authDomain: "nadventas.firebaseapp.com",
  projectId: "nadventas",
  storageBucket: "nadventas.firebasestorage.app",
  messagingSenderId: "811236588100",
  appId: "1:811236588100:web:1d72caecb198ae33fd1a11"
};
// ───────────────────────────────────────────────────

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ══════════════════════════════════════════════════
//  CATÁLOGO DE PRODUCTOS
// ══════════════════════════════════════════════════
const PRODUCTOS = [
  {nombre:'Ácido Alfa Lipoico 600mg',cat:'Suplementos',precio:53780,promo:51100,peso:0.03},
  {nombre:'VELLE NMN® Premium | NAD+ & Colágeno',cat:'Longevidad',precio:154000,promo:0,peso:0.30},
  {nombre:'Omega 3 Premium | EPA y DHA',cat:'Suplementos',precio:43500,promo:41340,peso:0.05},
  {nombre:'Sinefrina Natural | Quemador de Grasa',cat:'Suplementos',precio:35289,promo:0,peso:0.03},
  {nombre:'Complejo de Vitamina B',cat:'Suplementos',precio:30000,promo:28000,peso:0.03},
  {nombre:'Ormux | Regenerador Celular',cat:'Suplementos',precio:63415,promo:60245,peso:0.03},
  {nombre:'N-Acetilcisteína (NAC)',cat:'Suplementos',precio:48500,promo:45970,peso:0.03},
  {nombre:'Vitamina D3 + K2',cat:'Suplementos',precio:38000,promo:36050,peso:0.03},
  {nombre:'Vitamina C | Antioxidante',cat:'Suplementos',precio:30000,promo:27500,peso:0.03},
  {nombre:'Creatina 100% Pura 100g',cat:'Deportivo',precio:27000,promo:23950,peso:0.05},
  {nombre:'Ashwagandha | Estrés y Sueño',cat:'Suplementos',precio:47000,promo:43300,peso:0.03},
  {nombre:'Hongos Adaptógenos (León, Shiitake, Cordyceps, Reishi)',cat:'Suplementos',precio:39000,promo:37260,peso:0.03},
  {nombre:'Cándida Stop',cat:'Suplementos',precio:46000,promo:43040,peso:0.03},
  {nombre:'Organic Detox | Metales Pesados',cat:'Suplementos',precio:36800,promo:34960,peso:0.03},
  {nombre:'Testosterone | Pre-Hormonal',cat:'Hormonal',precio:44500,promo:42100,peso:0.03},
  {nombre:'MSM (Metilsulfonilmetano)',cat:'Suplementos',precio:44500,promo:42100,peso:0.03},
  {nombre:'Citrato de Potasio',cat:'Suplementos',precio:30500,promo:28915,peso:0.03},
  {nombre:'Tiroidal | Función Tiroidea',cat:'Suplementos',precio:44500,promo:42100,peso:0.03},
  {nombre:'Lady Balance | Menopausia',cat:'Hormonal',precio:38000,promo:36050,peso:0.03},
  {nombre:'Adreno Cortisol | Control del Estrés',cat:'Suplementos',precio:55000,promo:50680,peso:0.03},
  {nombre:'Diabetic Control | Glucémico',cat:'Suplementos',precio:38000,promo:36050,peso:0.03},
  {nombre:'Ultra Reparador Capilar',cat:'Suplementos',precio:50700,promo:48150,peso:0.03},
  {nombre:'ELIXIR | Regenerador Bio Metabólico',cat:'Suplementos',precio:32000,promo:29750,peso:0.03},
  {nombre:'NAD+ Niacinamida Rejuvenecedor',cat:'Longevidad',precio:88700,promo:84270,peso:0.03},
  {nombre:'NMN 500mg | Senolítico Rejuvenecedor',cat:'Longevidad',precio:88700,promo:0,peso:0.03},
  {nombre:'Resveratrol PREMIUM | Antioxidante',cat:'Longevidad',precio:75000,promo:71250,peso:0.03},
  {nombre:'AKG (Alfa-Cetoglutarato)',cat:'Longevidad',precio:89135,promo:0,peso:0.05},
  {nombre:'Astaxantina 12mg | Antioxidante',cat:'Longevidad',precio:85500,promo:0,peso:0.03},
  {nombre:'KIT Velle NMN + Resveratrol + Elixir',cat:'Kits',precio:248000,promo:205300,peso:0.40},
  {nombre:'Kit Anti-Edad: NMN + Resveratrol + Astaxantina + AKG',cat:'Kits',precio:373450,promo:257790,peso:0.50},
  {nombre:'ELIXIR KIT x3 unidades',cat:'Kits',precio:93940,promo:75000,peso:0.15},
  {nombre:'KIT Regenerar Integral x3',cat:'Kits',precio:690600,promo:469750,peso:1.20},
  {nombre:'KIT ANUAL ANTI-EDAD 45% OFF',cat:'Kits',precio:2338100,promo:1339100,peso:2.30},
  {nombre:'KIT ANUAL BOOST REJUVENECEDOR 45% OFF',cat:'Kits',precio:2995000,promo:1715000,peso:4.50},
];

// ══════════════════════════════════════════════════
//  ESTADO LOCAL
// ══════════════════════════════════════════════════
let stockData = {};      // { prodIdx: {stock, min} }
let pedidosData = [];    // array de pedidos de Firestore
let cart = [];
let activeCat = 'Todos';
let currentFilter = '';
let stockFiltro = 'todos';
let editingStockIdx = null;
let editingEnvioId = null;
let orderCounter = 1;

// ══════════════════════════════════════════════════
//  UTILIDADES
// ══════════════════════════════════════════════════
const fmt = n => '$' + Math.round(n).toLocaleString('es-AR');
const fecha = d => {
  if (!d) return '—';
  const dt = d.toDate ? d.toDate() : new Date(d);
  return dt.toLocaleDateString('es-AR', {day:'2-digit', month:'2-digit', year:'2-digit'});
};

function badgeEstado(e) {
  const map = { nuevo:'badge-nuevo', preparacion:'badge-prep', enviado:'badge-enviado', cancelado:'badge-cancelado' };
  const labels = { nuevo:'Nuevo', preparacion:'En prep.', enviado:'Enviado', cancelado:'Cancelado' };
  return `<span class="badge ${map[e]||'badge-nuevo'}">${labels[e]||e}</span>`;
}

function showOk(icon, title, msg) {
  document.getElementById('ok-icon').textContent = icon;
  document.getElementById('ok-title').textContent = title;
  document.getElementById('ok-msg').textContent = msg;
  document.getElementById('modal-ok').classList.add('open');
}

function closeModal(id) { document.getElementById(id).classList.remove('open'); }
window.closeModal = closeModal;

// ══════════════════════════════════════════════════
//  NAVEGACIÓN
// ══════════════════════════════════════════════════
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`.nav[data-page="${page}"]`).classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
  if (page === 'nuevo') { resetNuevoPedido(); renderProdList(); }
  if (page === 'stock') renderStockTable();
  if (page === 'pedidos') renderPedidosTable();
  if (page === 'envios') renderEnviosTable();
  if (page === 'correo') renderCorreoTable();
  if (page === 'catalogo') renderCatalogo();
  if (page === 'dashboard') renderDashboard();
}
window.goTo = goTo;

document.querySelectorAll('.nav').forEach(n => {
  n.addEventListener('click', () => goTo(n.dataset.page));
});

document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});
document.getElementById('sidebar-close').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
});

// ══════════════════════════════════════════════════
//  STOCK — Firestore
// ══════════════════════════════════════════════════
async function cargarStock() {
  const snap = await getDocs(collection(db, 'stock'));
  snap.forEach(d => { stockData[d.id] = d.data(); });
  updateDashboard();
  renderProdList();
}

async function guardarStockFS(idx, stock, min) {
  const ref = doc(db, 'stock', String(idx));
  await updateDoc(ref, { stock, min }).catch(async () => {
    const { setDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
    await setDoc(ref, { stock, min });
  });
  stockData[idx] = { stock, min };
  updateDashboard();
  renderStockTable();
  renderProdList();
}

function openStockModal(idx) {
  editingStockIdx = idx;
  const s = stockData[idx] || { stock: 0, min: 3 };
  document.getElementById('modal-stock-nombre').textContent = PRODUCTOS[idx].nombre;
  document.getElementById('ms-stock').value = s.stock;
  document.getElementById('ms-min').value = s.min;
  document.getElementById('modal-stock').classList.add('open');
}
window.openStockModal = openStockModal;

async function guardarStock() {
  if (editingStockIdx === null) return;
  const stock = Math.max(0, parseInt(document.getElementById('ms-stock').value) || 0);
  const min = Math.max(0, parseInt(document.getElementById('ms-min').value) || 3);
  await guardarStockFS(editingStockIdx, stock, min);
  closeModal('modal-stock');
  showOk('✅', '¡Stock actualizado!', `${PRODUCTOS[editingStockIdx].nombre}: ${stock} unidades.`);
}
window.guardarStock = guardarStock;

function getStockInfo(idx) {
  const s = stockData[idx] || { stock: 0, min: 3 };
  if (s.stock === 0) return { chip: '<span class="prod-stock-chip" style="background:#FCEBEB;color:#791F1F">Sin stock</span>', estado: 'sin' };
  if (s.stock <= s.min) return { chip: `<span class="prod-stock-chip" style="background:#FAEEDA;color:#633806">⚠ ${s.stock}u</span>`, estado: 'bajo' };
  return { chip: `<span class="prod-stock-chip" style="background:#EAF3DE;color:#27500A">${s.stock}u</span>`, estado: 'ok' };
}

function renderStockTable() {
  const tbody = document.getElementById('stock-tbody');
  let rows = PRODUCTOS.map((p, i) => ({ p, i, s: stockData[i] || { stock: 0, min: 3 } }));
  if (stockFiltro === 'bajo') rows = rows.filter(r => r.s.stock > 0 && r.s.stock <= r.s.min);
  if (stockFiltro === 'sin') rows = rows.filter(r => r.s.stock === 0);
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="5" class="empty">No hay productos en este filtro.</td></tr>'; return; }
  tbody.innerHTML = rows.map(({ p, i, s }) => {
    const pct = Math.min(100, s.min > 0 ? Math.round(s.stock / Math.max(s.min * 2, 1) * 100) : 0);
    const color = s.stock === 0 ? '#E24B4A' : s.stock <= s.min ? '#EF9F27' : '#639922';
    const badge = s.stock === 0 ? '<span class="badge badge-sin">Sin stock</span>' :
      s.stock <= s.min ? '<span class="badge badge-bajo">⚠ Bajo</span>' :
      '<span class="badge badge-ok">OK</span>';
    return `<tr>
      <td style="max-width:220px">
        <div style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.nombre}</div>
        <div class="stock-bar"><div class="stock-fill" style="width:${pct}%;background:${color}"></div></div>
      </td>
      <td style="text-align:center;font-weight:700">${s.stock}</td>
      <td style="text-align:center;color:#888">${s.min}</td>
      <td>${badge}</td>
      <td><button class="btn btn-s" onclick="openStockModal(${i})">Editar</button></td>
    </tr>`;
  }).join('');
}

function filtrarStock(tipo) {
  stockFiltro = tipo;
  ['todos','bajo','sin'].forEach(t => {
    const el = document.getElementById('sf-' + t);
    el.classList.toggle('active-filter', t === tipo);
  });
  renderStockTable();
}
window.filtrarStock = filtrarStock;

// ══════════════════════════════════════════════════
//  PEDIDOS — Firestore
// ══════════════════════════════════════════════════
function escucharPedidos() {
  const q = query(collection(db, 'pedidos'), orderBy('fecha', 'desc'));
  onSnapshot(q, snap => {
    pedidosData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    updateDashboard();
    const page = document.querySelector('.page.active')?.id;
    if (page === 'page-pedidos') renderPedidosTable();
    if (page === 'page-envios') renderEnviosTable();
    if (page === 'page-correo') renderCorreoTable();
    if (page === 'page-dashboard') renderDashboard();
  });
}

function renderDashboard() {
  document.getElementById('fecha-hoy').textContent = new Date().toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' });
  const recientes = pedidosData.slice(0, 5);
  const tbody = document.getElementById('dash-pedidos');
  if (!recientes.length) { tbody.innerHTML = '<tr><td colspan="4" class="empty">Todavía no hay pedidos.</td></tr>'; return; }
  tbody.innerHTML = recientes.map(p => {
    const prods = (p.items||[]).map(i => `${i.nombre} x${i.qty}`).join(', ');
    return `<tr>
      <td>${p.nro}</td>
      <td>${p.cliente?.nombre || '—'}</td>
      <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${prods || '—'}</td>
      <td>${fmt(p.total||0)}</td>
      <td>${badgeEstado(p.estado||'nuevo')}</td>
    </tr>`;
  }).join('');
}

function updateDashboard() {
  const nuevos = pedidosData.filter(p => p.estado === 'nuevo').length;
  const prep = pedidosData.filter(p => p.estado === 'preparacion').length;
  const env = pedidosData.filter(p => p.estado === 'enviado').length;
  const criticos = PRODUCTOS.filter((_, i) => {
    const s = stockData[i] || { stock: 0, min: 3 };
    return s.stock === 0 || s.stock <= s.min;
  }).length;

  document.getElementById('stat-nuevos').textContent = nuevos;
  document.getElementById('stat-prep').textContent = prep;
  document.getElementById('stat-enviados').textContent = env;
  document.getElementById('stat-stock').textContent = criticos;

  const badge = document.getElementById('badge-stock');
  badge.style.display = criticos > 0 ? 'inline' : 'none';
  badge.textContent = criticos;

  const banner = document.getElementById('alerta-banner');
  if (criticos > 0) {
    banner.innerHTML = `<div class="alert-banner">⚠ Tenés <strong>${criticos} producto(s)</strong> con stock bajo o sin stock. <button class="btn btn-s" style="margin-left:auto" onclick="goTo('stock')">Ver stock</button></div>`;
  } else {
    banner.innerHTML = '';
  }
}

function renderPedidosTable() {
  const filtro = document.getElementById('filtro-estado')?.value || '';
  const rows = filtro ? pedidosData.filter(p => p.estado === filtro) : pedidosData;
  const tbody = document.getElementById('tabla-pedidos');
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty">No hay pedidos.</td></tr>'; return; }
  tbody.innerHTML = rows.map(p => `<tr>
    <td>${p.nro}</td>
    <td>${fecha(p.fecha)}</td>
    <td>${p.cliente?.nombre || '—'}</td>
    <td>${fmt(p.total||0)}</td>
    <td>${badgeEstado(p.estado)}</td>
    <td><button class="btn btn-s" onclick="openEnvioModal('${p.id}')">Editar</button></td>
  </tr>`).join('');
}

function filtrarPedidos() { renderPedidosTable(); }
window.filtrarPedidos = filtrarPedidos;

// ══════════════════════════════════════════════════
//  NUEVO PEDIDO
// ══════════════════════════════════════════════════
function resetNuevoPedido() {
  ['cli-nombre','cli-tel','cli-email','env-calle','env-ciudad','env-cp','env-tel','pedido-notas'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  cart = [];
  currentFilter = '';
  activeCat = 'Todos';
  const si = document.getElementById('prod-search'); if (si) si.value = '';
  renderCart();
}

async function crearOrden() {
  const nombre = document.getElementById('cli-nombre').value.trim();
  if (!nombre) { showOk('⚠️', 'Falta el nombre', 'Completá el nombre del cliente.'); return; }
  if (!cart.length) { showOk('⚠️', 'Sin productos', 'Agregá al menos un producto al pedido.'); return; }

  const total = cart.reduce((acc, c) => {
    const p = PRODUCTOS[c.idx];
    return acc + (p.promo > 0 ? p.promo : p.precio) * c.qty;
  }, 0);

  const items = cart.map(c => {
    const p = PRODUCTOS[c.idx];
    return { idx: c.idx, nombre: p.nombre, qty: c.qty, precio: p.promo > 0 ? p.promo : p.precio, peso: p.peso };
  });

  const nro = '#' + String(orderCounter++).padStart(4, '0');

  const pedido = {
    nro,
    fecha: serverTimestamp(),
    estado: 'nuevo',
    total,
    items,
    cliente: {
      nombre,
      tel: document.getElementById('cli-tel').value.trim(),
      email: document.getElementById('cli-email').value.trim(),
      canal: document.getElementById('cli-canal').value,
    },
    envio: {
      calle: document.getElementById('env-calle').value.trim(),
      ciudad: document.getElementById('env-ciudad').value.trim(),
      provincia: document.getElementById('env-provincia').value,
      cp: document.getElementById('env-cp').value.trim(),
      tel: document.getElementById('env-tel').value.trim(),
      empresa: '',
      tracking: '',
      notas: '',
    },
    notas: document.getElementById('pedido-notas').value.trim(),
  };

  // Descontar stock en Firestore
  for (const c of cart) {
    const s = stockData[c.idx] || { stock: 0, min: 3 };
    if (s.stock > 0) {
      const nuevoStock = Math.max(0, s.stock - c.qty);
      await guardarStockFS(c.idx, nuevoStock, s.min);
    }
  }

  await addDoc(collection(db, 'pedidos'), pedido);

  cart = [];
  renderCart();
  renderProdList();
  goTo('pedidos');
  showOk('🧾', `¡Orden ${nro} creada!`, 'El stock fue descontado automáticamente.');
}
window.crearOrden = crearOrden;

// ══════════════════════════════════════════════════
//  CARRITO
// ══════════════════════════════════════════════════
function addToCart(idx) {
  const s = stockData[idx] || { stock: 0, min: 3 };
  const inCart = cart.find(c => c.idx === idx);
  if (s.stock > 0 && (inCart?.qty || 0) >= s.stock) {
    showOk('⚠️', 'Stock insuficiente', `Solo tenés ${s.stock} unidades disponibles.`); return;
  }
  if (inCart) { inCart.qty++; } else { cart.push({ idx, qty: 1 }); }
  renderProdList(); renderCart();
}
window.addToCart = addToCart;

function removeFromCart(idx) { cart = cart.filter(c => c.idx !== idx); renderProdList(); renderCart(); }
window.removeFromCart = removeFromCart;

function updateQty(idx, val) {
  const item = cart.find(c => c.idx === idx);
  const max = (stockData[idx] || { stock: 999 }).stock || 999;
  if (item) item.qty = Math.min(max, Math.max(1, parseInt(val) || 1));
  renderCart();
}
window.updateQty = updateQty;

function renderCart() {
  const el = document.getElementById('cart-list');
  if (!el) return;
  if (!cart.length) { el.innerHTML = '<div class="empty small-text">Ningún producto agregado aún.</div>'; document.getElementById('total-val').textContent = '$0'; return; }
  let total = 0;
  el.innerHTML = cart.map(c => {
    const p = PRODUCTOS[c.idx];
    const precio = p.promo > 0 ? p.promo : p.precio;
    const sub = precio * c.qty;
    total += sub;
    return `<div class="cart-row">
      <div class="cart-name">${p.nombre}</div>
      <input class="cart-qty" type="number" min="1" value="${c.qty}" onchange="updateQty(${c.idx},this.value)">
      <div class="cart-sub">${fmt(sub)}</div>
      <button class="cart-del" onclick="removeFromCart(${c.idx})">✕</button>
    </div>`;
  }).join('');
  document.getElementById('total-val').textContent = fmt(total);
}

// ══════════════════════════════════════════════════
//  LISTA DE PRODUCTOS
// ══════════════════════════════════════════════════
function getCategories() { return ['Todos', ...new Set(PRODUCTOS.map(p => p.cat))]; }

function renderCatPills() {
  const el = document.getElementById('cat-pills');
  if (!el) return;
  el.innerHTML = getCategories().map(c =>
    `<div class="pill${c === activeCat ? ' active' : ''}" onclick="setCat('${c}')">${c}</div>`
  ).join('');
}

function setCat(cat) { activeCat = cat; renderCatPills(); renderProdList(); }
window.setCat = setCat;

function filterProds() {
  currentFilter = document.getElementById('prod-search')?.value.toLowerCase() || '';
  renderProdList();
}
window.filterProds = filterProds;

function renderProdList() {
  renderCatPills();
  const el = document.getElementById('prod-list');
  if (!el) return;
  const filtered = PRODUCTOS.map((p, i) => ({ p, i })).filter(({ p }) => {
    const matchCat = activeCat === 'Todos' || p.cat === activeCat;
    const matchSearch = p.nombre.toLowerCase().includes(currentFilter);
    return matchCat && matchSearch;
  });
  if (!filtered.length) { el.innerHTML = '<div class="empty">Sin resultados.</div>'; return; }
  el.innerHTML = filtered.map(({ p, i }) => {
    const inCart = cart.find(c => c.idx === i);
    const precio = p.promo > 0 ? p.promo : p.precio;
    const { chip, estado } = getStockInfo(i);
    const noStock = estado === 'sin';
    return `<div class="prod-row">
      <div class="prod-name">${p.nombre}</div>
      ${chip}
      <div class="prod-price">${fmt(precio)}</div>
      <button class="prod-add${inCart ? ' added' : ''}${noStock ? ' nostock' : ''}"
        onclick="${noStock ? `showOk('⚠️','Sin stock','Este producto no tiene stock.')` : `addToCart(${i})`}">
        ${inCart ? '✓' : '+'}
      </button>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════════════
//  ENVÍOS
// ══════════════════════════════════════════════════
function renderEnviosTable() {
  const tbody = document.getElementById('tabla-envios');
  const activos = pedidosData.filter(p => p.estado !== 'cancelado');
  if (!activos.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty">No hay pedidos.</td></tr>'; return; }
  tbody.innerHTML = activos.map(p => {
    const dir = [p.envio?.calle, p.envio?.ciudad, p.envio?.provincia].filter(Boolean).join(', ') || '—';
    const tracking = p.envio?.tracking ? `<span class="tracking-code">${p.envio.tracking}</span>` : '<span style="color:#aaa;font-size:11px">Sin tracking</span>';
    return `<tr>
      <td>${p.nro}</td>
      <td>${p.cliente?.nombre || '—'}</td>
      <td style="max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${dir}</td>
      <td>${badgeEstado(p.estado)}</td>
      <td>${tracking}</td>
      <td><button class="btn btn-s" onclick="openEnvioModal('${p.id}')">Editar</button></td>
    </tr>`;
  }).join('');
}

function openEnvioModal(id) {
  const p = pedidosData.find(x => x.id === id);
  if (!p) return;
  editingEnvioId = id;
  document.getElementById('modal-envio-sub').textContent = `${p.nro} · ${p.cliente?.nombre || ''}`;
  document.getElementById('me-tracking').value = p.envio?.tracking || '';
  document.getElementById('me-empresa').value = p.envio?.empresa || 'Correo Argentino';
  document.getElementById('me-estado').value = p.estado || 'nuevo';
  document.getElementById('me-notas').value = p.envio?.notas || '';
  document.getElementById('modal-envio').classList.add('open');
}
window.openEnvioModal = openEnvioModal;

async function guardarEnvio() {
  if (!editingEnvioId) return;
  const ref = doc(db, 'pedidos', editingEnvioId);
  await updateDoc(ref, {
    estado: document.getElementById('me-estado').value,
    'envio.tracking': document.getElementById('me-tracking').value.trim(),
    'envio.empresa': document.getElementById('me-empresa').value,
    'envio.notas': document.getElementById('me-notas').value.trim(),
  });
  closeModal('modal-envio');
  showOk('✅', '¡Guardado!', 'El pedido fue actualizado correctamente.');
}
window.guardarEnvio = guardarEnvio;

// ══════════════════════════════════════════════════
//  CORREO ARGENTINO
// ══════════════════════════════════════════════════
function renderCorreoTable() {
  const tbody = document.getElementById('tabla-correo');
  const activos = pedidosData.filter(p => p.estado !== 'cancelado');
  if (!activos.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty">No hay pedidos.</td></tr>'; return; }
  tbody.innerHTML = activos.map(p => {
    const destino = [p.envio?.ciudad, p.envio?.cp].filter(Boolean).join(' ') || '—';
    const peso = (p.items||[]).reduce((s, i) => s + (PRODUCTOS[i.idx]?.peso || 0) * i.qty, 0).toFixed(2);
    const tracking = p.envio?.tracking
      ? `<span class="tracking-code">${p.envio.tracking}</span>`
      : '<span style="color:#aaa;font-size:11px">Pendiente</span>';
    return `<tr>
      <td><input type="checkbox" class="pchk" data-id="${p.id}"></td>
      <td>${p.nro}</td>
      <td>${p.cliente?.nombre || '—'}</td>
      <td>${destino}</td>
      <td>${peso}</td>
      <td>${tracking}</td>
    </tr>`;
  }).join('');
}

function toggleAll(cb) { document.querySelectorAll('.pchk').forEach(c => c.checked = cb.checked); }
window.toggleAll = toggleAll;

function exportarCSV() {
  const seleccionados = [...document.querySelectorAll('.pchk:checked')].map(cb => cb.dataset.id);
  if (!seleccionados.length) { showOk('⚠️', 'Sin pedidos', 'Seleccioná al menos un pedido.'); return; }
  const rows = pedidosData.filter(p => seleccionados.includes(p.id));
  const header = ['NroPedido','Nombre','Email','Telefono','Calle','Ciudad','Provincia','CP','Peso(kg)','Total'];
  const lines = rows.map(p => {
    const peso = (p.items||[]).reduce((s, i) => s + (PRODUCTOS[i.idx]?.peso || 0) * i.qty, 0).toFixed(2);
    return [
      p.nro, p.cliente?.nombre, p.cliente?.email, p.envio?.tel || p.cliente?.tel,
      p.envio?.calle, p.envio?.ciudad, p.envio?.provincia, p.envio?.cp,
      peso, p.total
    ].map(v => `"${v||''}"`).join(',');
  });
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'correo_argentino_export.csv'; a.click();
  showOk('📄', '¡Exportado!', `${rows.length} pedido(s) exportados. Subí el archivo en el portal de Correo Argentino Empresas.`);
}
window.exportarCSV = exportarCSV;

async function importarTracking(input) {
  const file = input.files[0];
  if (!file) return;
  const text = await file.text();
  const lines = text.split('\n').slice(1).filter(Boolean);
  let actualizados = 0;
  for (const line of lines) {
    const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    const nro = cols[0]; const tracking = cols[1];
    if (!nro || !tracking) continue;
    const pedido = pedidosData.find(p => p.nro === nro);
    if (pedido) {
      await updateDoc(doc(db, 'pedidos', pedido.id), { 'envio.tracking': tracking });
      actualizados++;
    }
  }
  showOk('📦', '¡Tracking importado!', `${actualizados} código(s) asignados correctamente.`);
}
window.importarTracking = importarTracking;

// ══════════════════════════════════════════════════
//  CATÁLOGO
// ══════════════════════════════════════════════════
function renderCatalogo() {
  document.getElementById('cat-count').textContent = PRODUCTOS.length + ' productos';
  document.getElementById('catalogo-tbody').innerHTML = PRODUCTOS.map(p => `<tr>
    <td>${p.nombre}</td>
    <td><span style="font-size:10px;color:#888">${p.cat}</span></td>
    <td>${fmt(p.precio)}</td>
    <td>${p.promo > 0 ? `<span style="color:#3B6D11;font-weight:600">${fmt(p.promo)}</span>` : '—'}</td>
    <td style="text-align:center">${p.peso >= 0.5 ? '<span style="color:#3B6D11">✓ gratis</span>' : '—'}</td>
  </tr>`).join('');
}

// ══════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════
document.getElementById('fecha-hoy').textContent = new Date().toLocaleDateString('es-AR', {
  weekday: 'long', day: 'numeric', month: 'long'
});

// Inicializar contador de órdenes
getDocs(collection(db, 'pedidos')).then(snap => {
  orderCounter = snap.size + 1;
});

cargarStock();
escucharPedidos();
