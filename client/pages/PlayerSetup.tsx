import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Plus,
  Trash2,
  User,
  Users,
  Trophy,
  UserCheck,
} from "lucide-react";
import { Player, Course, GameMode, Game, Team } from "@shared/golf-types";

export default function PlayerSetup() {
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>("individual");
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    // Load selected course from localStorage
    const savedCourse = localStorage.getItem("selectedCourse");
    if (savedCourse) {
      setCourse(JSON.parse(savedCourse));
    } else {
      navigate("/course-selection");
    }
  }, [navigate]);

  const addPlayer = () => {
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: "",
      handicap: 0,
    };
    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter((p) => p.id !== playerId));
  };

  const updatePlayer = (playerId: string, field: keyof Player, value: any) => {
    setPlayers(
      players.map((p) => (p.id === playerId ? { ...p, [field]: value } : p)),
    );
  };

  const createTeams = () => {
    if (players.length >= 4) {
      const team1: Team = {
        id: "team-1",
        name: "Team 1",
        players: [players[0], players[1]],
      };
      const team2: Team = {
        id: "team-2",
        name: "Team 2",
        players: [players[2], players[3]],
      };
      setTeams([team1, team2]);
    }
  };

  useEffect(() => {
    if (gameMode === "betterball" && players.length >= 4) {
      createTeams();
    } else {
      setTeams([]);
    }
  }, [gameMode, players]);

  const canStartGame = () => {
    const hasValidPlayers =
      players.length >= 1 && players.every((p) => p.name.trim() !== "");
    if (gameMode === "betterball") {
      return hasValidPlayers && players.length >= 4 && players.length % 2 === 0;
    }
    return hasValidPlayers;
  };

  const startGame = () => {
    if (!course || !canStartGame()) return;

    const game: Game = {
      id: `game-${Date.now()}`,
      course,
      players,
      teams: gameMode === "betterball" ? teams : undefined,
      mode: gameMode,
      scores: [],
      startTime: new Date(),
      currentHole: 1,
    };

    localStorage.setItem("currentGame", JSON.stringify(game));
    navigate("/scoring");
  };

  if (!course) {
    return <div>Loading...</div>;
  }

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
                onClick={() => navigate("/course-selection")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Setup Players</h1>
                <p className="text-sm text-muted-foreground">{course.name}</p>
              </div>
            </div>
            <Button
              onClick={startGame}
              disabled={!canStartGame()}
              className="golf-button"
            >
              Start Round
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Mode Selection */}
          <div className="space-y-6">
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Game Mode
                </CardTitle>
                <CardDescription>
                  Choose how you want to play this round
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      gameMode === "individual"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setGameMode("individual")}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5" />
                      <div>
                        <h3 className="font-medium">Individual</h3>
                        <p className="text-sm text-muted-foreground">
                          Each player plays their own round
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      gameMode === "betterball"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setGameMode("betterball")}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5" />
                      <div>
                        <h3 className="font-medium">Betterball</h3>
                        <p className="text-sm text-muted-foreground">
                          Teams compete using best scores
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {gameMode === "betterball" && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Betterball requires 4 players (2 teams of 2)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Teams Preview */}
            {gameMode === "betterball" && teams.length > 0 && (
              <Card className="golf-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Teams
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="p-3 border border-primary/20 rounded-lg bg-primary/5"
                    >
                      <h4 className="font-medium mb-2">{team.name}</h4>
                      <div className="space-y-1">
                        {team.players.map((player) => (
                          <div
                            key={player.id}
                            className="text-sm flex items-center gap-2"
                          >
                            <UserCheck className="w-3 h-3" />
                            {player.name || "Unnamed Player"} (HC:{" "}
                            {player.handicap})
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Players Setup */}
          <div className="lg:col-span-2">
            <Card className="golf-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Players ({players.length})
                    </CardTitle>
                    <CardDescription>
                      Add players and set their handicaps
                    </CardDescription>
                  </div>
                  <Button
                    onClick={addPlayer}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={gameMode === "betterball" && players.length >= 4}
                  >
                    <Plus className="w-4 h-4" />
                    Add Player
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {players.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No players added yet</p>
                    <p className="text-sm">Click "Add Player" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {players.map((player, index) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-4 p-4 border border-border rounded-lg bg-background/50"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                          <span className="font-medium text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`name-${player.id}`}>Name</Label>
                            <Input
                              id={`name-${player.id}`}
                              value={player.name}
                              onChange={(e) =>
                                updatePlayer(player.id, "name", e.target.value)
                              }
                              placeholder="Enter player name"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`handicap-${player.id}`}>
                              Handicap
                            </Label>
                            <Input
                              id={`handicap-${player.id}`}
                              type="number"
                              value={player.handicap}
                              onChange={(e) =>
                                updatePlayer(
                                  player.id,
                                  "handicap",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              placeholder="0"
                              min="0"
                              max="54"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlayer(player.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Validation Messages */}
                <div className="mt-6 space-y-2">
                  {gameMode === "betterball" && players.length < 4 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Add {4 - players.length} more player
                        {4 - players.length !== 1 ? "s" : ""} for betterball
                        mode
                      </p>
                    </div>
                  )}
                  {players.some((p) => p.name.trim() === "") && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        All players must have names
                      </p>
                    </div>
                  )}
                  {canStartGame() && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        Ready to start! Click "Start Round" to begin.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
