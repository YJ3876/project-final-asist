import { Redis } from '@upstash/redis';

function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('Redis belum terhubung: KV_REST_API_URL / KV_REST_API_TOKEN tidak ditemukan.');
  }
  return new Redis({ url, token });
}

const KEY = 'family-data-v1';

export type Child = { id: string; name: string; jenjang: string; color: number; icon?: string };
export type Routine = { id: string; childId: string; day: number; time: string; title: string; type: 'sekolah' | 'les' | 'jemput' };
export type Item = {
  id: string;
  childId: string;
  type: 'tugas' | 'ujian' | 'kebutuhan';
  title: string;
  dueDate: string;
  neededItems: string;
  status: 'belum' | 'sedang' | 'selesai';
  note: string;
  completedAt?: string;
};
export type FamilyData = { children: Child[]; routines: Routine[]; items: Item[] };

function defaultData(): FamilyData {
  return {
    children: [
      { id: 'c1', name: 'Anak 1', jenjang: 'SD', color: 0 },
      { id: 'c2', name: 'Anak 2', jenjang: 'SD', color: 1 },
      { id: 'c3', name: 'Anak 3', jenjang: 'SMP', color: 2 },
    ],
    routines: [],
    items: [],
  };
}

export async function getData(): Promise<FamilyData> {
  const redis = getRedis();
  const data = await redis.get<FamilyData>(KEY);
  if (data) return data;
  const fresh = defaultData();
  await redis.set(KEY, fresh);
  return fresh;
}

export async function setData(data: FamilyData) {
  const redis = getRedis();
  await redis.set(KEY, data);
}
