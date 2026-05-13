import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Gamemode } from './types';

const KEY = 'footyguru.gamemode.v1';

const storage = {
  get: (k: string) => (Platform.OS === 'web' ? AsyncStorage.getItem(k) : SecureStore.getItemAsync(k)),
  set: (k: string, v: string) =>
    Platform.OS === 'web' ? AsyncStorage.setItem(k, v) : SecureStore.setItemAsync(k, v),
};

const VALID_GAMEMODES: ReadonlySet<Gamemode> = new Set([
  'premier-league',
  'world-cup',
  'champions-league',
]);

export async function loadGamemode(): Promise<Gamemode | null> {
  try {
    const raw = await storage.get(KEY);
    if (raw && VALID_GAMEMODES.has(raw as Gamemode)) return raw as Gamemode;
    return null;
  } catch {
    return null;
  }
}

export async function saveGamemode(g: Gamemode): Promise<void> {
  await storage.set(KEY, g);
}
