import type { Request } from 'express';

export interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
}

export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}
