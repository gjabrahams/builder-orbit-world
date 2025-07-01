import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  Users,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Flag,
  Minus,
  Plus,
} from "lucide-react";
import { Game, Score } from "@shared/golf-types";

export default function Scoring() {
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [currentHole, setCurrentHole] = useState(1);
  const [holeScores, setHoleScores] = useState<{ [playerId: string]: number }>(
    {},
  );

  useEffect(() => {
    const savedGame = localStorage.getItem("currentGame");
    if (savedGame) {
      const gameData = JSON.parse(savedGame);
      setGame(gameData);
      setCurrentHole(gameData.currentHole || 1);
      // Initialize hole scores for current hole
      const scores: { [playerId: string]: number } = {};
      gameData.players.forEach((player: any) => {
        const existingScore = gameData.scores.find(
          (s: Score) =>
            s.playerId === player.id && s.holeNumber === currentHole,
        );
        scores[player.id] = existingScore?.strokes || 0;
      });
      setHoleScores(scores);
    } else {
      navigate("/player-setup");
    }
  }, [navigate]);

  // Calculate how many strokes a player gets on a hole
  const getStrokesOnHole = (
    playerHandicap: number,
    holeStrokeIndex: number,
  ) => {
    if (playerHandicap <= 0) return 0;

    const baseStrokes = Math.floor(playerHandicap / 18);
    const extraStrokes = playerHandicap % 18;

    let strokes = baseStrokes;
    if (extraStrokes >= holeStrokeIndex) {
      strokes += 1;
    }

    return strokes;
  };

  // Calculate Stableford points based on strokes and par
  const calculatePoints = (
    strokes: number,
    par: number,
    handicap: number,
    holeHandicap: number,
  ) => {
    if (strokes === 0) return 0;

    const strokesReceived = getStrokesOnHole(handicap, holeHandicap);
    const adjustedPar = par + strokesReceived;
    const diff = adjustedPar - strokes;

    if (diff >= 2) return 4; // Eagle or better
    if (diff === 1) return 3; // Birdie
    if (diff === 0) return 2; // Par
    if (diff === -1) return 1; // Bogey
    return 0; // Double bogey or worse
  };

  // Get total scores for a player
  const getPlayerTotal = (playerId: string) => {
    if (!game) return { strokes: 0, points: 0 };

    const player = game.players.find((p) => p.id === playerId);
    if (!player) return { strokes: 0, points: 0 };

    let totalStrokes = 0;
    let totalPoints = 0;

    for (let hole = 1; hole <= currentHole; hole++) {
      const score = game.scores.find(
        (s) => s.playerId === playerId && s.holeNumber === hole,
      );
      if (score) {
        totalStrokes += score.strokes;
        totalPoints += score.points;
      }
    }

    return { strokes: totalStrokes, points: totalPoints };
  };

  // Update score for a player on current hole
  const updateScore = (playerId: string, strokes: number) => {
    setHoleScores((prev) => ({ ...prev, [playerId]: strokes }));
  };

  // Save scores and move to next hole
  const saveHoleScores = () => {
    if (!game) return;

    const newScores: Score[] = [];
    const currentHoleData = game.course.holes[currentHole - 1];

    game.players.forEach((player) => {
      const strokes = holeScores[player.id] || 0;
      if (strokes > 0) {
        const points = calculatePoints(
          strokes,
          currentHoleData.par,
          player.handicap,
          currentHoleData.handicap,
        );
        newScores.push({
          playerId: player.id,
          holeNumber: currentHole,
          strokes,
          points,
        });
      }
    });

    // Update game state
    const updatedGame = {
      ...game,
      scores: [
        ...game.scores.filter((s) => s.holeNumber !== currentHole),
        ...newScores,
      ],
      currentHole: Math.min(currentHole + 1, game.roundLength),
    };

    setGame(updatedGame);
    localStorage.setItem("currentGame", JSON.stringify(updatedGame));

    // Move to next hole or finish
    if (currentHole < game.roundLength) {
      setCurrentHole(currentHole + 1);
      // Initialize scores for next hole
      const nextHoleScores: { [playerId: string]: number } = {};
      game.players.forEach((player) => {
        const existingScore = updatedGame.scores.find(
          (s) => s.playerId === player.id && s.holeNumber === currentHole + 1,
        );
        nextHoleScores[player.id] = existingScore?.strokes || 0;
      });
      setHoleScores(nextHoleScores);
    } else {
      navigate("/summary");
    }
  };

  // Navigate to specific hole
  const goToHole = (holeNumber: number) => {
    if (!game) return;

    setCurrentHole(holeNumber);
    const scores: { [playerId: string]: number } = {};
    game.players.forEach((player) => {
      const existingScore = game.scores.find(
        (s) => s.playerId === player.id && s.holeNumber === holeNumber,
      );
      scores[player.id] = existingScore?.strokes || 0;
    });
    setHoleScores(scores);
  };

  if (!game) {
    return <div>Loading...</div>;
  }

  const currentHoleData = game.course.holes[currentHole - 1];
  const canSaveScores = Object.values(holeScores).every((score) => score > 0);

  return (
    <div className="min-h-screen golf-gradient golf-gradient-dark">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/player-setup")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  Scoring - Hole {currentHole}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {game.course.name} • {game.roundLength} holes •{" "}
                  {game.mode === "betterball" ? "Betterball" : "Individual"}
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/summary")} variant="outline">
              Finish Round
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scoring Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hole Info */}
            <Card className="golf-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Flag className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        Hole {currentHole}
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Par {currentHoleData.par} • Stroke Index{" "}
                        {currentHoleData.handicap}
                      </CardDescription>
                      <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <p>Stroke distribution on this hole:</p>
                        <div className="flex flex-wrap gap-2">
                          {game.players.map((player) => {
                            const strokes = getStrokesOnHole(
                              player.handicap,
                              currentHoleData.handicap,
                            );
                            return (
                              <span
                                key={player.id}
                                className="text-xs bg-muted px-2 py-1 rounded"
                              >
                                {player.name}:{" "}
                                {strokes === 0 ? "No strokes" : `+${strokes}`}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToHole(Math.max(1, currentHole - 1))}
                      disabled={currentHole === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        goToHole(Math.min(game.roundLength, currentHole + 1))
                      }
                      disabled={currentHole === game.roundLength}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Score Input */}
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle>Enter Scores</CardTitle>
                <CardDescription>
                  Input strokes for each player on hole {currentHole}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {game.players.map((player) => {
                  const playerScore = holeScores[player.id] || 0;
                  const points =
                    playerScore > 0
                      ? calculatePoints(
                          playerScore,
                          currentHoleData.par,
                          player.handicap,
                          currentHoleData.handicap,
                        )
                      : 0;
                  const total = getPlayerTotal(player.id);
                  const strokesOnHole = getStrokesOnHole(
                    player.handicap,
                    currentHoleData.handicap,
                  );

                  return (
                    <div
                      key={player.id}
                      className="p-4 border border-border rounded-lg bg-background/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{player.name}</h4>
                            {strokesOnHole > 0 && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-100 text-blue-800 border-blue-200"
                              >
                                +{strokesOnHole} Stroke
                                {strokesOnHole !== 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Handicap: {player.handicap} • Total: {total.strokes}{" "}
                            strokes, {total.points} points
                            {strokesOnHole > 0 && (
                              <span className="ml-2 text-blue-600">
                                • Gets {strokesOnHole} stroke
                                {strokesOnHole !== 1 ? "s" : ""} on this hole
                              </span>
                            )}
                          </p>
                        </div>
                        {points > 0 && (
                          <Badge
                            variant={points >= 3 ? "default" : "secondary"}
                          >
                            {points} point{points !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateScore(
                                player.id,
                                Math.max(0, playerScore - 1),
                              )
                            }
                            disabled={playerScore <= 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <div className="w-16 text-center">
                            <Input
                              type="number"
                              min="0"
                              max="15"
                              value={playerScore || ""}
                              onChange={(e) =>
                                updateScore(
                                  player.id,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="text-center"
                              placeholder="0"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateScore(
                                player.id,
                                Math.min(15, playerScore + 1),
                              )
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">
                            {playerScore === 0
                              ? "Enter strokes"
                              : (() => {
                                  const netScore = playerScore - strokesOnHole;
                                  const scoreToPar =
                                    netScore - currentHoleData.par;
                                  const scoreText =
                                    scoreToPar <= -2
                                      ? "Eagle!"
                                      : scoreToPar === -1
                                        ? "Birdie!"
                                        : scoreToPar === 0
                                          ? "Par"
                                          : scoreToPar === 1
                                            ? "Bogey"
                                            : scoreToPar === 2
                                              ? "Double Bogey"
                                              : scoreToPar > 0
                                                ? `+${scoreToPar}`
                                                : `${scoreToPar}`;

                                  return strokesOnHole > 0
                                    ? `${scoreText} (Net: ${netScore})`
                                    : scoreText;
                                })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={saveHoleScores}
                    disabled={!canSaveScores}
                    className="golf-button"
                  >
                    {currentHole === game.roundLength
                      ? "Finish Round"
                      : "Next Hole"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hole Navigation */}
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle>Hole Navigation</CardTitle>
                <CardDescription>
                  Blue outline = Players get strokes on this hole
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-9 gap-2">
                  {game.course.holes.slice(0, game.roundLength).map((hole) => {
                    const hasScores = game.players.every((player) =>
                      game.scores.some(
                        (s) =>
                          s.playerId === player.id &&
                          s.holeNumber === hole.number,
                      ),
                    );

                    // Check if any player gets a stroke on this hole
                    const anyPlayerGetsStroke = game.players.some(
                      (player) => player.handicap >= hole.handicap,
                    );

                    return (
                      <Button
                        key={hole.number}
                        variant={
                          currentHole === hole.number
                            ? "default"
                            : hasScores
                              ? "secondary"
                              : "outline"
                        }
                        size="sm"
                        onClick={() => goToHole(hole.number)}
                        className={`aspect-square p-2 ${
                          anyPlayerGetsStroke && currentHole !== hole.number
                            ? "ring-2 ring-blue-300 ring-offset-1"
                            : ""
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-xs font-medium">
                            {hole.number}
                          </div>
                          <div className="text-xs">Par {hole.par}</div>
                          {anyPlayerGetsStroke && (
                            <div className="text-xs text-blue-600">
                              S.I. {hole.handicap}
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Leaderboard */}
          <div className="space-y-6">
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {game.players
                    .map((player) => ({
                      ...player,
                      total: getPlayerTotal(player.id),
                    }))
                    .sort((a, b) => b.total.points - a.total.points)
                    .map((player, index) => (
                      <div
                        key={player.id}
                        className={`p-3 rounded-lg ${
                          index === 0
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted-foreground/20"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-xs text-muted-foreground">
                                HC: {player.handicap}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {player.total.points} pts
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {player.total.strokes} strokes
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {game.mode === "betterball" && game.teams && (
              <Card className="golf-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {game.teams.map((team, index) => {
                      // Calculate team points (best score per hole)
                      let teamPoints = 0;
                      for (let hole = 1; hole <= currentHole; hole++) {
                        const teamHoleScores = team.players.map((player) => {
                          const score = game.scores.find(
                            (s) =>
                              s.playerId === player.id && s.holeNumber === hole,
                          );
                          return score?.points || 0;
                        });
                        teamPoints += Math.max(...teamHoleScores, 0);
                      }

                      return (
                        <div
                          key={team.id}
                          className="p-3 border border-primary/20 rounded-lg bg-primary/5"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-medium">{team.name}</p>
                            <p className="font-semibold">{teamPoints} pts</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {team.players.map((p) => p.name).join(" & ")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
