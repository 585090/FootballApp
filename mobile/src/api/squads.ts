import { api } from './client';

export interface SquadPlayer {
  id: number;
  name: string;
  position: string;
  nationality?: string;
}

export interface Squad {
  teamId: number;
  teamName: string;
  crest?: string;
  squad: SquadPlayer[];
}

export const squadsApi = {
  byTeam: (teamId: number) => api.get<Squad>(`/api/squads/team/${teamId}`),
};
