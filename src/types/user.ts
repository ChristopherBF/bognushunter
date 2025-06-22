// src/types/user.ts

export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  [key: string]: any;
}
