export interface PublicUser {
  id: string;
  google_id: string | null;
  email: string;
  name: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface UpsertPublicUserInput {
  googleId?: string | null;
  email: string;
  name?: string | null;
  image?: string | null;
}
