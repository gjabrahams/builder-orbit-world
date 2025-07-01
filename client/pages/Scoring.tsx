import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Users, Trophy } from "lucide-react";
import { Game } from "@shared/golf-types";

export default function Scoring() {
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    const savedGame = localStorage.getItem("currentGame");
    if (savedGame) {
      setGame(JSON.parse(savedGame));
    } else {
      navigate("/player-setup");
    }
  }, [navigate]);

  if (!game) {
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
                onClick={() => navigate("/player-setup")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  Scoring - Hole {game.currentHole}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {game.course.name} •{" "}
                  {game.mode === "betterball" ? "Betterball" : "Individual"}
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/summary")}
              className="golf-button"
            >
              Finish Round
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Hole Info */}
          <div className="lg:col-span-2">
            <Card className="golf-card border-0 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Hole {game.currentHole}
                </CardTitle>
                <CardDescription>
                  Par {game.course.holes[game.currentHole - 1]?.par} •{" "}
                  {game.course.holes[game.currentHole - 1]?.distance.men} yards
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Scoring Interface Placeholder */}
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle>Score Input</CardTitle>
                <CardDescription>
                  Enter scores for each player on this hole
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">
                  Scoring Interface
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  The full scoring interface with hole-by-hole input, betterball
                  logic, and real-time calculations will be implemented in the
                  next phase.
                </p>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Features to include:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 max-w-sm mx-auto">
                    <li>• Stroke input for each player</li>
                    <li>• Automatic point calculation</li>
                    <li>• Betterball team scoring</li>
                    <li>• Running totals</li>
                    <li>• Hole navigation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scorecard Summary */}
          <div>
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {game.mode === "betterball" ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    <Trophy className="w-5 h-5" />
                  )}
                  Current Standings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {game.players.map((player, index) => (
                    <div
                      key={player.id}
                      className="flex justify-between items-center p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-muted-foreground">
                          HC: {player.handicap}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">E</p>
                        <p className="text-sm text-muted-foreground">0 pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {game.mode === "betterball" && game.teams && (
              <Card className="golf-card border-0 mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {game.teams.map((team) => (
                      <div
                        key={team.id}
                        className="p-3 border border-primary/20 rounded-lg bg-primary/5"
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{team.name}</p>
                          <p className="font-semibold">0 pts</p>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {team.players.map((p) => p.name).join(" & ")}
                        </div>
                      </div>
                    ))}
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
