export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  roles?: string[];
  iat?: number; // issued at (optional, from JWT)
  exp?: number; // expiration (optional, from JWT)
}
