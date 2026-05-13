import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'footyguru.wc.groupPredictions.v1';

/** Map of WC group code (e.g. "GROUP_A") → ordered list of team ids the user predicts will finish 1st..4th. */
export type GroupPredictions = Record<string, number[]>;

const storage = {
  get: (k: string) => (Platform.OS === 'web' ? AsyncStorage.getItem(k) : SecureStore.getItemAsync(k)),
  set: (k: string, v: string) =>
    Platform.OS === 'web' ? AsyncStorage.setItem(k, v) : SecureStore.setItemAsync(k, v),
};

export async function loadGroupPredictions(): Promise<GroupPredictions> {
  try {
    const raw = await storage.get(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as GroupPredictions) : {};
  } catch {
    return {};
  }
}

export async function saveGroupPredictions(value: GroupPredictions): Promise<void> {
  await storage.set(KEY, JSON.stringify(value));
}
