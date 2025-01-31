export function selectRandom<T>(arr: T[]): T {
  return arr[Math.trunc(Math.random() * arr.length)]!;
}

export function percent(num: number) {
  return `${(num * 100).toFixed(3)}%`;
}

export type DelayFn = typeof delay;
export type DelayInterruptible = DelayFn & { interrupt(): void };

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function delayInterruptible(): DelayInterruptible {
  let interrupt: () => void;

  const interruptPromise = new Promise<void>((_, reject) => {
    interrupt = () => {
      reject();
    };
  });

  const retval = async (ms: number) => {
    await Promise.race([interruptPromise, delay(ms)]);
  };
  retval.interrupt = interrupt!;

  return retval;
}
