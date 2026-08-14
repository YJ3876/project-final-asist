import { NextResponse } from 'next/server';
import { getData, setData } from '../../../lib/kv';

export async function GET() {
  try {
    const data = await getData();
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const before = data.items.length;
    data.items = data.items.filter((i) => {
      if (i.status !== 'selesai') return true;
      if (!i.completedAt) return true;
      return new Date(i.completedAt).getTime() >= cutoff;
    });
    await setData(data);
    return NextResponse.json({ ok: true, removed: before - data.items.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
