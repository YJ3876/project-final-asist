import { NextResponse } from 'next/server';
import { getData, setData, FamilyData } from '../../../lib/kv';

export async function GET() {
  try {
    const data = await getData();
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'storage_not_configured', message: String(e) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const action = await req.json();
    const data = await getData();
    applyAction(data, action);
    await setData(data);
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

function applyAction(data: FamilyData, action: any) {
  switch (action.type) {
    case 'addRoutine':
      data.routines.push(action.payload);
      break;
    case 'deleteRoutine':
      data.routines = data.routines.filter((r) => r.id !== action.payload.id);
      break;
    case 'addItem':
      data.items.push(action.payload);
      break;
    case 'updateItem': {
      const it = data.items.find((i) => i.id === action.payload.id);
      if (it) {
        Object.assign(it, action.payload.patch);
        if (action.payload.patch.status === 'selesai') {
          it.completedAt = new Date().toISOString();
        } else if (action.payload.patch.status) {
          delete it.completedAt;
        }
      }
      break;
    }
    case 'deleteItem':
      data.items = data.items.filter((i) => i.id !== action.payload.id);
      break;
    case 'updateChild': {
      const c = data.children.find((c) => c.id === action.payload.id);
      if (c) Object.assign(c, action.payload.patch);
      break;
    }
    case 'addChild': {
      if (data.children.length < 5) {
        data.children.push(action.payload);
      }
      break;
    }
    case 'removeChild': {
      const id = action.payload.id;
      if (data.children.length > 1) {
        data.children = data.children.filter((c) => c.id !== id);
        data.routines = data.routines.filter((r) => r.childId !== id);
        data.items = data.items.filter((i) => i.childId !== id);
      }
      break;
    }
    default:
      break;
  }
}
