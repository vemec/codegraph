export class DatabasePool {
  connect(): string {
    return 'connected';
  }
}

export function makePool(): DatabasePool {
  return new DatabasePool();
}
