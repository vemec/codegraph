import { makePool } from './db';
import { Admin } from './models';

export function login(): string {
  const pool = makePool();
  const conn = pool.connect();
  const admin = new Admin();
  return conn + admin.role();
}
