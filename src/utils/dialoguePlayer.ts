export function dialogueDelay(character: string): number {
  return /[.!?。！？]/u.test(character) ? 220 : /[,，]/u.test(character) ? 110 : 34;
}

// Keep timers outside React so typing can be tested with a deterministic clock.
export function createDialoguePlayer(text: string, onText: (text: string) => void, onDone: () => void,
  schedule: (callback: () => void, delay: number) => ReturnType<typeof setTimeout> = setTimeout,
  cancel: (timer: ReturnType<typeof setTimeout>) => void = clearTimeout) {
  const characters = Array.from(text);
  let count = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let done = false;
  const stop = () => { if (timer !== undefined) cancel(timer); timer = undefined; };
  const complete = () => { if (!done) { done = true; onDone(); } };
  const tick = () => {
    timer = undefined;
    count = Math.min(count + 1, characters.length);
    onText(characters.slice(0, count).join(''));
    if (count === characters.length) complete();
    else timer = schedule(tick, dialogueDelay(characters[count - 1]));
  };
  return {
    start() {
      if (done || timer !== undefined) return;
      if (!characters.length) { complete(); return; }
      timer = schedule(tick, 100);
    },
    reveal() {
      const wasTyping = !done;
      stop(); count = characters.length;
      onText(text); complete();
      return wasTyping;
    },
    stop,
  };
}
