// lib/cache.ts
// 💡 Supabase 요청 횟수를 줄이기 위한 간단한 클라이언트 캐시입니다.
// 같은 데이터를 TTL(유효시간) 안에 또 요청하면, 네트워크 대신 저장해둔 값을 돌려줍니다.
// - 메모리(Map): 같은 화면 안에서 즉시 재사용
// - sessionStorage: 페이지 이동/새로고침에도 유지 (브라우저 탭을 닫으면 사라짐)

type CacheEntry<T> = { value: T; expires: number };

const memoryCache = new Map<string, CacheEntry<unknown>>();

// 같은 키로 요청이 "동시에" 두 번 들어오면(예: React가 개발 모드에서 effect를 두 번 실행)
// 실제 네트워크 요청은 한 번만 나가도록 진행 중인 Promise를 공유합니다.
const inflight = new Map<string, Promise<unknown>>();

function readStorage<T>(key: string): CacheEntry<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`cache:${key}`);
    return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, entry: CacheEntry<T>) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`cache:${key}`, JSON.stringify(entry));
  } catch {
    // 저장 공간이 가득 차도 앱은 정상 동작해야 하므로 조용히 무시합니다.
  }
}

/**
 * key: 캐시를 구분하는 이름 (예: 'players:team:빵빵이의 축구교실')
 * ttlMs: 캐시 유효시간 (밀리초). 이 시간이 지나면 다시 서버에 요청합니다.
 * fetcher: 캐시가 없거나 만료됐을 때 실제로 데이터를 가져오는 함수
 */
export async function cachedQuery<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();

  const mem = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (mem && mem.expires > now) return mem.value;

  const stored = readStorage<T>(key);
  if (stored && stored.expires > now) {
    memoryCache.set(key, stored);
    return stored.value;
  }

  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const promise = fetcher()
    .then((value) => {
      const entry: CacheEntry<T> = { value, expires: Date.now() + ttlMs };
      memoryCache.set(key, entry);
      writeStorage(key, entry);
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

// 평점 등록/투표 직후처럼 캐시를 강제로 비우고 최신 데이터를 받아야 할 때 사용합니다.
// prefix로 시작하는 모든 캐시가 지워집니다. (예: invalidateCache('ratings:') → 모든 평점 캐시 삭제)
export function invalidateCache(prefix: string) {
  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(prefix)) memoryCache.delete(key);
  }
  if (typeof window === 'undefined') return;
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(`cache:${prefix}`)) sessionStorage.removeItem(k);
    }
  } catch {
    // 접근 불가 환경에서도 앱이 죽지 않도록 무시
  }
}

// 📸 사진이 없는 선수를 기억해두는 캐시입니다.
// 한 번 "사진 없음"으로 확인된 선수는 페이지를 다시 열어도 불필요한 이미지 요청을 보내지 않습니다.
const MISSING_PHOTOS_KEY = 'cache:missing-photos';

function readMissingPhotos(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(sessionStorage.getItem(MISSING_PHOTOS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function isPhotoMissing(playerId: string | number): boolean {
  return readMissingPhotos().includes(String(playerId));
}

export function markPhotoMissing(playerId: string | number) {
  if (typeof window === 'undefined') return;
  try {
    const list = readMissingPhotos();
    if (!list.includes(String(playerId))) {
      list.push(String(playerId));
      sessionStorage.setItem(MISSING_PHOTOS_KEY, JSON.stringify(list));
    }
  } catch {
    // 무시
  }
}
