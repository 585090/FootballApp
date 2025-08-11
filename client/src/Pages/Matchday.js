import { useState } from "react";
import { MatchList } from './matchList'

export function Matchday () {
    const [matchday, setMatchDay] = useState(1);

    return (
        <MatchList />
    )
}