export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    role: 'contributor' | 'maintainer';
    created_at: string;
    updated_at: string;
  }
  
  export interface JWTPayload {
    id: number;
    name: string;
    role: string;
  }
  
  export interface AuthRequest {
    name?: string;
    email: string;
    password: string;
    role?: string;
  }