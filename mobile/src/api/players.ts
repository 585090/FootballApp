import { api } from './client';

export interface PlayerSession {
  id: string;
  email: string;
  name: string;
  token: string;
  points?: number;
}

interface ApiPlayer {
  id: string;
  email: string;
  name: string;
  points?: number;
}

interface AuthResponse {
  message: string;
  token: string;
  player: ApiPlayer;
}

interface ProfileResponse {
  message: string;
  player: ApiPlayer;
}

function toSession(p: ApiPlayer, token: string): PlayerSession {
  return { id: String(p.id), email: p.email, name: p.name, token, points: p.points };
}

export async function signUp(name: string, email: string, password: string): Promise<PlayerSession> {
  const data = await api.post<AuthResponse>('/api/players/signup', {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  });
  return toSession(data.player, data.token);
}

export async function signIn(email: string, password: string): Promise<PlayerSession> {
  const data = await api.post<AuthResponse>('/api/players/login', {
    email: email.trim().toLowerCase(),
    password,
  });
  return toSession(data.player, data.token);
}

export async function updateProfile(name: string): Promise<ApiPlayer> {
  const data = await api.put<ProfileResponse>('/api/players/profile', {
    name: name.trim(),
  });
  return data.player;
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.put('/api/players/password', {
    currentPassword,
    newPassword,
  });
}
