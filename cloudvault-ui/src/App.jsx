import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listItems, createFolder, uploadFile, deleteItem, downloadUrl } from './api';
import { Icon, Logo } from './Logo';

const MAX = 10 * 1024 * 1024; // matches spring.servlet.multipart.max-file-size=10MB
const COLORS = { PDF: '#ff5a36', DOC: '#ffb347', IMG: '#ffe2b8', VID: '#ff8a1f', ZIP: '#c8642c', CODE: '#f4ece4', FILE: '#9a8f84' };

const typeOf = (item) => {
  const e = item.name.split('.').pop().toLowerCase();
  if (/^(png|jpe?g|gif|webp|svg)$/.test(e)) return 'IMG';
  if (/^(mp4|mov|webm|mkv)$/.test(e)) return 'VID';
  if (/^(zip|rar|7z|tar|gz)$/.test(e)) return 'ZIP';
  if (/^(java|js|jsx|py|html|css|json|xml|sql)$/.test(e)) return 'CODE';
  if (e === 'pdf') return 'PDF';
  if (/^(doc|docx|txt|md|ppt|pptx|xls|xlsx|csv)$/.test(e)) return 'DOC';
  return 'FILE';
};

const fmt = (b) => (b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : b >= 1024 ? Math.round(b / 1024) + ' KB' : b + ' B');
const day = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export default function App() {
  const [path, setPath] = useState([]);
  const parent = path.length ? path[path.length - 1].id : null;
  const [items, setItems] = useState([]);
  const [state, setState] = useState('loading');
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [grid, setGrid] = useState(true);
  const [toast, setToast] = useState('');
  const [dlg, setDlg] = useState(false);
  const [name, setName] = useState('');
  const [drag, setDrag] = useState(false);
  const fin = useRef(null);
  const timer = useRef(null);

  const say = (t) => { setToast(t); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(''), 2800); };

  const load = useCallback(async () => {
    setState('loading');
    try { setItems(await listItems(parent)); setState('ok'); }
    catch (e) { setErr(e.message); setState('err'); }
  }, [parent]);

  useEffect(() => { load(); }, [load]);

  const add = async (list) => {
    let ok = 0;
    for (const f of list) {
      if (f.size > MAX) { say(`${f.name} is over the 10 MB limit`); continue; }
      try { await uploadFile(f, parent); ok++; } catch (e) { say(`Upload failed: ${e.message}`); }
    }
    if (ok) { say(`${ok} file${ok > 1 ? 's' : ''} uploaded`); load(); }
  };

  useEffect(() => {
    let depth = 0;
    const stop = (e) => e.preventDefault();
    const enter = (e) => { e.preventDefault(); depth++; setDrag(true); };
    const leave = () => { if (--depth <= 0) { depth = 0; setDrag(false); } };
    const drop = (e) => { e.preventDefault(); depth = 0; setDrag(false); if (e.dataTransfer?.files?.length) add(e.dataTransfer.files); };
    window.addEventListener('dragenter', enter); window.addEventListener('dragleave', leave);
    window.addEventListener('dragover', stop); window.addEventListener('drop', drop);
    return () => { window.removeEventListener('dragenter', enter); window.removeEventListener('dragleave', leave); window.removeEventListener('dragover', stop); window.removeEventListener('drop', drop); };
  });

  const mkdir = async (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    try { await createFolder(n, parent); setDlg(false); setName(''); say('Folder created'); load(); }
    catch (x) { say(x.message); }
  };

  const remove = async (i) => {
    if (!window.confirm(`Delete "${i.name}"?`)) return;
    try { await deleteItem(i.id); say('Deleted'); load(); } catch (x) { say(x.message); }
  };

  const shown = useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'FOLDER' ? -1 : 1)),
    [items, q]);
  const files = items.filter((i) => i.kind === 'FILE');
  const folders = items.length - files.length;
  const total = files.reduce((a, f) => a + f.size, 0);
  const R = 54;
  const CIRC = 2 * Math.PI * R;
  const byType = useMemo(() => {
    const m = {};
    files.forEach((f) => { const t = typeOf(f); m[t] = (m[t] || 0) + f.size; });
    return Object.entries(m);
  }, [files]);

  let acc = 0;
  const segs = total > 0 ? byType.map(([t, v]) => { const len = (v / total) * CIRC; const seg = { t, v, len: Math.max(len - 3, 1), off: acc }; acc += len; return seg; }) : [];
  const spot = (e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', e.clientX - r.left + 'px'); e.currentTarget.style.setProperty('--my', e.clientY - r.top + 'px'); };
  const status = state === 'ok' ? 'Connected to Drive-Service' : state === 'err' ? 'Backend offline' : 'Connecting…';

  return (
    <div className="app">
      <aside>
        <div className="brand"><Logo /><b>CloudVault</b></div>
        <button className={'nav' + (path.length ? '' : ' on')} onClick={() => setPath([])}><Icon n="home" s={20} /><span>My drive</span></button>
        <button className="nav" onClick={() => setDlg(true)}><Icon n="plus" s={20} /><span>New folder</span></button>
        <button className="nav" onClick={() => fin.current.click()}><Icon n="up" s={20} /><span>Upload</span></button>
      </aside>

      <main>
        <header>
          <h1>
            <nav className="crumbs" aria-label="Folder path">
              <button onClick={() => setPath([])}>My drive</button>
              {path.map((p, i) => (<span key={p.id}><i>/</i><button onClick={() => setPath(path.slice(0, i + 1))}>{p.name}</button></span>))}
            </nav>
            <small><i className={'dot ' + state} />{status}</small>
          </h1>
          <label className="search"><Icon n="se" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search this folder" aria-label="Search this folder" /></label>
          <input ref={fin} type="file" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
        </header>

        <section className="hero glass">
          <div className="dial">
            <svg viewBox="0 0 140 140" aria-hidden="true">
              <circle className="ticks" cx="70" cy="70" r="66" />
              <circle className="track" cx="70" cy="70" r={R} />
              <g transform="rotate(-90 70 70)">
                {segs.map((g) => (<circle key={g.t + g.v} className="seg" cx="70" cy="70" r={R} stroke={COLORS[g.t]} strokeDasharray={`${g.len} ${CIRC - g.len}`} strokeDashoffset={-g.off} />))}
              </g>
            </svg>
            <div className="core"><b>{fmt(total)}</b><span>in this folder</span></div>
          </div>
          <div className="hinfo">
            <h2>{files.length} {files.length === 1 ? 'file' : 'files'} and {folders} {folders === 1 ? 'folder' : 'folders'}</h2>
            <p>Everything here is stored on your own disk.</p>
            <div className="legend">{segs.map((g) => (<span key={g.t} style={{ '--c': COLORS[g.t] }}>{g.t} {fmt(g.v)}</span>))}</div>
            <div className="hact">
              <button className="up" onClick={() => fin.current.click()}><Icon n="up" />Upload files</button>
              <button className="ghost" onClick={() => setDlg(true)}><Icon n="plus" />New folder</button>
            </div>
          </div>
        </section>

        <div className="sec">
          <h2>{q ? `Results for "${q}"` : 'Contents'}</h2>
          <div className="seg2">
            <button className={grid ? 'on' : ''} onClick={() => setGrid(true)} aria-label="Grid view"><Icon n="gr" s={16} /></button>
            <button className={grid ? '' : 'on'} onClick={() => setGrid(false)} aria-label="List view"><Icon n="li" s={16} /></button>
          </div>
        </div>

        {state === 'err' ? (
          <div className="empty err">
            <b>Can’t load your files</b>
            <p>{err}. Check that Drive-Service is running on port 8091 and Storage-Service on 8092.</p>
            <button className="up" onClick={load}>Try again</button>
          </div>
        ) : state === 'loading' && items.length === 0 ? (
          <div className="empty">Loading…</div>
        ) : shown.length === 0 ? (
          <div className="empty">{q ? 'No items match your search.' : 'This folder is empty. Upload a file or create a folder.'}</div>
        ) : (
          <div className={'files ' + (grid ? 'grid' : 'list')}>
            {shown.map((i, idx) => {
              const folder = i.kind === 'FOLDER';
              const t = folder ? 'DIR' : typeOf(i);
              return (
                <div key={i.id} className={'fc' + (folder ? ' dir' : '')} style={{ '--i': Math.min(idx, 12) }} onMouseMove={spot}>
                  <button className="hit" onClick={() => (folder ? setPath([...path, { id: i.id, name: i.name }]) : window.open(downloadUrl(i.id), '_self'))} aria-label={folder ? `Open ${i.name}` : `Download ${i.name}`} />
                  <div className="th" style={{ '--c': folder ? '#ff8a1f' : COLORS[t] }}>{folder ? <Icon n="fo" s={28} /> : t}</div>
                  <div className="n" title={i.name}>{i.name}</div>
                  <div className="m"><span>{folder ? 'Folder' : fmt(i.size)}</span><span>{day(i.createdAt)}</span></div>
                  <div className="act">
                    {!folder && <a className="ib" href={downloadUrl(i.id)} aria-label="Download"><Icon n="dl" s={16} /></a>}
                    <button className="ib" onClick={() => remove(i)} aria-label="Delete"><Icon n="tr" s={16} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {dlg && (
        <div className="modal" onClick={() => setDlg(false)}>
          <form className="glass card" onClick={(e) => e.stopPropagation()} onSubmit={mkdir}>
            <h3>New folder</h3>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder name" aria-label="Folder name" />
            <div className="row"><button type="button" className="ghost" onClick={() => setDlg(false)}>Cancel</button><button className="up" type="submit">Create folder</button></div>
          </form>
        </div>
      )}
      {drag && <div className="drop">Drop files to upload to this folder</div>}
      <div className={'toast' + (toast ? ' on' : '')} role="status">{toast}</div>
    </div>
  );
}
