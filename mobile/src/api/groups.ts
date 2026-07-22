import { api } from './client';
import type { ScoreBreakdown } from './leaderboard';

export interface GroupSummary {
  _id: string;
  groupName: string;
  tournament: string;
  gamemode: number;
  owner: string;
  joinCode: string;
}

export interface GroupMember {
  _id: string;
  name: string;
  email: string;
  points: number;
  pointsBreakdown?: ScoreBreakdown;
}

export interface GroupDetail {
  id: string;
  groupName: string;
  tournament: string;
  owner: string;
  gamemode: number;
  joinCode: string;
  members: GroupMember[];
}

export interface TournamentSummaryPodiumSlot {
  rank: number;
  predictedTeamId: number | null;
  predictedTeamName: string | null;
  actualTeamId: number | null;
  actualTeamName: string | null;
  exact: boolean | null;
  inTopThree: boolean | null;
  wrongSlot: boolean;
}

export interface GroupTournamentSummaryPlayer {
  id: string;
  name: string;
  email: string;
  points: {
    topScorer: number;
    topThree: number;
    groupStandings: number;
    total: number;
  };
  summary: {
    answeredCount: number;
    exactCount: number;
    partialCount: number;
    topScorer: {
      resolved: boolean;
      predictedPlayerId: number | null;
      predictedPlayerName: string | null;
      actualPlayerId: number | null;
      actualPlayerName: string | null;
      correct: boolean | null;
      points: number;
    };
    topThree: {
      resolved: boolean;
      exactCount: number;
      wrongSlotCount: number;
      filledCount: number;
      points: number;
      slots: TournamentSummaryPodiumSlot[];
    };
    groupStandings: {
      groupsSubmitted: number;
      exact: number;
      offByOne: number;
      offByTwo: number;
      offByThreeOrMore: number;
      filledCount: number;
      points: number;
    };
  };
}

export interface GroupTournamentSummary {
  competition: 'WC' | 'CL' | null;
  season: string;
  available: boolean;
  reason: string | null;
  statuses: {
    topScorerResolved: boolean;
    topThreeResolved: boolean;
    groupStandingsResolved: boolean;
  };
  tournamentResult: {
    goldenBoot: { playerId: number | null; playerName: string | null; goals: number | null };
    topThreeTeamIds: number[];
    topThreeTeamNames: string[];
    finalizedAt: string | null;
    resolvedAt: string | null;
  } | null;
  players: GroupTournamentSummaryPlayer[];
}

export interface CreateGroupInput {
  groupName: string;
  tournament: string;
  gamemode: number;
  email: string;
}

export const groupsApi = {
  listMine: (email: string) =>
    api.get<GroupSummary[]>(`/api/groups/player/${encodeURIComponent(email.toLowerCase())}`),
  get: (id: string) => api.get<GroupDetail>(`/api/groups/${id}`),
  getTournamentSummary: (id: string) =>
    api.get<GroupTournamentSummary>(`/api/groups/${id}/tournament-summary`),
  create: (input: CreateGroupInput) =>
    api.post<{ message: string; group: GroupSummary }>('/api/groups/createGroup', input),
  join: (input: { joinCode: string; email: string }) =>
    api.post<{ message: string; group: GroupSummary }>('/api/groups/join', {
      joinCode: input.joinCode.trim().toUpperCase(),
      email: input.email.toLowerCase(),
    }),
  resetScores: (groupId: string) => api.post(`/api/groups/${groupId}/resetPlayerScores`, {}),
  removePlayer: (groupId: string, email: string) =>
    api.post(`/api/groups/${groupId}/removePlayer`, { email: email.toLowerCase() }),
  transferOwnership: (groupId: string, email: string) =>
    api.post<{ message: string; group: GroupSummary }>(
      `/api/groups/${groupId}/transferOwnership`,
      { email: email.toLowerCase() },
    ),
  rename: (groupId: string, email: string, groupName: string) =>
    api.patch<{ message: string; group: GroupSummary }>(`/api/groups/${groupId}`, {
      email: email.toLowerCase(),
      groupName: groupName.trim(),
    }),
  remove: (groupId: string, email: string) =>
    api.delete<{ message: string }>(`/api/groups/${groupId}`, { email: email.toLowerCase() }),
};
