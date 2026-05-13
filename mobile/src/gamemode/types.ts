export type Gamemode = 'premier-league' | 'world-cup' | 'champions-league';

export type GamemodeIcon = 'football-outline' | 'trophy-outline' | 'star-outline';

export interface GamemodeMeta {
  id: Gamemode;
  label: string;
  shortLabel: string;
  tagline: string;
  icon: GamemodeIcon;
  /** Football-data.org competition code (PL, WC, CL, ...). */
  competition: 'PL' | 'WC' | 'CL';
  /** Marks a temporary, event-style gamemode that should be visually highlighted. */
  limited?: boolean;
}

export const GAMEMODES: Record<Gamemode, GamemodeMeta> = {
  'premier-league': {
    id: 'premier-league',
    label: 'Premier League',
    shortLabel: 'PL',
    tagline: 'Predict every score, climb your group leaderboard.',
    icon: 'football-outline',
    competition: 'PL',
  },
  'world-cup': {
    id: 'world-cup',
    label: 'World Cup',
    shortLabel: 'WC',
    tagline: 'Predict group standings and match scores. Limited-time event.',
    icon: 'trophy-outline',
    competition: 'WC',
    limited: true,
  },
  'champions-league': {
    id: 'champions-league',
    label: 'Champions League',
    shortLabel: 'CL',
    tagline: 'Knockout-stage predictions. A test run before the World Cup.',
    icon: 'star-outline',
    competition: 'CL',
    limited: true,
  },
};

export const GAMEMODE_LIST: GamemodeMeta[] = [
  GAMEMODES['premier-league'],
  GAMEMODES['world-cup'],
  GAMEMODES['champions-league'],
];

/**
 * Numeric IDs the existing backend uses on the Group model.
 * Kept here for when we send `gamemode` to /api/groups etc. — the mobile
 * app uses string IDs everywhere else for readability.
 */
export const SERVER_GAMEMODE_ID: Record<Gamemode, number> = {
  'premier-league': 2, // existing "Predict scores"
  'world-cup': 3,
  'champions-league': 4,
};
