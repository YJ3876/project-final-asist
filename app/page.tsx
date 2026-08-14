'use client';
import { useEffect, useState } from 'react';

const COLORS = [
  { main: '#33628F', bg: '#E7EEF5' },
  { main: '#2A7A67', bg: '#E4F1EC' },
  { main: '#B5791C', bg: '#F6ECD9' },
  { main: '#6B4C93', bg: '#EDE7F3' },
  { main: '#55606E', bg: '#E9EBED' },
];
const ICON_PRESETS = ['⭐', '⚽', '🎨', '📚', '🐱', '🚗', '🎮', '🌟', '🦄', '🐶', '🎸', '🌈'];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DAYS_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const DEVICE_KEY = 'papan-keluarga-role';

const TYPE_ICON: Record<string, string> = {
  sekolah: 'ti-school',
  les: 'ti-book-2',
  jemput: 'ti-car',
  ujian: 'ti-clipboard-text',
  tugas: 'ti-pencil',
  kebutuhan: 'ti-shopping-bag',
};
const STATUS_ICON: Record<string, string> = {
  belum: 'ti-circle',
  sedang: 'ti-clock-hour-4',
  selesai: 'ti-circle-check',
};
const URGENT_COLOR = { main: 'var(--color-danger)', bg: '#F7E7E5' };
function typeColor(type: string, col: { main: string; bg: string }) {
  return type === 'ujian' ? URGENT_COLOR : col;
}

function uid() {
  return 'x' + Math.random().toString(36).slice(2, 9);
}
function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}
function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}
function weekStart(base: Date) {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}
function monthStart(base: Date) {
  return new Date(base.getFullYear(), base.getMonth(), 1);
}

export default function Page() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setRole(localStorage.getItem(DEVICE_KEY));
    load();
  }, []);

  async function load() {
    const r = await fetch('/api/state');
    const j = await r.json();
    if (!j.ok) {
      setError('Penyimpanan data belum terhubung. Buka dashboard Vercel → Storage → tambahkan database (Upstash Redis, gratis) lalu hubungkan ke proyek ini.');
      return;
    }
    setData(j.data);
  }
  async function act(action: any) {
    const r = await fetch('/api/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(action) });
    const j = await r.json();
    if (j.ok) setData(j.data);
  }
  function chooseRole(r: string) {
    localStorage.setItem(DEVICE_KEY, r);
    setRole(r);
  }
  function switchDevice() {
    localStorage.removeItem(DEVICE_KEY);
    setRole(null);
  }

  if (error) return <Shell><Banner text={error} bad /></Shell>;
  if (!data || role === undefined) return <Shell><div style={{ fontSize: 14, color: '#68717D' }}>Memuat…</div></Shell>;

  if (!role) {
    return (
      <Shell>
        <h1 style={{ fontFamily: 'Fraunces,serif', fontSize: 24, marginBottom: 20, textAlign: 'center' }}>Siapa yang membuka? <i className="ti ti-users" style={{ color: '#B5791C' }} /></h1>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
          {data.children.map((c: any) => (
            <button key={c.id} onClick={() => chooseRole(c.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <div className="pk-halo" style={{ width: 108, height: 108, borderRadius: '50%', ['--halo-color' as any]: COLORS[c.color].bg }}>
                <div style={{ width: 84, height: 84, borderRadius: '50%', background: COLORS[c.color].main, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces,serif', fontSize: c.icon ? 38 : 34, fontWeight: 600 }}>
                  {c.icon || c.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <span style={{ fontFamily: 'Fraunces,serif', fontSize: 16, fontWeight: 600 }}>{c.name}</span>
            </button>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => chooseRole('ortu')} style={{ fontSize: 13, fontWeight: 600, padding: '10px 18px', borderRadius: 999, border: '1px solid #E4DFD3', background: '#fff', cursor: 'pointer', color: '#242B35', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-user-shield" /> Saya orang tua
          </button>
        </div>
      </Shell>
    );
  }

  const child = role !== 'ortu' ? data.children.find((c: any) => c.id === role) : null;

  return (
    <Shell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {child && <Avatar child={child} size={36} />}
          <h1 style={{ fontFamily: 'Fraunces,serif', fontSize: 21, margin: 0 }}>{role === 'ortu' ? 'Papan keluarga' : child?.name}</h1>
        </div>
        <button onClick={switchDevice} style={{ fontSize: 18, color: '#68717D', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Ganti pengguna">
          <i className="ti ti-logout-2" />
        </button>
      </div>
      {role === 'ortu' ? <OrtuView data={data} act={act} /> : <AnakView data={data} act={act} childId={role} />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="pk-shell">{children}</div>;
}
function Card({ children }: { children: React.ReactNode }) {
  return <div className="pk-card">{children}</div>;
}
function Banner({ text, bad }: { text: string; bad?: boolean }) {
  return <div style={{ padding: 14, background: bad ? '#F7E7E5' : '#E4F1EC', color: bad ? '#B3453F' : '#2A7A67', borderRadius: 12, fontSize: 13, marginBottom: 14 }}>{text}</div>;
}
function Avatar({ child, size = 26 }: { child: any; size?: number }) {
  return (
    <div style={{ width: size, height: size, minWidth: size, borderRadius: '50%', background: COLORS[child.color].main, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * (child.icon ? 0.55 : 0.44), fontWeight: 600 }}>
      {child.icon || child.name.charAt(0).toUpperCase()}
    </div>
  );
}
function IconChip({ icon, color }: { icon: string; color: { main: string; bg: string } }) {
  return (
    <div style={{ width: 30, height: 30, minWidth: 30, borderRadius: 9, background: color.bg, color: color.main, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
      <i className={`ti ${icon}`} />
    </div>
  );
}

/* ---------- View switch (Harian / Mingguan / Bulanan) ---------- */
function ViewSwitch({ view, setView }: { view: string; setView: (v: string) => void }) {
  const opts = [['harian', 'ti-sun', 'Harian'], ['mingguan', 'ti-calendar-week', 'Mingguan'], ['bulanan', 'ti-calendar', 'Bulanan']];
  return (
    <div style={{ display: 'flex', background: '#EFEBE1', borderRadius: 999, padding: 4, marginBottom: 14, gap: 4 }}>
      {opts.map(([v, icon, label]) => (
        <button
          key={v}
          onClick={() => setView(v)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '9px 6px',
            borderRadius: 999,
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            background: view === v ? '#242B35' : 'transparent',
            color: view === v ? '#fff' : '#68717D',
          }}
        >
          <i className={`ti ${icon}`} /> {label}
        </button>
      ))}
    </div>
  );
}

function eventsForDate(data: any, iso: string, dow: number, childId?: string) {
  const routines = data.routines.filter((r: any) => r.day === dow && (!childId || r.childId === childId));
  const items = data.items.filter((i: any) => i.dueDate === iso && (!childId || i.childId === childId));
  return { routines, items };
}

function DailyView({ data, childId }: { data: any; childId?: string }) {
  const today = new Date();
  const iso = toISO(today);
  const { routines, items } = eventsForDate(data, iso, today.getDay(), childId);
  const upcoming = data.items
    .filter((i: any) => i.status !== 'selesai' && (!childId || i.childId === childId))
    .map((i: any) => ({ ...i, du: daysUntil(i.dueDate) }))
    .filter((i: any) => i.du > 0 && i.du <= 3)
    .sort((a: any, b: any) => a.du - b.du);

  const rows = [...routines.map((r: any) => ({ kind: 'routine', ...r })), ...items.map((i: any) => ({ kind: 'item', ...i }))];

  if (rows.length === 0 && upcoming.length === 0) {
    return <div style={{ textAlign: 'center', padding: '24px 0', color: '#68717D' }}><i className="ti ti-coffee" style={{ fontSize: 32 }} /><div style={{ fontSize: 13, marginTop: 8 }}>Tidak ada yang mendesak hari ini.</div></div>;
  }
  return (
    <div>
      {rows.map((r: any) => {
        const c = data.children.find((c: any) => c.id === r.childId);
        if (!c) return null;
        const col = COLORS[c.color];
        return (
          <div key={r.kind + r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #E4DFD3' }}>
            <IconChip icon={TYPE_ICON[r.type]} color={typeColor(r.type, col)} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: '#68717D' }}>{r.kind === 'routine' ? r.time : 'Hari ini'}{r.neededItems ? ' · ' + r.neededItems : ''}</div>
            </div>
            {!childId && <Avatar child={c} size={22} />}
          </div>
        );
      })}
      {upcoming.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#68717D', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Segera datang</div>
          {upcoming.map((i: any) => {
            const c = data.children.find((c: any) => c.id === i.childId);
            if (!c) return null;
            const col = COLORS[c.color];
            return (
              <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <IconChip icon={TYPE_ICON[i.type]} color={typeColor(i.type, col)} />
                <div style={{ flex: 1, fontSize: 13 }}>{i.title}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: i.du === 1 ? '#B5791C' : '#68717D' }}>H-{i.du}</span>
                {!childId && <Avatar child={c} size={20} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DateDetail({ data, iso, childId }: { data: any; iso: string; childId?: string }) {
  const dow = new Date(iso + 'T00:00:00').getDay();
  const { routines, items } = eventsForDate(data, iso, dow, childId);
  const rows = [...routines.map((r: any) => ({ kind: 'routine', ...r })), ...items.map((i: any) => ({ kind: 'item', ...i }))];
  const label = new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ marginTop: 10, background: 'var(--color-paper-2)', borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--color-neutral)' }}>Tidak ada kegiatan atau tugas di tanggal ini.</div>
      ) : (
        rows.map((r: any) => {
          const c = data.children.find((c: any) => c.id === r.childId);
          if (!c) return null;
          return (
            <div key={r.kind + r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--color-rule)' }}>
              <IconChip icon={TYPE_ICON[r.type]} color={typeColor(r.type, COLORS[c.color])} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{r.title}</div>
                <div style={{ fontSize: 11, color: 'var(--color-neutral)' }}>{r.kind === 'routine' ? r.time : r.neededItems || 'Tugas/ujian'}</div>
              </div>
              <Avatar child={c} size={22} />
            </div>
          );
        })
      )}
    </div>
  );
}

function WeeklyView({ data, childId }: { data: any; childId?: string }) {
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const start = weekStart(new Date());
  start.setDate(start.getDate() + offset * 7);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const todayISO = toISO(new Date());

  return (
    <div>
      <WeekNav offset={offset} setOffset={setOffset} label={`${days[0].getDate()} - ${days[6].getDate()} ${days[6].toLocaleString('id-ID', { month: 'long' })}`} />
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {days.map((d) => {
          const iso = toISO(d);
          const { routines, items } = eventsForDate(data, iso, d.getDay(), childId);
          const rows = [...routines, ...items];
          const isToday = iso === todayISO;
          const isSelected = iso === selected;
          return (
            <button
              key={iso}
              onClick={() => setSelected(isSelected ? null : iso)}
              style={{
                minWidth: 100,
                flex: '0 0 auto',
                background: isToday ? '#F6ECD9' : '#F9F7F2',
                borderRadius: 12,
                padding: '10px 8px',
                border: isSelected ? '2px solid var(--color-accent)' : '2px solid transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: '#68717D', fontWeight: 600 }}>{DAYS[d.getDay()]}</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{d.getDate()}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                {rows.length === 0 && <i className="ti ti-minus" style={{ color: '#D3D1C7' }} />}
                {rows.slice(0, 4).map((r: any, idx: number) => {
                  const c = data.children.find((c: any) => c.id === r.childId);
                  if (!c) return null;
                  return <i key={idx} className={`ti ${TYPE_ICON[r.type]}`} style={{ color: COLORS[c.color].main, fontSize: 16 }} title={r.title} />;
                })}
                {rows.length > 4 && <span style={{ fontSize: 10, color: '#68717D' }}>+{rows.length - 4}</span>}
              </div>
            </button>
          );
        })}
      </div>
      {selected && <DateDetail data={data} iso={selected} childId={childId} />}
    </div>
  );
}

function MonthlyView({ data, childId }: { data: any; childId?: string }) {
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const base = monthStart(new Date());
  base.setMonth(base.getMonth() + offset);
  const gridStart = weekStart(base);
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const todayISO = toISO(new Date());

  return (
    <div>
      <WeekNav offset={offset} setOffset={setOffset} label={base.toLocaleString('id-ID', { month: 'long', year: 'numeric' })} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
        {DAYS.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#68717D' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {cells.map((d) => {
          const iso = toISO(d);
          const inMonth = d.getMonth() === base.getMonth();
          const { routines, items } = eventsForDate(data, iso, d.getDay(), childId);
          const childIds = Array.from(new Set([...routines, ...items].map((r: any) => r.childId))).slice(0, 3);
          const isToday = iso === todayISO;
          const isSelected = iso === selected;
          return (
            <button
              key={iso}
              onClick={() => setSelected(isSelected ? null : iso)}
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                background: isToday ? '#F6ECD9' : inMonth ? '#F9F7F2' : 'transparent',
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                opacity: inMonth ? 1 : 0.35,
                border: isSelected ? '2px solid var(--color-accent)' : '2px solid transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: isToday ? 700 : 400 }}>{d.getDate()}</div>
              <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                {childIds.map((cid: any) => {
                  const c = data.children.find((c: any) => c.id === cid);
                  if (!c) return null;
                  return <div key={cid} style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS[c.color].main }} />;
                })}
              </div>
            </button>
          );
        })}
      </div>
      {selected && <DateDetail data={data} iso={selected} childId={childId} />}
    </div>
  );
}

function WeekNav({ offset, setOffset, label }: { offset: number; setOffset: (n: number) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <button onClick={() => setOffset(offset - 1)} className="pk-btn" style={navBtnStyle}><i className="ti ti-chevron-left" /></button>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      <button onClick={() => setOffset(offset + 1)} className="pk-btn" style={navBtnStyle}><i className="ti ti-chevron-right" /></button>
    </div>
  );
}
const navBtnStyle: React.CSSProperties = { background: 'var(--color-paper-2)', width: 30, height: 30, padding: 0, fontSize: 15, color: 'var(--color-ink)' };

function ScheduleBlock({ data, childId }: { data: any; childId?: string }) {
  const [view, setView] = useState('harian');
  return (
    <Card>
      <ViewSwitch view={view} setView={setView} />
      {view === 'harian' && <DailyView data={data} childId={childId} />}
      {view === 'mingguan' && <WeeklyView data={data} childId={childId} />}
      {view === 'bulanan' && <MonthlyView data={data} childId={childId} />}
    </Card>
  );
}

/* ---------- Kelola anggota ---------- */
function ManageMembers({ data, act }: any) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState(ICON_PRESETS[0]);

  return (
    <Card>
      <button onClick={() => setOpen(!open)} className="pk-btn" style={{ background: 'transparent', color: 'var(--color-ink)', padding: 0, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i className="ti ti-users-group" /> Kelola anggota ({data.children.length}/5)</span>
        <i className={`ti ${open ? 'ti-chevron-up' : 'ti-chevron-down'}`} />
      </button>
      {open && (
        <div style={{ marginTop: 12 }}>
          {data.children.map((c: any) => (
            <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-rule)' }}>
              {editing === c.id ? (
                <div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    {ICON_PRESETS.map((ic) => (
                      <button
                        key={ic}
                        onClick={() => act({ type: 'updateChild', payload: { id: c.id, patch: { icon: ic } } })}
                        style={{ fontSize: 18, width: 32, height: 32, borderRadius: 8, border: c.icon === ic ? '2px solid var(--color-accent)' : '1px solid var(--color-rule)', background: '#fff', cursor: 'pointer' }}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                  <Row2>
                    <input
                      defaultValue={c.name}
                      className="pk-input"
                      onBlur={(e) => act({ type: 'updateChild', payload: { id: c.id, patch: { name: e.target.value || c.name } } })}
                    />
                    <Select value={c.jenjang} onChange={(v: string) => act({ type: 'updateChild', payload: { id: c.id, patch: { jenjang: v } } })} options={[['SD', 'SD'], ['SMP', 'SMP'], ['SMA', 'SMA']]} />
                  </Row2>
                  <button className="pk-btn pk-btn-primary" style={{ marginTop: 6 }} onClick={() => setEditing(null)}>
                    <i className="ti ti-check" /> Selesai
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar child={c} size={30} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-neutral)' }}>{c.jenjang}</div>
                  </div>
                  <button className="pk-btn pk-btn-ghost" onClick={() => setEditing(c.id)}><i className="ti ti-pencil" /></button>
                  {data.children.length > 1 && (
                    <button
                      className="pk-btn pk-btn-ghost"
                      onClick={() => {
                        if (confirm(`Hapus ${c.name}? Semua jadwal dan tugas anak ini akan ikut terhapus.`)) {
                          act({ type: 'removeChild', payload: { id: c.id } });
                        }
                      }}
                    >
                      <i className="ti ti-trash" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {data.children.length < 5 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {ICON_PRESETS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setNewIcon(ic)}
                    style={{ fontSize: 18, width: 32, height: 32, borderRadius: 8, border: newIcon === ic ? '2px solid var(--color-accent)' : '1px solid var(--color-rule)', background: '#fff', cursor: 'pointer' }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
              <Row2>
                <input placeholder="Nama anggota baru" value={newName} onChange={(e) => setNewName(e.target.value)} className="pk-input" />
                <button
                  className="pk-btn pk-btn-primary"
                  onClick={() => {
                    if (!newName.trim()) return;
                    const usedColors = data.children.map((c: any) => c.color);
                    const color = [0, 1, 2, 3, 4].find((n) => !usedColors.includes(n)) ?? 0;
                    act({ type: 'addChild', payload: { id: uid(), name: newName.trim(), jenjang: 'SD', color, icon: newIcon } });
                    setNewName('');
                  }}
                >
                  <i className="ti ti-plus" /> Tambah
                </button>
              </Row2>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/* ---------- Profil anak (halaman penuh) ---------- */
function ChildProfile({ data, act, childId, onBack }: any) {
  const c = data.children.find((ch: any) => ch.id === childId);
  const [showPlanner, setShowPlanner] = useState(false);
  if (!c) return null;
  const col = COLORS[c.color];
  const myItems = data.items.filter((i: any) => i.childId === childId);
  const selesai = myItems.filter((i: any) => i.status === 'selesai').length;
  const belum = myItems.filter((i: any) => i.status !== 'selesai').length;
  const ujian = myItems.filter((i: any) => i.type === 'ujian').slice().sort((a: any, b: any) => a.dueDate.localeCompare(b.dueDate));

  const lesRoutines = data.routines.filter((r: any) => r.childId === childId && r.type === 'les');
  const lesGrouped: Record<string, any[]> = {};
  lesRoutines.forEach((r: any) => {
    const key = r.title.trim();
    if (!lesGrouped[key]) lesGrouped[key] = [];
    lesGrouped[key].push(r);
  });

  return (
    <>
      <button onClick={onBack} className="pk-btn" style={{ background: 'transparent', color: 'var(--color-neutral)', padding: '4px 0', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <i className="ti ti-arrow-left" /> Kembali ke ringkasan
      </button>

      <button
        onClick={() => setShowPlanner(!showPlanner)}
        className="pk-pill"
        style={{ marginBottom: 14, background: showPlanner ? 'var(--color-ink)' : '#fff', color: showPlanner ? '#fff' : 'var(--color-ink)' }}
      >
        <i className="ti ti-notebook" /> {showPlanner ? 'Tutup planner' : `Lihat planner ${c.name}`}
      </button>

      {showPlanner && <PlannerView data={data} act={act} childId={childId} />}

      {!showPlanner && (
      <>
      <Card>
        <div className="pk-dots" style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '-16px', padding: 16, borderRadius: 16 }}>
          <div className="pk-halo" style={{ width: 82, height: 82, borderRadius: '50%', ['--halo-color' as any]: col.bg }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: col.main, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: c.icon ? 30 : 26, fontWeight: 700 }}>
              {c.icon || c.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'Fraunces,serif', fontSize: 20, fontWeight: 600 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-neutral)' }}>{c.jenjang}</div>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{myItems.length}</div>
            <div style={{ fontSize: 11, color: 'var(--color-neutral)' }}>Total tugas</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#2A7A67' }}>{selesai}</div>
            <div style={{ fontSize: 11, color: 'var(--color-neutral)' }}>Selesai</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: belum > 0 ? '#B5791C' : 'var(--color-ink)' }}>{belum}</div>
            <div style={{ fontSize: 11, color: 'var(--color-neutral)' }}>Belum selesai</div>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-neutral)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Jadwal les</div>
        {Object.keys(lesGrouped).length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--color-neutral)' }}>Belum ada jadwal les tercatat.</div>
        ) : (
          Object.entries(lesGrouped).map(([title, rs]) => (
            <div key={title} style={{ padding: '9px 0', borderBottom: '1px solid var(--color-rule)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{title}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {rs
                  .slice()
                  .sort((a, b) => a.day - b.day)
                  .map((r: any) => (
                    <span key={r.id} style={{ fontSize: 11, background: col.bg, color: col.main, padding: '3px 8px', borderRadius: 999, fontWeight: 600 }}>
                      {DAYS_FULL[r.day]} {r.time}
                    </span>
                  ))}
              </div>
            </div>
          ))
        )}
      </Card>

      <Card>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-neutral)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Jadwal ujian</div>
        {ujian.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--color-neutral)' }}>Belum ada ujian tercatat.</div>
        ) : (
          ujian.map((i: any) => (
            <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--color-rule)' }}>
            <IconChip icon={TYPE_ICON.ujian} color={URGENT_COLOR} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{i.title}</div>
                <div style={{ fontSize: 11, color: 'var(--color-neutral)' }}>{i.dueDate}</div>
              </div>
              <i className={`ti ${STATUS_ICON[i.status]}`} style={{ color: i.status === 'selesai' ? '#2A7A67' : '#B5791C', fontSize: 18 }} />
            </div>
          ))
        )}
      </Card>
      </>
      )}
    </>
  );
}

function Donut({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, pct)) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-rule)" strokeWidth={5} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={`${filled} ${c}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function DensityCalendar({ data }: { data: any }) {
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const base = monthStart(new Date());
  base.setMonth(base.getMonth() + offset);
  const gridStart = weekStart(base);
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const todayISO = toISO(new Date());

  function countFor(iso: string, dow: number) {
    const { routines, items } = eventsForDate(data, iso, dow);
    return routines.length + items.length;
  }
  function densityStyle(count: number, inMonth: boolean) {
    if (!inMonth) return { background: 'transparent', color: 'var(--color-neutral)' };
    if (count === 0) return { background: 'var(--color-paper-2)', color: 'var(--color-ink)' };
    if (count <= 2) return { background: '#DCEEDD', color: '#2E6B45' };
    if (count <= 4) return { background: '#FBE7A6', color: '#8A6A06' };
    return { background: '#F5CBC6', color: 'var(--color-danger)' };
  }

  return (
    <Card>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-neutral)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Kepadatan aktivitas bulanan</div>
      <WeekNav offset={offset} setOffset={setOffset} label={base.toLocaleString('id-ID', { month: 'long', year: 'numeric' })} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
        {DAYS.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#68717D' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {cells.map((d) => {
          const iso = toISO(d);
          const inMonth = d.getMonth() === base.getMonth();
          const dow = d.getDay();
          const count = countFor(iso, dow);
          const style = densityStyle(count, inMonth);
          const isToday = iso === todayISO;
          const isSelected = iso === selected;
          return (
            <button
              key={iso}
              onClick={() => setSelected(isSelected ? null : iso)}
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                background: style.background,
                color: style.color,
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: isSelected ? '2px solid var(--color-accent)' : isToday ? '2px solid var(--color-ink)' : '2px solid transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: isToday ? 700 : 500 }}>{d.getDate()}</div>
              {inMonth && count > 0 && <div style={{ fontSize: 9, fontWeight: 600 }}>{count}</div>}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11, color: 'var(--color-neutral)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-paper-2)', display: 'inline-block' }} />Kosong</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#DCEEDD', display: 'inline-block' }} />Aman (1-2)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#FBE7A6', display: 'inline-block' }} />Sedang (3-4)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#F5CBC6', display: 'inline-block' }} />Padat (5+)</span>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-rule)', fontSize: 11, color: 'var(--color-neutral)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i className={`ti ${TYPE_ICON.sekolah}`} /> Sekolah</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i className={`ti ${TYPE_ICON.les}`} /> Les</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i className={`ti ${TYPE_ICON.jemput}`} /> Antar/jemput</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-danger)' }}><i className={`ti ${TYPE_ICON.ujian}`} /> Ujian/ulangan</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i className={`ti ${TYPE_ICON.tugas}`} /> Tugas</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i className={`ti ${TYPE_ICON.kebutuhan}`} /> Kebutuhan barang</span>
      </div>
      {selected && <DateDetail data={data} iso={selected} />}
    </Card>
  );
}

function ChildDayCard({ data, c, onOpen }: { data: any; c: any; onOpen: () => void }) {
  const col = COLORS[c.color];
  const today = new Date();
  const iso = toISO(today);
  const { routines, items } = eventsForDate(data, iso, today.getDay(), c.id);
  const rows = [...routines.map((r: any) => ({ kind: 'routine', ...r })), ...items.map((i: any) => ({ kind: 'item', ...i }))];
  const belum = data.items.filter((i: any) => i.childId === c.id && i.status !== 'selesai').length;

  return (
    <button
      onClick={onOpen}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: '#fff',
        border: '1px solid var(--color-rule)',
        borderLeft: `4px solid ${col.main}`,
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 10,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: rows.length ? 8 : 0 }}>
        <Avatar child={c} size={26} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
          <span style={{ fontSize: 11, color: 'var(--color-neutral)', marginLeft: 6 }}>{c.jenjang}</span>
        </div>
        {belum > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: '#B5791C' }}>{belum} belum selesai</span>}
        <i className="ti ti-chevron-right" style={{ color: 'var(--color-neutral)', fontSize: 16 }} />
      </div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--color-neutral)' }}>Tidak ada kegiatan hari ini.</div>
      ) : (
        rows.map((r: any) => {
          const urgent = r.type === 'ujian';
          return (
            <div key={r.kind + r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '3px 0', color: urgent ? 'var(--color-danger)' : 'var(--color-ink)', fontWeight: urgent ? 600 : 400 }}>
              <i className={`ti ${TYPE_ICON[r.type]}`} style={{ fontSize: 14 }} />
              <span>{r.title}</span>
              <span style={{ color: 'var(--color-neutral)', fontWeight: 400 }}>{r.kind === 'routine' ? r.time : ''}</span>
            </div>
          );
        })
      )}
    </button>
  );
}

/* ---------- Orang tua ---------- */
function OrtuView({ data, act }: any) {
  const [rt, setRt] = useState({ childId: data.children[0].id, day: 1, time: '', title: '', type: 'sekolah' });
  const [it, setIt] = useState({ childId: data.children[0].id, type: 'tugas', title: '', dueDate: '', neededItems: '' });
  const [showAdd, setShowAdd] = useState<'none' | 'jadwal' | 'tugas'>('none');
  const [viewingChild, setViewingChild] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  if (viewingChild) {
    return <ChildProfile data={data} act={act} childId={viewingChild} onBack={() => setViewingChild(null)} />;
  }

  const childStats = data.children.map((c: any) => {
    const myItems = data.items.filter((i: any) => i.childId === c.id);
    const selesai = myItems.filter((i: any) => i.status === 'selesai').length;
    const belum = myItems.filter((i: any) => i.status !== 'selesai').length;
    const kendala = myItems.filter((i: any) => i.note && i.status !== 'selesai').length;
    return { c, total: myItems.length, selesai, belum, kendala };
  });
  const mostNeeding = childStats.filter((s: any) => s.belum > 0).sort((a: any, b: any) => b.belum - a.belum)[0];

  return (
    <>
      <ManageMembers data={data} act={act} />

      {mostNeeding && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, minWidth: 38, borderRadius: '50%', background: '#F6ECD9', color: '#B5791C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <i className="ti ti-alert-triangle" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{mostNeeding.c.name} paling butuh perhatian</div>
              <div style={{ fontSize: 12, color: 'var(--color-neutral)' }}>{mostNeeding.belum} tugas belum selesai{mostNeeding.kendala > 0 ? `, ${mostNeeding.kendala} ada kendala` : ''}</div>
            </div>
            <button className="pk-btn pk-btn-ghost" onClick={() => setViewingChild(mostNeeding.c.id)}>
              Lihat <i className="ti ti-arrow-right" />
            </button>
          </div>
        </Card>
      )}

      <Card>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {childStats.map(({ c, total, selesai, belum, kendala }: any) => {
            const pct = total > 0 ? selesai / total : 0;
            return (
              <button
                key={c.id}
                onClick={() => setViewingChild(c.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <div style={{ position: 'relative', width: 56, height: 56 }}>
                  <Donut pct={pct} color={COLORS[c.color].main} size={56} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: c.icon ? 18 : 16, fontWeight: 700 }}>
                    {c.icon || c.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: belum > 0 ? '#B5791C' : '#2A7A67' }}>{selesai}/{total} selesai</span>
                {kendala > 0 && <i className="ti ti-alert-triangle" style={{ color: '#B3453F', fontSize: 13 }} title={`${kendala} ada kendala`} />}
              </button>
            );
          })}
        </div>
      </Card>

      <DensityCalendar data={data} />

      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-neutral)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Kegiatan hari ini per anak</div>
      {data.children.map((c: any) => (
        <ChildDayCard key={c.id} data={data} c={c} onOpen={() => setViewingChild(c.id)} />
      ))}

      <ScheduleBlock data={data} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setShowAdd(showAdd === 'jadwal' ? 'none' : 'jadwal')} className={`pk-pill${showAdd === 'jadwal' ? ' active' : ''}`}>
          <i className="ti ti-calendar-plus" /> Jadwal rutin
        </button>
        <button onClick={() => setShowAdd(showAdd === 'tugas' ? 'none' : 'tugas')} className={`pk-pill${showAdd === 'tugas' ? ' active' : ''}`}>
          <i className="ti ti-clipboard-plus" /> Tugas/ujian
        </button>
      </div>

      {showAdd === 'jadwal' && (
        <Card>
          <Row2>
            <Select value={rt.childId} onChange={(v) => setRt({ ...rt, childId: v })} options={data.children.map((c: any) => [c.id, `${c.icon ? c.icon + ' ' : ''}${c.name}`])} />
            <Select value={rt.day} onChange={(v) => setRt({ ...rt, day: Number(v) })} options={DAYS_FULL.map((d, i) => [i, d])} />
          </Row2>
          <Row2>
            <input type="time" value={rt.time} onChange={(e) => setRt({ ...rt, time: e.target.value })} className="pk-input" />
            <Select value={rt.type} onChange={(v) => setRt({ ...rt, type: v })} options={[['sekolah', 'Sekolah'], ['les', 'Les'], ['jemput', 'Antar/jemput']]} />
          </Row2>
          <input placeholder="Contoh: Les matematika" value={rt.title} onChange={(e) => setRt({ ...rt, title: e.target.value })} className="pk-input" style={{ marginBottom: 10 }} />
          <button
            className="pk-btn pk-btn-primary"
            onClick={() => {
              if (!rt.title || !rt.time) return;
              act({ type: 'addRoutine', payload: { id: uid(), ...rt } });
              setRt({ ...rt, title: '', time: '' });
            }}
          >
            <i className="ti ti-check" /> Simpan jadwal
          </button>
        </Card>
      )}

      {data.routines.length > 0 && (
        <Card>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-neutral)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Jadwal rutin tersimpan</div>
          {data.routines
            .slice()
            .sort((a: any, b: any) => a.day - b.day || a.time.localeCompare(b.time))
            .map((r: any) => {
              const c = data.children.find((c: any) => c.id === r.childId);
              if (!c) return null;
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--color-rule)' }}>
                  <IconChip icon={TYPE_ICON[r.type]} color={COLORS[c.color]} />
                  <Avatar child={c} size={22} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-neutral)' }}>{DAYS_FULL[r.day]} {r.time}</div>
                  </div>
                  <button className="pk-btn pk-btn-ghost" onClick={() => act({ type: 'deleteRoutine', payload: { id: r.id } })}><i className="ti ti-trash" /></button>
                </div>
              );
            })}
        </Card>
      )}

      {showAdd === 'tugas' && (
        <Card>
          <Row2>
            <Select value={it.childId} onChange={(v) => setIt({ ...it, childId: v })} options={data.children.map((c: any) => [c.id, `${c.icon ? c.icon + ' ' : ''}${c.name}`])} />
            <Select value={it.type} onChange={(v) => setIt({ ...it, type: v })} options={[['tugas', 'Tugas'], ['ujian', 'Ujian/ulangan'], ['kebutuhan', 'Kebutuhan barang']]} />
          </Row2>
          <input placeholder="Contoh: Ulangan IPA bab 3" value={it.title} onChange={(e) => setIt({ ...it, title: e.target.value })} className="pk-input" style={{ marginBottom: 10 }} />
          <Row2>
            <input type="date" value={it.dueDate} onChange={(e) => setIt({ ...it, dueDate: e.target.value })} className="pk-input" />
            <input placeholder="Barang diperlukan (opsional)" value={it.neededItems} onChange={(e) => setIt({ ...it, neededItems: e.target.value })} className="pk-input" />
          </Row2>
          <button
            className="pk-btn pk-btn-primary" style={{ marginTop: 10 }}
            onClick={() => {
              if (!it.title || !it.dueDate) return;
              act({ type: 'addItem', payload: { id: uid(), ...it, status: 'belum', note: '' } });
              setIt({ ...it, title: '', dueDate: '', neededItems: '' });
            }}
          >
            <i className="ti ti-check" /> Simpan
          </button>
        </Card>
      )}

      {data.items.length > 0 && (
        <Card>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#68717D', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Semua tugas & kebutuhan</div>
          {data.items.slice().sort((a: any, b: any) => a.dueDate.localeCompare(b.dueDate)).map((i: any) => {
            const c = data.children.find((c: any) => c.id === i.childId);
            if (!c) return null;
            const col = COLORS[c.color];
            const urgent = i.type === 'ujian';
            const isEditing = editingItem === i.id;
            return (
              <div key={i.id} style={{ padding: '9px 0', borderBottom: '1px solid #E4DFD3' }}>
                {isEditing ? (
                  <div>
                    <Row2>
                      <input defaultValue={i.title} className="pk-input" onBlur={(e) => act({ type: 'updateItem', payload: { id: i.id, patch: { title: e.target.value || i.title } } })} />
                      <Select value={i.type} onChange={(v: string) => act({ type: 'updateItem', payload: { id: i.id, patch: { type: v } } })} options={[['tugas', 'Tugas'], ['ujian', 'Ujian/ulangan'], ['kebutuhan', 'Kebutuhan barang']]} />
                    </Row2>
                    <Row2>
                      <input type="date" defaultValue={i.dueDate} className="pk-input" onBlur={(e) => act({ type: 'updateItem', payload: { id: i.id, patch: { dueDate: e.target.value || i.dueDate } } })} />
                      <input placeholder="Barang diperlukan (opsional)" defaultValue={i.neededItems} className="pk-input" onBlur={(e) => act({ type: 'updateItem', payload: { id: i.id, patch: { neededItems: e.target.value } } })} />
                    </Row2>
                    <button className="pk-btn pk-btn-primary" onClick={() => setEditingItem(null)}><i className="ti ti-check" /> Selesai edit</button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <IconChip icon={TYPE_ICON[i.type]} color={typeColor(i.type, col)} />
                      <Avatar child={c} size={22} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: urgent ? 'var(--color-danger)' : 'var(--color-ink)', fontWeight: urgent ? 600 : 400 }}>{i.title} <span style={{ color: '#68717D', fontSize: 11, fontWeight: 400 }}>({i.dueDate})</span></div>
                        {i.note && <div style={{ color: '#B3453F', fontSize: 11 }}><i className="ti ti-alert-circle" /> {i.note}</div>}
                      </div>
                      <button className="pk-btn pk-btn-ghost" onClick={() => setEditingItem(i.id)}><i className="ti ti-pencil" /></button>
                      <button className="pk-btn pk-btn-ghost" onClick={() => act({ type: 'deleteItem', payload: { id: i.id } })}><i className="ti ti-trash" /></button>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginLeft: 40 }}>
                      {['belum', 'sedang', 'selesai'].map((val) => (
                        <button
                          key={val}
                          onClick={() => act({ type: 'updateItem', payload: { id: i.id, patch: { status: val } } })}
                          className={`pk-status-btn${i.status === val && val === 'selesai' ? ' pk-celebrate' : ''}`}
                          style={{ background: i.status === val ? col.main : '#fff', color: i.status === val ? '#fff' : 'var(--color-neutral)', padding: '6px 4px' }}
                        >
                          <i className={`ti ${STATUS_ICON[val]}`} style={{ fontSize: 14 }} />
                          <span style={{ fontSize: 9, fontWeight: 600 }}>{val === 'belum' ? 'Belum' : val === 'sedang' ? 'Proses' : 'Selesai'}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </>
  );
}

const CHEER_SEDANG = [
  'Semangat ya, sedikit lagi selesai! 💪',
  'Yuk lanjutkan, kamu pasti bisa! 🌟',
  'Terus kerjakan, kamu hebat! 🚀',
  'Sabar dan semangat, kamu keren! 🔥',
  'Ayo sedikit lagi, jangan menyerah! ✨',
];
const CHEER_SELESAI = [
  'Keren! Tugas ini selesai! 🎉',
  'Hebat sekali, kerja bagus! 🏆',
  'Mantap! Satu tugas lagi beres! ⭐',
  'Kamu luar biasa hari ini! 🎊',
  'Selamat! Kamu berhasil! 🙌',
];
function pickCheer(id: string, pool: string[]) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return pool[hash % pool.length];
}

/* ---------- Mode Planner ---------- */
function PlannerView({ data, act, childId }: { data: any; act: any; childId: string }) {
  const c = data.children.find((c: any) => c.id === childId);
  const [mode, setMode] = useState<'harian' | 'mingguan'>('harian');
  const [offset, setOffset] = useState(0);
  if (!c) return null;
  const col = COLORS[c.color];

  return (
    <div>
      <div style={{ display: 'flex', background: '#EFEBE1', borderRadius: 999, padding: 4, marginBottom: 14, gap: 4 }}>
        {(['harian', 'mingguan'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: '9px 6px',
              borderRadius: 999,
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: mode === m ? '#242B35' : 'transparent',
              color: mode === m ? '#fff' : '#68717D',
            }}
          >
            {m === 'harian' ? 'Planner harian' : 'Planner mingguan'}
          </button>
        ))}
      </div>
      {mode === 'harian' ? <DailyPlanner data={data} act={act} c={c} col={col} /> : <WeeklyPlanner data={data} act={act} c={c} col={col} offset={offset} setOffset={setOffset} />}
    </div>
  );
}

function PlannerChecklistItem({ item, act, col }: { item: any; act: any; col: any }) {
  const order = ['belum', 'sedang', 'selesai'];
  const next = order[(order.indexOf(item.status) + 1) % 3];
  const urgent = item.type === 'ujian';
  return (
    <button
      onClick={() => act({ type: 'updateItem', payload: { id: item.id, patch: { status: next } } })}
      className={item.status === 'selesai' ? 'pk-celebrate' : ''}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '7px 0', fontFamily: 'inherit' }}
    >
      <i className={`ti ${STATUS_ICON[item.status]}`} style={{ fontSize: 18, color: item.status === 'selesai' ? col.main : urgent ? 'var(--color-danger)' : 'var(--color-neutral)' }} />
      <span style={{ fontSize: 13, textDecoration: item.status === 'selesai' ? 'line-through' : 'none', color: urgent && item.status !== 'selesai' ? 'var(--color-danger)' : 'var(--color-ink)', fontWeight: urgent ? 600 : 400 }}>{item.title}</span>
      {item.neededItems && <span style={{ fontSize: 11, color: 'var(--color-neutral)' }}>· {item.neededItems}</span>}
    </button>
  );
}

function GroupedChecklist({ items, act, col }: { items: any[]; act: any; col: any }) {
  const ujian = items.filter((i) => i.type === 'ujian');
  const tugas = items.filter((i) => i.type === 'tugas');
  const kebutuhan = items.filter((i) => i.type === 'kebutuhan');
  return (
    <>
      {ujian.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-danger)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="ti ti-clipboard-text" /> Ujian &amp; ulangan
          </div>
          {ujian.map((i) => <PlannerChecklistItem key={i.id} item={i} act={act} col={col} />)}
        </div>
      )}
      {tugas.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-neutral)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="ti ti-pencil" /> Tugas
          </div>
          {tugas.map((i) => <PlannerChecklistItem key={i.id} item={i} act={act} col={col} />)}
        </div>
      )}
      {kebutuhan.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-neutral)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="ti ti-shopping-bag" /> Kebutuhan barang
          </div>
          {kebutuhan.map((i) => <PlannerChecklistItem key={i.id} item={i} act={act} col={col} />)}
        </div>
      )}
    </>
  );
}

function DailyPlanner({ data, act, c, col }: { data: any; act: any; c: any; col: any }) {
  const today = new Date();
  const iso = toISO(today);
  const { routines, items } = eventsForDate(data, iso, today.getDay(), c.id);
  const label = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="pk-dots" style={{ background: '#fff', border: '1px solid var(--color-rule)', borderRadius: 16, padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Avatar child={c} size={36} />
        <div>
          <div style={{ fontFamily: 'Fraunces,serif', fontSize: 16, fontWeight: 600 }}>Planner {c.name}</div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral)' }}>{label}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-neutral)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Sekolah &amp; les</div>
      {routines.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--color-neutral)', marginBottom: 14 }}>Tidak ada jadwal rutin hari ini.</div>
      ) : (
        <div style={{ marginBottom: 14 }}>
          {routines.map((r: any) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--color-rule)', fontSize: 13 }}>
              <i className={`ti ${TYPE_ICON[r.type]}`} style={{ fontSize: 16 }} />
              <span style={{ flex: 1 }}>{r.title}</span>
              <span style={{ color: 'var(--color-neutral)', fontSize: 12 }}>{r.time}</span>
            </div>
          ))}
        </div>
      )}
      {items.length === 0 ? (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-neutral)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Tugas hari ini</div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral)' }}>Tidak ada tugas jatuh tempo hari ini.</div>
        </>
      ) : (
        <GroupedChecklist items={items} act={act} col={col} />
      )}
    </div>
  );
}

function WeeklyPlanner({ data, act, c, col, offset, setOffset }: { data: any; act: any; c: any; col: any; offset: number; setOffset: (n: number) => void }) {
  const start = weekStart(new Date());
  start.setDate(start.getDate() + offset * 7);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="pk-dots" style={{ background: '#fff', border: '1px solid var(--color-rule)', borderRadius: 16, padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Avatar child={c} size={36} />
        <div>
          <div style={{ fontFamily: 'Fraunces,serif', fontSize: 16, fontWeight: 600 }}>Planner {c.name}</div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral)' }}>{days[0].getDate()} - {days[6].getDate()} {days[6].toLocaleString('id-ID', { month: 'long' })}</div>
        </div>
      </div>
      <WeekNav offset={offset} setOffset={setOffset} label="" />
      {days.map((d) => {
        const iso = toISO(d);
        const { routines, items } = eventsForDate(data, iso, d.getDay(), c.id);
        if (routines.length === 0 && items.length === 0) return null;
        return (
          <div key={iso} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--color-rule)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{DAYS_FULL[d.getDay()]} {d.getDate()}</div>
            {routines.map((r: any) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '3px 0', color: 'var(--color-neutral)' }}>
                <i className={`ti ${TYPE_ICON[r.type]}`} style={{ fontSize: 14 }} /> {r.title} · {r.time}
              </div>
            ))}
            <GroupedChecklist items={items} act={act} col={col} />
          </div>
        );
      })}
      {days.every((d) => {
        const iso = toISO(d);
        const { routines, items } = eventsForDate(data, iso, d.getDay(), c.id);
        return routines.length === 0 && items.length === 0;
      }) && <div style={{ fontSize: 12, color: 'var(--color-neutral)' }}>Tidak ada kegiatan minggu ini.</div>}
    </div>
  );
}

/* ---------- Anak ---------- */
function AnakView({ data, act, childId }: any) {
  const c = data.children.find((c: any) => c.id === childId);
  const [viewMode, setViewMode] = useState<'papan' | 'planner'>('papan');
  if (!c) return null;
  const col = COLORS[c.color];
  const myItems = data.items.filter((i: any) => i.childId === childId).slice().sort((a: any, b: any) => a.dueDate.localeCompare(b.dueDate));
  const allDone = myItems.length > 0 && myItems.every((i: any) => i.status === 'selesai');

  return (
    <>
      <div style={{ display: 'flex', background: '#EFEBE1', borderRadius: 999, padding: 4, marginBottom: 14, gap: 4 }}>
        {(['papan', 'planner'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            style={{ flex: 1, padding: '9px 6px', borderRadius: 999, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: viewMode === m ? '#242B35' : 'transparent', color: viewMode === m ? '#fff' : '#68717D' }}
          >
            <i className={`ti ${m === 'papan' ? 'ti-layout-dashboard' : 'ti-notebook'}`} /> {m === 'papan' ? 'Papan' : 'Planner'}
          </button>
        ))}
      </div>
      {viewMode === 'planner' ? (
        <PlannerView data={data} act={act} childId={childId} />
      ) : (
        <>
      <ScheduleBlock data={data} childId={childId} />
      {allDone && (
        <Card>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <i className="ti ti-trophy pk-celebrate" style={{ fontSize: 30, color: col.main }} />
            <div style={{ fontFamily: 'Fraunces,serif', fontSize: 16, fontWeight: 600, marginTop: 6 }}>Semua tugasmu sudah selesai!</div>
            <div style={{ fontSize: 12, color: 'var(--color-neutral)', marginTop: 2 }}>Kamu hebat hari ini, {c.name}! 🎉</div>
          </div>
        </Card>
      )}
      <Card>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#68717D', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Tugas & ujianku</div>
        {myItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#68717D' }}>
            <i className="ti ti-confetti" style={{ fontSize: 28 }} />
            <div style={{ fontSize: 13, marginTop: 6 }}>Belum ada tugas tercatat.</div>
          </div>
        )}
        {myItems.map((i: any) => (
          <div key={i.id} style={{ padding: '12px 0', borderBottom: '1px solid #E4DFD3' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <IconChip icon={typeColor(i.type, col) === URGENT_COLOR ? TYPE_ICON[i.type] : TYPE_ICON[i.type]} color={typeColor(i.type, col)} />
              <div style={{ fontSize: 14, fontWeight: 500, color: i.type === 'ujian' ? 'var(--color-danger)' : 'var(--color-ink)' }}>{i.title}</div>
            </div>
            <div style={{ fontSize: 11, color: '#68717D', marginBottom: 8, marginLeft: 40 }}>{i.dueDate}{i.neededItems ? ' · siapkan: ' + i.neededItems : ''}</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              {['belum', 'sedang', 'selesai'].map((val) => (
                <button
                  key={val}
                  onClick={() => act({ type: 'updateItem', payload: { id: i.id, patch: { status: val } } })}
                  className={`pk-status-btn${i.status === val && val === 'selesai' ? ' pk-celebrate' : ''}`}
                  style={{
                    background: i.status === val ? col.main : '#fff',
                    color: i.status === val ? '#fff' : 'var(--color-neutral)',
                  }}
                >
                  <i className={`ti ${STATUS_ICON[val]}`} style={{ fontSize: 18 }} />
                  <span style={{ fontSize: 10, fontWeight: 600 }}>{val === 'belum' ? 'Belum' : val === 'sedang' ? 'Proses' : 'Selesai'}</span>
                </button>
              ))}
            </div>
            {i.status === 'sedang' && (
              <div className="pk-fade-in" style={{ fontSize: 12, color: '#B5791C', fontWeight: 600, marginBottom: 6 }}>{pickCheer(i.id, CHEER_SEDANG)}</div>
            )}
            {i.status === 'selesai' && (
              <div className="pk-fade-in" style={{ fontSize: 12, color: '#2A7A67', fontWeight: 600, marginBottom: 6 }}>{pickCheer(i.id, CHEER_SELESAI)}</div>
            )}
            <input
              placeholder="Ada kendala? Tulis di sini (opsional)"
              defaultValue={i.note || ''}
              onBlur={(e) => act({ type: 'updateItem', payload: { id: i.id, patch: { note: e.target.value } } })}
              className="pk-input"
            />
          </div>
        ))}
      </Card>
        </>
      )}
    </>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div className="pk-row2">{children}</div>;
}
function Select({ value, onChange, options }: any) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="pk-input">
      {options.map(([v, l]: any) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  );
}


