import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { GAMEMODES, type Gamemode, type GamemodeMeta } from './types';
import { loadGamemode, saveGamemode } from './storage';

const DEFAULT_GAMEMODE: Gamemode = 'premier-league';

interface GamemodeContextValue {
  gamemode: Gamemode;
  meta: GamemodeMeta;
  setGamemode: (g: Gamemode) => void;
  ready: boolean;
}

const GamemodeContext = createContext<GamemodeContextValue | undefined>(undefined);

export function GamemodeProvider({ children }: { children: ReactNode }) {
  const [gamemode, setGamemodeState] = useState<Gamemode>(DEFAULT_GAMEMODE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadGamemode().then((g) => {
      if (g) setGamemodeState(g);
      setReady(true);
    });
  }, []);

  const setGamemode = useCallback((g: Gamemode) => {
    setGamemodeState(g);
    void saveGamemode(g);
  }, []);

  const value = useMemo(
    () => ({ gamemode, meta: GAMEMODES[gamemode], setGamemode, ready }),
    [gamemode, setGamemode, ready],
  );

  return <GamemodeContext.Provider value={value}>{children}</GamemodeContext.Provider>;
}

export function useGamemode(): GamemodeContextValue {
  const ctx = useContext(GamemodeContext);
  if (!ctx) throw new Error('useGamemode must be used within GamemodeProvider');
  return ctx;
}
