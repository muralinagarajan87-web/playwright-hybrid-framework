export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthSuccessResponse {
  token: string;
}

export interface AuthFailureResponse {
  reason: string;
}

export type AuthResponse = AuthSuccessResponse | AuthFailureResponse;
