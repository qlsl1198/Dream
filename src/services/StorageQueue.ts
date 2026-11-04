/** Serializes read-modify-write operations so rapid saves never lose a record. */
let tail: Promise<unknown> = Promise.resolve();
export function withStorageLock<T>(operation: () => Promise<T>): Promise<T> {
  const next = tail.then(operation, operation);
  tail = next.catch(() => {});
  return next;
}
