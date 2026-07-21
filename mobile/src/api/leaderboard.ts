import { api } from './client';

export interface ScoreBreakdown {
  match: number;
  groupStandings: number;
  topScorer: number;
  topThree: number;
  total: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  points: number;
  pointsBreakdown?: ScoreBreakdown;
}

export const leaderboardApi = {
  top: (limit = 50, gamemode?: number) =>
    api.get<LeaderboardEntry[]>('/api/players/leaderboard', { limit, gamemode }),
};
