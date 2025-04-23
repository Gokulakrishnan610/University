export type User =  {
    id: number;
    email: string;
    name: string | null;
    isVerified: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Types
export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
  }
  
  export interface PasswordResetRequest {
    email: string;
  }
  
  export interface ResetPasswordRequest {
    password: string;
  }
  
  export interface ResendVerificationRequest {
    email: string;
  }
  