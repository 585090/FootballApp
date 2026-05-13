import { api } from './client';

export interface PredictionScore {
  home: number | null;
  away: number | null;
}

export interface FirstGoalScorer {
  playerId: number;
  playerName: string;
}

export interface Prediction {
  _id?: string;
  email: string;
  matchid: number;
  score: PredictionScore;
  firstGoalScorer?: { playerId: number | null; playerName: string | null } | null;
  pointsAwarded: number | null;
  gamemode?: string;
}

export interface MatchPredictionEntry {
  playerId: string | null;
  name: string;
  score: PredictionScore;
  firstGoalScorer: { playerId: number | null; playerName: string | null } | null;
  pointsAwarded: number | null;
}

export interface HistoryEntry {
  id: string;
  matchid: number;
  score: PredictionScore;
  firstGoalScorer: { playerId: number | null; playerName: string | null } | null;
  pointsAwarded: number | null;
  gamemode: string;
  updatedAt: string;
  match: {
    matchId: number;
    homeTeam: string;
    awayTeam: string;
    homeCrest: string | null;
    awayCrest: string | null;
    score: { home: number | null; away: number | null };
    kickoffDateTime: string;
    status: string;
    competition: string;
  } | null;
}

export const predictionsApi = {
  get: (email: string, matchid: number) =>
    api.get<Prediction | null>('/api/predictions', { email, matchid }),

  save: (params: {
    email: string;
    matchid: number;
    score: PredictionScore;
    gamemode: string;
    firstGoalScorer?: FirstGoalScorer | null;
  }) =>
    api.post<{ message: string; prediction: Prediction }>('/api/predictions/predict', params),

  forMatch: (matchId: number) =>
    api.get<MatchPredictionEntry[]>(`/api/predictions/match/${matchId}`),

  history: (email: string, gamemode?: number, limit = 50) =>
    api.get<HistoryEntry[]>('/api/predictions/history', { email, gamemode, limit }),
};
