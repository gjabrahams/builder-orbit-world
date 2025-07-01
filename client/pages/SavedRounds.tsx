import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  Users,
  Calendar,
  MapPin,
  Eye,
  Trash2,
  Flag,
  MoreVertical,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SavedRound } from "@shared/golf-types";

export default function SavedRounds() {
  const navigate = useNavigate();
  const [savedRounds, setSavedRounds] = useState<SavedRound[]>([]);

  useEffect(() => {
    loadSavedRounds();
  }, []);

  const loadSavedRounds = () => {
    try {
      const rounds = localStorage.getItem("savedRounds");
      if (rounds) {
        const parsedRounds = JSON.parse(rounds);
        // Sort by most recent first
        parsedRounds.sort(
          (a: SavedRound, b: SavedRound) =>
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime(),
        );
        setSavedRounds(parsedRounds);
      }
    } catch (error) {
      console.error("Error loading saved rounds:", error);
    }
  };

  const deleteRound = (roundId: string) => {
    const updatedRounds = savedRounds.filter((round) => round.id !== roundId);
    setSavedRounds(updatedRounds);
    localStorage.setItem("savedRounds", JSON.stringify(updatedRounds));
  };

  const viewRound = (round: SavedRound) => {
    // Store the selected round for viewing
    localStorage.setItem("viewingRound", JSON.stringify(round));
    navigate("/round-details");
  };

  const exportRoundCSV = (round: SavedRound) => {
    let csvContent = `Course,${round.game.course.name}\n`;
    csvContent += `Date,${new Date(round.completedAt).toLocaleDateString()}\n`;
    csvContent += `Mode,${round.game.mode === "betterball" ? "Betterball" : "Individual"}\n\n`;

    // Headers
    csvContent += `Hole,Par,S.I.,${round.game.players.map((p) => p.name).join(",")}\n`;

    // Hole data
    round.game.course.holes.forEach((hole) => {
      const holeData = [
        hole.number,
        hole.par,
        hole.handicap,
        ...round.game.players.map((player) => {
          const score = round.game.scores.find(
            (s) => s.playerId === player.id && s.holeNumber === hole.number,
          );
          return score?.strokes || "";
        }),
      ];
      csvContent += `${holeData.join(",")}\n`;
    });

    // Totals
    csvContent += `TOTAL,,,${round.playerSummaries.map((s) => s.totalStrokes).join(",")}\n`;
    csvContent += `POINTS,,,${round.playerSummaries.map((s) => s.totalPoints).join(",")}\n`;

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `golf-round-${round.game.course.name.replace(/\s+/g, "-")}-${new Date(round.completedAt).toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Saved Rounds</h1>
                <p className="text-sm text-muted-foreground">
                  {savedRounds.length} round
                  {savedRounds.length !== 1 ? "s" : ""} saved
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/course-selection")}
              className="golf-button"
            >
              New Round
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {savedRounds.length === 0 ? (
          <Card className="golf-card border-0 text-center py-12">
            <CardHeader>
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <CardTitle>No Saved Rounds</CardTitle>
              <CardDescription>
                Complete a round to see it appear in your history. All finished
                rounds are automatically saved for later viewing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/course-selection")}
                className="golf-button"
              >
                Start Your First Round
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {savedRounds.map((round) => {
              const winnerSummary = round.playerSummaries[0];

              return (
                <Card key={round.id} className="golf-card border-0">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">
                            {round.game.course.name}
                          </CardTitle>
                          {round.game.mode === "betterball" && (
                            <Badge variant="secondary" className="gap-1">
                              <Users className="w-3 h-3" />
                              Betterball
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(round.completedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {round.game.players.length} player
                            {round.game.players.length !== 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center gap-1">
                            <Flag className="w-4 h-4" />
                            {round.game.roundLength} holes • Par{" "}
                            {round.game.course.holes
                              .slice(0, round.game.roundLength)
                              .reduce((sum, hole) => sum + hole.par, 0)}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewRound(round)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => exportRoundCSV(round)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteRound(round.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Round
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Winner */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground">
                          Winner
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {winnerSummary.player.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {winnerSummary.totalPoints} points
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Player Results */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground">
                          Final Scores
                        </h4>
                        <div className="space-y-2">
                          {round.playerSummaries
                            .slice(0, 3)
                            .map((summary, index) => (
                              <div
                                key={summary.player.id}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-4 text-center text-muted-foreground">
                                    #{index + 1}
                                  </span>
                                  {summary.player.name}
                                </span>
                                <span className="font-medium">
                                  {summary.totalPoints}pts
                                </span>
                              </div>
                            ))}
                          {round.playerSummaries.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{round.playerSummaries.length - 3} more players
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground">
                          Round Stats
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Best Score</p>
                            <p className="font-medium">
                              {Math.min(
                                ...round.playerSummaries.map(
                                  (s) => s.totalStrokes - round.game.course.par,
                                ),
                              ) >= 0
                                ? "+"
                                : ""}
                              {Math.min(
                                ...round.playerSummaries.map(
                                  (s) => s.totalStrokes - round.game.course.par,
                                ),
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">
                              {Math.round(
                                ((new Date(round.completedAt).getTime() -
                                  new Date(round.game.startTime).getTime()) /
                                  (1000 * 60 * 60 * 1000)) *
                                  1000,
                              )}
                              h
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={() => viewRound(round)}
                        variant="outline"
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
