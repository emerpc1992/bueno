import { User, LoginCredentials } from '../types/auth';

let VALID_CREDENTIALS = {
  super: { username: 'admin', password: 'admin', role: 'admin' as const },
  admin: { username: 'admin', password: 'admin', role: 'admin' as const },
  vendor: { username: 'admin', password: 'admin', role: 'vendor' as const },
};

export interface Credentials {
  username: string;
  password: string;
  confirmPassword?: string;
}

export const updateCredentials = (
  role: 'admin' | 'vendor',
  newCredentials: { username: string; password: string }
) => {
  if (role === 'admin') {
    VALID_CREDENTIALS.admin = {
      ...VALID_CREDENTIALS.admin,
      username: newCredentials.username,
      password: newCredentials.password,
    };
  } else {
    VALID_CREDENTIALS.vendor = {
      ...VALID_CREDENTIALS.vendor,
      username: newCredentials.username,
      password: newCredentials.password,
    };
  }
};

export const authenticateUser = (credentials: LoginCredentials): User | null => {
  // Check super user first
  if (
    credentials.username === VALID_CREDENTIALS.super.username &&
    credentials.password === VALID_CREDENTIALS.super.password
  ) {
    return { username: VALID_CREDENTIALS.super.username, role: VALID_CREDENTIALS.super.role };
  }

  if (
    credentials.username === VALID_CREDENTIALS.admin.username &&
    credentials.password === VALID_CREDENTIALS.admin.password
  ) {
    return { username: VALID_CREDENTIALS.admin.username, role: VALID_CREDENTIALS.admin.role };
  }

  if (
    credentials.username === VALID_CREDENTIALS.vendor.username &&
    credentials.password === VALID_CREDENTIALS.vendor.password
  ) {
    return { username: VALID_CREDENTIALS.vendor.username, role: VALID_CREDENTIALS.vendor.role };
  }

  return null;
};