export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  accessToken: string;
  refreshToken?: string;
}
