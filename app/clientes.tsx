'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type Cliente = {
  user_id: string;
  nick: string | null;
  nombre_completo: string | null;
  direccion_postal: string | null;
  telefono: string | null;
};

export default function ClientesPage() {
  const [rows, setRows] = useState<Cliente[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [live, setLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [toast, setToast] = useState('');

  const fetchClientes = useCallback(async () => {
    const { data, error } = await supabase
      .from('perfiles')
      .select('user_id,nick,nombre_completo,direccion_postal,telefono')
      .order('nombre_completo', { ascending: true, nullsFirst: false });

    if (error) {
      setError(error.message);
    } else {
      setError(null);
      setRows(data || []);
    }
    setLastUpdate(new Date().toLocaleTimeString('es-ES'));
  }, []);

  useEffect(() => {
    fetchClientes();

    const channel = supabase
      .channel('perfiles-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'perfiles' },
        () => {
          fetchClientes();
          setToast('Datos actualizados');
          setTimeout(() => setToast(''), 1800);
        }
      )
      .subscribe((status) => setLive(status === 'SUBSCRIBED'));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchClientes]);

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return [r.nombre_completo, r.nick, r.direccion_postal, r.telefono].some((v) =>
      (v || '').toString().toLowerCase().includes(term)
    );
  });

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast('Teléfono copiado');
    setTimeout(() => setToast(''), 1800);
  };

  return (
    <div className="wrap">
      <header>
        <h1>Clientes</h1>
        <div className="status">
          <span className={`dot ${live ? 'live' : ''}`} />
          <span>{live ? 'en vivo' : 'conectando…'}</span>
        </div>
      </header>

      <div className="controls">
        <input
          type="search"
          placeholder="Buscar por nombre, nick, dirección o teléfono…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="count">
          {rows.length
            ? filtered.length === rows.length
              ? `${rows.length} clientes`
              : `${filtered.length} de ${rows.length}`
            : ''}
        </div>
      </div>

      {error ? (
        <div className="error">
          No se pudo leer la tabla &quot;perfiles&quot;. {error}
          <br />
          <br />
          Comprueba que existe una política de RLS que permita SELECT al rol anon.
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          {rows.length ? 'Sin resultados para esa búsqueda.' : 'Todavía no hay clientes en la tabla.'}
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Dirección</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.user_id}>
                <td>
                  <div className="name">{r.nombre_completo || '(sin nombre)'}</div>
                  {r.nick && <div className="nick">@{r.nick}</div>}
                </td>
                <td>
                  {r.telefono ? (
                    <span className="pill" onClick={() => copyText(r.telefono!)}>
                      {r.telefono}
                    </span>
                  ) : (
                    <span className="muted">sin teléfono</span>
                  )}
                </td>
                <td>
                  {r.direccion_postal ? (
                    <a
                      className="pill"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        r.direccion_postal
                      )}`}
                    >
                      {r.direccion_postal}
                    </a>
                  ) : (
                    <span className="muted">sin dirección</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <footer>{lastUpdate && `Última actualización: ${lastUpdate}`}</footer>

      {toast && <div className="toast">{toast}</div>}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&display=swap');
      `}</style>

      <style jsx>{`
        .wrap {
          max-width: 980px;
          margin: 0 auto;
          padding: 48px 28px 80px;
          font-family: 'Inter', sans-serif;
          color: #2a241b;
          background: #faf6ee;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          border-bottom: 2px solid #2a241b;
          padding-bottom: 20px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        h1 {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 2.4rem;
          margin: 0;
        }
        .status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #6b6151;
        }
        .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #c0392b;
          box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.15);
          transition: background 0.3s, box-shadow 0.3s;
        }
        .dot.live {
          background: #3e7a4e;
          box-shadow: 0 0 0 3px rgba(62, 122, 78, 0.15);
        }
        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        input[type='search'] {
          flex: 1;
          min-width: 220px;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          padding: 11px 16px;
          border: 1.5px solid #dcd2b8;
          border-radius: 8px;
          background: #fff;
          color: #2a241b;
          outline: none;
        }
        input[type='search']:focus {
          border-color: #7a2e2e;
        }
        .count {
          font-size: 0.85rem;
          color: #6b6151;
          white-space: nowrap;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border: 1px solid #dcd2b8;
          border-radius: 10px;
          overflow: hidden;
        }
        thead th {
          text-align: left;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #6b6151;
          background: #f2ecdd;
          padding: 12px 16px;
          border-bottom: 1px solid #dcd2b8;
        }
        tbody td {
          padding: 14px 16px;
          border-bottom: 1px solid #dcd2b8;
          vertical-align: middle;
          font-size: 0.95rem;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        tbody tr:hover {
          background: #fdfbf6;
        }
        .name {
          font-weight: 600;
        }
        .nick {
          font-size: 0.8rem;
          color: #6b6151;
          margin-top: 2px;
        }
        .muted {
          color: #6b6151;
          font-style: italic;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #2a241b;
          text-decoration: none;
          cursor: pointer;
          border-bottom: 1px dashed #dcd2b8;
          padding-bottom: 1px;
        }
        .pill:hover {
          border-color: #7a2e2e;
          color: #7a2e2e;
        }
        .empty,
        .error {
          padding: 48px 20px;
          text-align: center;
          color: #6b6151;
          background: #fff;
          border: 1px dashed #dcd2b8;
          border-radius: 10px;
        }
        .error {
          color: #7a2e2e;
          border-color: #f0dede;
          background: #f0dede;
        }
        footer {
          margin-top: 20px;
          font-size: 0.78rem;
          color: #6b6151;
          text-align: right;
        }
        .toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: #2a241b;
          color: #faf6ee;
          font-size: 0.85rem;
          padding: 10px 18px;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}