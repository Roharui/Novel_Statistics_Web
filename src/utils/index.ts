import { Transform } from 'class-transformer';

export function Percent() {
  return Transform(({ value }) => parseFloat((value * 100).toFixed(2)));
}

export function Round() {
  return Transform(({ value }) => parseFloat(value.toFixed(2)));
}

export function getExpireDate(updatedAt: Date): number {
  const dayPlus1 = updatedAt;
  dayPlus1.setDate(dayPlus1.getDate() + 1);
  const expireSecond =
    Math.floor((dayPlus1.getTime() - getKRDate().getTime()) / 1000) - 60 * 60;
  return expireSecond < 0 ? 60 * 60 : expireSecond;
}

export function getKRDate() {
  // 1. 현재 시간(Locale)
  const curr = new Date();

  // 2. UTC 시간 계산
  const utc = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;

  // 3. UTC to KST (UTC + 9시간)
  const KR_TIME_DIFF = 9 * 60 * 60 * 1000; //한국 시간(KST)은 UTC시간보다 9시간 더 빠르므로 9시간을 밀리초 단위로 변환.
  return new Date(utc + KR_TIME_DIFF);
}

export function MergeRecursive(obj1, obj2) {
  for (const p in obj2) {
    try {
      // Property in destination object set; update its value.
      if (obj2[p].constructor == Object) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p]);
      } else {
        obj1[p] = obj2[p];
      }
    } catch (e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];
    }
  }
  return obj1;
}
