import { api } from './client';

export type ActivityType = 'PREDICTION_SAVED' | 'GROUP_JOINED' | 'GROUP_CREATED' | 'POINTS_AWARDED';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  actorEmail: string;
  actorName: string;
  payload: {
    matchid?: number;
    homeTeam?: string;
    awayTeam?: string;
    score?: { home: number | null; away: number | null };
    predicted?: { home: number | null; away: number | null };
    actual?: { home: number | null; away: number | null };
    points?: number;
    groupName?: string;
    joinCode?: string;
  };
  createdAt: string;
}

export const activitiesApi = {
  forGroup: (groupId: string, limit = 30) =>
    api.get<ActivityEntry[]>(`/api/groups/${groupId}/activity`, { limit }),
};
