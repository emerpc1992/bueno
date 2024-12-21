export interface User {
  username: string;
  role: 'admin' | 'vendor';
}

export interface LoginCredentials {
  username: string;
  password: string;