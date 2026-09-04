export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  admin: Admin;
}
