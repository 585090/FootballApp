import { api } from './client';

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  points: number;
}

export const leaderboardApi = {
  top: (limit = 50, gamemode?: number) =>
    api.get<LeaderboardEntry[]>('/api/players/leaderboard', { limit, gamemode }),
};
