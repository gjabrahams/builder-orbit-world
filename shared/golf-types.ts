export interface Player {
  id: string;
  name: string;
  handicap: number;
}

export interface Course {
  id: string;
  name: string;
  location: string;
  holes: Hole[];
  par: number;
}

export interface Hole {
  number: number;
  par: number;
  handicap: number;
  distance: {
    men: number;
    women: number;
  };
}

export interface Score {
  playerId: string;
  holeNumber: number;
  strokes: number;
  points: number;
}

export interface Team {
  id: string;
  players: Player[];
  name: string;
}

export type GameMode = "individual" | "betterball";

export interface Game {
  id: string;
  course: Course;
  players: Player[];
  teams?: Team[];
  mode: GameMode;
  scores: Score[];
  startTime: Date;
  currentHole: number;
}

export interface HoleResult {
  holeNumber: number;
  par: number;
  scores: {
    playerId: string;
    playerName: string;
    strokes: number;
    points: number;
  }[];
  teamScores?: {
    teamId: string;
    teamName: string;
    bestScore: number;
    points: number;
  }[];
}

export interface GameSummary {
  game: Game;
  totalScores: {
    playerId: string;
    playerName: string;
    totalStrokes: number;
    totalPoints: number;
    handicapAdjusted: number;
  }[];
  teamSummary?: {
    teamId: string;
    teamName: string;
    totalPoints: number;
    totalStrokes: number;
  }[];
  winner: string;
}
