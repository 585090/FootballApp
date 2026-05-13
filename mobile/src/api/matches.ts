import { api } from './client';

export interface Match {
  _id?: string;
  matchId: number;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: number | null;
  awayTeamId?: number | null;
  homeCrest?: string | null;
  awayCrest?: string | null;
  score: { home: number | null; away: number | null };
  kickoffDateTime: string;
  matchweek: number | null;
  stage: string | null;
  group: string | null;
  status: string;
}

export type CompetitionCode = 'PL' | 'WC' | 'CL';

export const matchesApi = {
  byDate: (date: string, competition: CompetitionCode = 'PL') =>
    api.get<Match[]>('/api/matches/by-date', { date, competition }),
  byMatchweek: (matchweek: number, competition: CompetitionCode = 'PL') =>
    api.get<Match[]>('/api/matches/by-matchweek', { matchweek, competition }),
  byStage: (stage: string, competition: CompetitionCode = 'WC') =>
    api.get<Match[]>('/api/matches/by-stage', { competition, stage }),
  byId: (matchId: number) => api.get<Match>(`/api/matches/${matchId}`),
  currentMatchweek: (competition: CompetitionCode = 'PL') =>
    api.get<{ matchweek: number }>('/api/matches/matchweek', {
      competition,
      kickoffDateTime: new Date().toISOString(),
    }),
  next: (competition: CompetitionCode) =>
    api.get<Match>('/api/matches/next', { competition }),
  upcoming: (competition: CompetitionCode, limit = 30) =>
    api.get<Match[]>('/api/matches/upcoming', { competition, limit }),
};
