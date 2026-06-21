export interface Identifiable {
  id(): string;
}

export class BaseUser implements Identifiable {
  id(): string {
    return 'base';
  }
}

export class Admin extends BaseUser {
  role(): string {
    return 'admin';
  }
}
