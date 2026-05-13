import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'footyguru.session.v1';

export interface Session {
  id: string;
  email: string;
  name: string;
  token: string;
}

const storage = {
  get: (key: string) =>
    Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key),
  set: (key: string, value: string) =>
    Platform.OS === 'web' ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value),
  remove: (key: string) =>
    Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key),
};

export async function getSession(): Promise<Session | null> {
  try {
    const raw = await storage.get(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    // Reject pre-token sessions so users are forced to re-authenticate after
    // the auth upgrade. Without a token, every API call would 401 anyway.
    if (!parsed.token) return null;
    return parsed as Session;
  } catch {
    return null;
  }
}

export async function setSession(session: Session): Promise<void> {
  await storage.set(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await storage.remove(SESSION_KEY);
}
