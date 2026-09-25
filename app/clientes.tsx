<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Blubur · Clientes</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<style>
  :root{
    --paper:#FAF6EE;
    --paper-2:#F2ECDD;
    --ink:#2A241B;
    --ink-soft:#6B6151;
    --line:#DCD2B8;
    --wine:#7A2E2E;
    --wine-soft:#F0DEDE;
    --gold:#B4913E;
    --ok:#3E7A4E;
  }
  *{box-sizing:border-box;}
  body{
    margin:0;
    background:var(--paper);
    color:var(--ink);
    font-family:'Inter',sans-serif;
    min-height:100vh;
  }
  .wrap{
    max-width:980px;
    margin:0 auto;
    padding:48px 28px 80px;
  }
  header{
    display:flex;
    justify-content:space-between;
    align-items:flex-end;
    gap:24px;
    border-bottom:2px solid var(--ink);
    padding-bottom:20px;
    margin-bottom:28px;
    flex-wrap:wrap;
  }
  h1{
    font-family:'Fraunces',serif;
    font-weight:600;
    font-size:2.4rem;
    margin:0;
    letter-spacing:-0.01em;
  }
  .status{
    display:flex;
    align-items:center;
    gap:8px;
    font-size:0.85rem;
    color:var(--ink-soft);
  }
  .dot{
    width:9px;height:9px;border-radius:50%;
    background:#C0392B;
    box-shadow:0 0 0 3px rgba(192,57,43,0.15);
    transition:background .3s, box-shadow .3s;
  }
  .dot.live{
    background:var(--ok);
    box-shadow:0 0 0 3px rgba(62,122,78,0.15);
  }
  .controls{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:16px;
    margin-bottom:18px;
    flex-wrap:wrap;
  }
  input[type="search"]{
    flex:1;
    min-width:220px;
    font-family:'Inter',sans-serif;
    font-size:0.95rem;
    padding:11px 16px;
    border:1.5px solid var(--line);
    border-radius:8px;
    background:#fff;
    color:var(--ink);
    outline:none;
  }
  input[type="search"]:focus{border-color:var(--wine);}
  .count{
    font-size:0.85rem;
    color:var(--ink-soft);
    white-space:nowrap;
  }
  table{
    width:100%;
    border-collapse:collapse;
    background:#fff;
    border:1px solid var(--line);
    border-radius:10px;
    overflow:hidden;
  }
  thead th{
    text-align:left;
    font-size:0.72rem;
    font-weight:600;
    letter-spacing:0.04em;
    color:var(--ink-soft);
    background:var(--paper-2);
    padding:12px 16px;
    border-bottom:1px solid var(--line);
  }
  tbody td{
    padding:14px 16px;
    border-bottom:1px solid var(--line);
    vertical-align:middle;
    font-size:0.95rem;
  }
  tbody tr:last-child td{border-bottom:none;}
  tbody tr:hover{background:#FDFBF6;}
  .name{
    font-weight:600;
  }
  .nick{
    font-size:0.8rem;
    color:var(--ink-soft);
    margin-top:2px;
  }
  .muted{color:var(--ink-soft); font-style:italic;}
  .pill{
    display:inline-flex;
    align-items:center;
    gap:6px;
    color:var(--ink);
    text-decoration:none;
    cursor:pointer;
    border-bottom:1px dashed var(--line);
    padding-bottom:1px;
  }
  .pill:hover{border-color:var(--wine); color:var(--wine);}
  .pill svg{width:14px;height:14px;flex-shrink:0;opacity:0.65;}
  .empty, .error{
    padding:48px 20px;
    text-align:center;
    color:var(--ink-soft);
    background:#fff;
    border:1px dashed var(--line);
    border-radius:10px;
  }
  .error{color:var(--wine); border-color:var(--wine-soft); background:var(--wine-soft);}
  .toast{
    position:fixed;
    bottom:24px; left:50%;
    transform:translateX(-50%) translateY(20px);
    background:var(--ink);
    color:var(--paper);
    font-size:0.85rem;
    padding:10px 18px;
    border-radius:20px;
    opacity:0;
    transition:opacity .25s, transform .25s;
    pointer-events:none;
  }
  .toast.show{opacity:1; transform:translateX(-50%) translateY(0);}
  footer{
    margin-top:20px;
    font-size:0.78rem;
    color:var(--ink-soft);
    text-align:right;
  }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>Clientes</h1>
      <div class="status"><span class="dot" id="dot"></span><span id="statusText">conectando…</span></div>
    </header>

    <div class="controls">
      <input type="search" id="search" placeholder="Buscar por nombre, nick, dirección o teléfono…" />
      <div class="count" id="count"></div>
    </div>

    <div id="tableHost"></div>

    <footer id="lastUpdate"></footer>
  </div>

  <div class="toast" id="toast"></div>

<script>
  const SUPABASE_URL = 'https://dxzwylrmzuppeuilqjvr.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_yI0DYp4_tLrQ7azvISdENw_x4KFaFly';
  const TABLE = 'perfiles';

  const { createClient } = supabase;
  const client = createClient(SUPABASE_URL, SUPABASE_KEY);

  let rows = [];
  let lastError = null;

  const dot = document.getElementById('dot');
  const statusText = document.getElementById('statusText');
  const tableHost = document.getElementById('tableHost');
  const countEl = document.getElementById('count');
  const lastUpdateEl = document.getElementById('lastUpdate');
  const searchInput = document.getElementById('search');
  const toast = document.getElementById('toast');

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'), 1800);
  }

  function copyText(text, label){
    navigator.clipboard.writeText(text).then(()=>showToast(label + ' copiado'));
  }

  function esc(str){
    const d = document.createElement('div');
    d.textContent = str ?? '';
    return d.innerHTML;
  }

  function phoneIcon(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.6 10.8c1.3 2.6 3.4 4.7 6 6l2-2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.9c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2 2z"/></svg>';
  }
  function pinIcon(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  }

  function render(){
    const term = searchInput.value.trim().toLowerCase();
    const filtered = term
      ? rows.filter(r => [r.nombre_completo, r.nick, r.direccion_postal, r.telefono]
          .some(v => (v || '').toString().toLowerCase().includes(term)))
      : rows;

    countEl.textContent = rows.length
      ? (filtered.length === rows.length ? rows.length + ' clientes' : filtered.length + ' de ' + rows.length)
      : '';

    if (lastError){
      tableHost.innerHTML = '<div class="error">No se pudo leer la tabla "' + TABLE + '". ' + esc(lastError) + '<br><br>Comprueba que existe una política de RLS que permita SELECT al rol anon.</div>';
      return;
    }

    if (!filtered.length){
      tableHost.innerHTML = '<div class="empty">' + (rows.length ? 'Sin resultados para esa búsqueda.' : 'Todavía no hay clientes en la tabla.') + '</div>';
      return;
    }

    let html = '<table><thead><tr><th>Cliente</th><th>Teléfono</th><th>Dirección</th></tr></thead><tbody>';
    filtered.forEach(r => {
      const nombre = esc(r.nombre_completo || '(sin nombre)');
      const nick = r.nick ? '<div class="nick">@' + esc(r.nick) + '</div>' : '';
      const tel = r.telefono
        ? '<span class="pill" onclick="copyText(\'' + esc(r.telefono).replace(/'/g,"\\'") + '\',\'Teléfono\')">' + phoneIcon() + esc(r.telefono) + '</span>'
        : '<span class="muted">sin teléfono</span>';
      const dir = r.direccion_postal
        ? '<a class="pill" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(r.direccion_postal) + '">' + pinIcon() + esc(r.direccion_postal) + '</a>'
        : '<span class="muted">sin dirección</span>';
      html += '<tr><td><div class="name">' + nombre + '</div>' + nick + '</td><td>' + tel + '</td><td>' + dir + '</td></tr>';
    });
    html += '</tbody></table>';
    tableHost.innerHTML = html;
  }

  async function fetchClientes(){
    const { data, error } = await client
      .from(TABLE)
      .select('user_id,nick,nombre_completo,direccion_postal,telefono')
      .order('nombre_completo', { ascending: true, nullsFirst: false });

    if (error){
      lastError = error.message;
    } else {
      lastError = null;
      rows = data || [];
    }
    lastUpdateEl.textContent = 'Última actualización: ' + new Date().toLocaleTimeString('es-ES');
    render();
  }

  searchInput.addEventListener('input', render);

  fetchClientes();

  client
    .channel('perfiles-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => {
      fetchClientes();
      showToast('Datos actualizados');
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED'){
        dot.classList.add('live');
        statusText.textContent = 'en vivo';
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED'){
        dot.classList.remove('live');
        statusText.textContent = 'sin conexión en tiempo real';
      }
    });
</script>
</body>
</html>