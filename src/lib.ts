export function selectRandom<T>(arr: T[]): T {
  return arr[Math.trunc(Math.random() * arr.length)]!;
}

export function percent(num: number) {
  return `${(num * 100).toFixed(3)}%`;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
