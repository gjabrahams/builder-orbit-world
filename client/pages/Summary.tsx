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
import {
  ArrowLeft,
  Trophy,
  Download,
  FileText,
  FileSpreadsheet,
  Users,
  Target,
  BarChart3,
  Home,
} from "lucide-react";
import { Game } from "@shared/golf-types";

export default function Summary() {
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    const savedGame = localStorage.getItem("currentGame");
    if (savedGame) {
      setGame(JSON.parse(savedGame));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const exportToPDF = () => {
    // PDF export functionality to be implemented
    console.log("Exporting to PDF...");
  };

  const exportToExcel = () => {
    // Excel export functionality to be implemented
    console.log("Exporting to Excel...");
  };

  const startNewRound = () => {
    localStorage.removeItem("currentGame");
    localStorage.removeItem("selectedCourse");
    navigate("/");
  };

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
                onClick={() => navigate("/scoring")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Scoring
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Round Summary</h1>
                <p className="text-sm text-muted-foreground">
                  {game.course.name} •{" "}
                  {new Date(game.startTime).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button onClick={startNewRound} className="golf-button gap-2">
              <Home className="w-4 h-4" />
              New Round
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Winner Announcement */}
        <Card className="golf-card border-0 mb-8 text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Round Complete!</CardTitle>
            <CardDescription className="text-lg">
              Great round at {game.course.name}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Final Scores */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Final Scores
                </CardTitle>
                <CardDescription>
                  Complete scorecard and results
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">
                  Detailed Scorecard
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  The comprehensive final summary with hole-by-hole scores,
                  cumulative totals, and performance statistics will be
                  displayed here.
                </p>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Summary features to include:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 max-w-sm mx-auto">
                    <li>• Hole-by-hole scorecard</li>
                    <li>• Total strokes and points</li>
                    <li>• Handicap-adjusted scores</li>
                    <li>• Best holes and statistics</li>
                    <li>• Team results (if betterball)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Player Rankings */}
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle>Player Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {game.players.map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-4 p-4 bg-muted rounded-lg"
                    >
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Handicap: {player.handicap}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">Par</p>
                        <p className="text-sm text-muted-foreground">
                          36 points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions & Export */}
          <div className="space-y-6">
            {/* Export Options */}
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Results
                </CardTitle>
                <CardDescription>
                  Download your scorecard in different formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={exportToPDF}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export as PDF
                </Button>
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export as Excel
                </Button>
              </CardContent>
            </Card>

            {/* Team Results */}
            {game.mode === "betterball" && game.teams && (
              <Card className="golf-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {game.teams.map((team, index) => (
                      <div
                        key={team.id}
                        className="p-4 border border-primary/20 rounded-lg bg-primary/5"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                              {index + 1}
                            </div>
                            <p className="font-medium">{team.name}</p>
                          </div>
                          <p className="font-semibold">36 pts</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {team.players.map((p) => p.name).join(" & ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Round Statistics */}
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle>Round Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course Par:</span>
                  <span className="font-medium">{game.course.par}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Holes:</span>
                  <span className="font-medium">
                    {game.course.holes.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Game Mode:</span>
                  <span className="font-medium capitalize">{game.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Players:</span>
                  <span className="font-medium">{game.players.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
