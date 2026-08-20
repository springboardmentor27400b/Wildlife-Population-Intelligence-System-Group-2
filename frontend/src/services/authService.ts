import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  username: string;
  email: string;
  password: string;
  role_id: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface CurrentUser {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role_id: number;
  is_active: boolean;
}

export async function login(data: LoginRequest) {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  return response.data;
}

export async function register(data: RegisterRequest) {
  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
}

export async function getCurrentUser(token: string) {
  const response = await api.get<CurrentUser>(
    "/auth/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}