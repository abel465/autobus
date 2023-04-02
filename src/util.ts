export enum SelectedSource {
  None,
  Deck,
  Hand,
  Table,
}

export const sleep = (sleep_ms: number) =>
  new Promise((resolve) => setTimeout(resolve, sleep_ms))

export function shuffleArray<T>(array: T[]): T[] {
  for (let i: number = array.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function debounce_leading(func: Function, timeout: number){
  let timer: NodeJS.Timeout | undefined = undefined;
  return function (this: any, ...args: any[]) {
    if (!timer) {
      func.apply(this, args);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
    }, timeout);
  };
}

