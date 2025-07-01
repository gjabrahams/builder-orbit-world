import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Award,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Game, Player, Score, SavedRound } from "@shared/golf-types";

interface PlayerSummary {
  player: Player;
  totalStrokes: number;
  totalPoints: number;
  holeScores: { [holeNumber: number]: { strokes: number; points: number } };
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
  rank: number;
}

interface TeamSummary {
  teamId: string;
  teamName: string;
  players: Player[];
  totalPoints: number;
  holeResults: { [holeNumber: number]: number };
}

export default function Summary() {
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [playerSummaries, setPlayerSummaries] = useState<PlayerSummary[]>([]);
  const [teamSummaries, setTeamSummaries] = useState<TeamSummary[]>([]);

  useEffect(() => {
    const savedGame = localStorage.getItem("currentGame");
    if (savedGame) {
      const gameData = JSON.parse(savedGame);
      setGame(gameData);
      calculateSummaries(gameData);
      saveCompletedRound(gameData);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const saveCompletedRound = (gameData: Game) => {
    try {
      // Create saved round data
      const savedRound: SavedRound = {
        id: `round-${Date.now()}`,
        game: gameData,
        completedAt: new Date(),
        playerSummaries: [],
        teamSummaries: undefined,
        winner: "",
      };

      // Calculate player summaries for saved round
      const summaries: PlayerSummary[] = gameData.players.map((player) => {
        let totalStrokes = 0;
        let totalPoints = 0;
        let eagles = 0,
          birdies = 0,
          pars = 0,
          bogeys = 0,
          doubleBogeys = 0;

        gameData.course.holes.slice(0, gameData.roundLength).forEach((hole) => {
          const score = gameData.scores.find(
            (s) => s.playerId === player.id && s.holeNumber === hole.number,
          );
          if (score) {
            totalStrokes += score.strokes;
            totalPoints += score.points;

            const scoreToPar = score.strokes - hole.par;
            if (scoreToPar <= -2) eagles++;
            else if (scoreToPar === -1) birdies++;
            else if (scoreToPar === 0) pars++;
            else if (scoreToPar === 1) bogeys++;
            else if (scoreToPar >= 2) doubleBogeys++;
          }
        });

        return {
          player,
          totalStrokes,
          totalPoints,
          eagles,
          birdies,
          pars,
          bogeys,
          doubleBogeys,
          rank: 0,
        };
      });

      // Sort by points and assign ranks
      summaries.sort((a, b) => b.totalPoints - a.totalPoints);
      summaries.forEach((summary, index) => {
        summary.rank = index + 1;
      });

      savedRound.playerSummaries = summaries;
      savedRound.winner = summaries[0]?.player.name || "";

      // Calculate team summaries if betterball
      if (gameData.mode === "betterball" && gameData.teams) {
        const teamResults = gameData.teams.map((team) => {
          let totalPoints = 0;
          gameData.course.holes
            .slice(0, gameData.roundLength)
            .forEach((hole) => {
              const teamHoleScores = team.players.map((player) => {
                const score = gameData.scores.find(
                  (s) =>
                    s.playerId === player.id && s.holeNumber === hole.number,
                );
                return score?.points || 0;
              });
              totalPoints += Math.max(...teamHoleScores, 0);
            });

          return {
            teamId: team.id,
            teamName: team.name,
            players: team.players,
            totalPoints,
          };
        });

        teamResults.sort((a, b) => b.totalPoints - a.totalPoints);
        savedRound.teamSummaries = teamResults;
      }

      // Get existing saved rounds
      const existingSavedRounds = localStorage.getItem("savedRounds");
      const savedRounds = existingSavedRounds
        ? JSON.parse(existingSavedRounds)
        : [];

      // Add new round
      savedRounds.push(savedRound);

      // Save back to localStorage
      localStorage.setItem("savedRounds", JSON.stringify(savedRounds));

      console.log("Round saved successfully!");
    } catch (error) {
      console.error("Error saving round:", error);
    }
  };

  const calculateSummaries = (gameData: Game) => {
    // Calculate player summaries
    const summaries: PlayerSummary[] = gameData.players.map((player) => {
      let totalStrokes = 0;
      let totalPoints = 0;
      const holeScores: {
        [holeNumber: number]: { strokes: number; points: number };
      } = {};
      let eagles = 0,
        birdies = 0,
        pars = 0,
        bogeys = 0,
        doubleBogeys = 0;

      gameData.course.holes.slice(0, gameData.roundLength).forEach((hole) => {
        const score = gameData.scores.find(
          (s) => s.playerId === player.id && s.holeNumber === hole.number,
        );
        if (score) {
          totalStrokes += score.strokes;
          totalPoints += score.points;
          holeScores[hole.number] = {
            strokes: score.strokes,
            points: score.points,
          };

          // Count score types
          const scoreToPar = score.strokes - hole.par;
          if (scoreToPar <= -2) eagles++;
          else if (scoreToPar === -1) birdies++;
          else if (scoreToPar === 0) pars++;
          else if (scoreToPar === 1) bogeys++;
          else if (scoreToPar >= 2) doubleBogeys++;
        }
      });

      return {
        player,
        totalStrokes,
        totalPoints,
        holeScores,
        eagles,
        birdies,
        pars,
        bogeys,
        doubleBogeys,
        rank: 0, // Will be set after sorting
      };
    });

    // Sort by points and assign ranks
    summaries.sort((a, b) => b.totalPoints - a.totalPoints);
    summaries.forEach((summary, index) => {
      summary.rank = index + 1;
    });

    setPlayerSummaries(summaries);

    // Calculate team summaries for betterball
    if (gameData.mode === "betterball" && gameData.teams) {
      const teamResults: TeamSummary[] = gameData.teams.map((team) => {
        let totalPoints = 0;
        const holeResults: { [holeNumber: number]: number } = {};

        gameData.course.holes.slice(0, gameData.roundLength).forEach((hole) => {
          const teamHoleScores = team.players.map((player) => {
            const score = gameData.scores.find(
              (s) => s.playerId === player.id && s.holeNumber === hole.number,
            );
            return score?.points || 0;
          });
          const bestHoleScore = Math.max(...teamHoleScores, 0);
          totalPoints += bestHoleScore;
          holeResults[hole.number] = bestHoleScore;
        });

        return {
          teamId: team.id,
          teamName: team.name,
          players: team.players,
          totalPoints,
          holeResults,
        };
      });

      teamResults.sort((a, b) => b.totalPoints - a.totalPoints);
      setTeamSummaries(teamResults);
    }
  };

  const exportToPDF = () => {
    if (!game) return;

    // Create printable content
    const printContent = `
      <html>
        <head>
          <title>${game.course.name} - ${new Date(game.startTime).toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .scorecard { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .scorecard th, .scorecard td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            .scorecard th { background-color: #f5f5f5; }
            .summary { margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GolfScore Pro</h1>
            <h2>${game.course.name}</h2>
            <p>${new Date(game.startTime).toLocaleDateString()} • ${game.mode === "betterball" ? "Betterball" : "Individual"}</p>
          </div>

          <table class="scorecard">
            <thead>
              <tr>
                <th>Hole</th>
                <th>Par</th>
                <th>S.I.</th>
                ${game.players.map((p) => `<th>${p.name}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${game.course.holes
                .map(
                  (hole) => `
                <tr>
                  <td>${hole.number}</td>
                  <td>${hole.par}</td>
                  <td>${hole.handicap}</td>
                  ${game.players
                    .map((player) => {
                      const score = game.scores.find(
                        (s) =>
                          s.playerId === player.id &&
                          s.holeNumber === hole.number,
                      );
                      return `<td>${score?.strokes || "-"}</td>`;
                    })
                    .join("")}
                </tr>
              `,
                )
                .join("")}
              <tr style="background-color: #f9f9f9; font-weight: bold;">
                <td colspan="3">TOTAL</td>
                ${playerSummaries.map((summary) => `<td>${summary.totalStrokes}</td>`).join("")}
              </tr>
              <tr style="background-color: #e8f5e8; font-weight: bold;">
                <td colspan="3">POINTS</td>
                ${playerSummaries.map((summary) => `<td>${summary.totalPoints}</td>`).join("")}
              </tr>
            </tbody>
          </table>

          <div class="summary">
            <h3>Final Results</h3>
            ${playerSummaries
              .map(
                (summary, index) => `
              <p>${index + 1}. ${summary.player.name} - ${summary.totalPoints} points (${summary.totalStrokes} strokes)</p>
            `,
              )
              .join("")}
          </div>
        </body>
      </html>
    `;

    // Open print dialog
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportToExcel = () => {
    if (!game) return;

    // Create CSV content
    let csvContent = `Course,${game.course.name}\n`;
    csvContent += `Date,${new Date(game.startTime).toLocaleDateString()}\n`;
    csvContent += `Mode,${game.mode === "betterball" ? "Betterball" : "Individual"}\n\n`;

    // Headers
    csvContent += `Hole,Par,S.I.,${game.players.map((p) => p.name).join(",")}\n`;

    // Hole data
    game.course.holes.forEach((hole) => {
      const holeData = [
        hole.number,
        hole.par,
        hole.handicap,
        ...game.players.map((player) => {
          const score = game.scores.find(
            (s) => s.playerId === player.id && s.holeNumber === hole.number,
          );
          return score?.strokes || "";
        }),
      ];
      csvContent += `${holeData.join(",")}\n`;
    });

    // Totals
    csvContent += `TOTAL,,,${playerSummaries.map((s) => s.totalStrokes).join(",")}\n`;
    csvContent += `POINTS,,,${playerSummaries.map((s) => s.totalPoints).join(",")}\n`;

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `golf-scorecard-${game.course.name.replace(/\s+/g, "-")}-${new Date(game.startTime).toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const startNewRound = () => {
    localStorage.removeItem("currentGame");
    localStorage.removeItem("selectedCourse");
    navigate("/");
  };

  if (!game) {
    return <div>Loading...</div>;
  }

  const winner = playerSummaries[0];
  const roundDuration =
    new Date().getTime() - new Date(game.startTime).getTime();
  const hours = Math.floor(roundDuration / (1000 * 60 * 60));
  const minutes = Math.floor((roundDuration % (1000 * 60 * 60)) / (1000 * 60));

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
                  {game.course.name} • {game.roundLength} holes •{" "}
                  {new Date(game.startTime).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate("/saved-rounds")}
                variant="outline"
                className="gap-2"
              >
                View All Rounds
              </Button>
              <Button onClick={startNewRound} className="golf-button gap-2">
                <Home className="w-4 h-4" />
                New Round
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Winner Announcement */}
        {winner && (
          <Card className="golf-card border-0 mb-8 text-center">
            <CardHeader>
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl mb-2">
                🏆 Congratulations!
              </CardTitle>
              <CardDescription className="text-xl font-medium">
                {winner.player.name} wins with {winner.totalPoints} points
              </CardDescription>
              <p className="text-muted-foreground mt-2">
                {winner.totalStrokes} total strokes • {winner.birdies} birdies •{" "}
                {winner.eagles} eagles
              </p>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Detailed Scorecard */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Complete Scorecard
                </CardTitle>
                <CardDescription>
                  Hole-by-hole results for all players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Hole</TableHead>
                        <TableHead className="w-12">Par</TableHead>
                        <TableHead className="w-12">S.I.</TableHead>
                        {game.players.map((player) => (
                          <TableHead key={player.id} className="text-center">
                            {player.name}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {game.course.holes
                        .slice(0, game.roundLength)
                        .map((hole) => (
                          <TableRow key={hole.number}>
                            <TableCell className="font-medium">
                              {hole.number}
                            </TableCell>
                            <TableCell>{hole.par}</TableCell>
                            <TableCell>{hole.handicap}</TableCell>
                            {game.players.map((player) => {
                              const playerSummary = playerSummaries.find(
                                (s) => s.player.id === player.id,
                              );
                              const holeScore =
                                playerSummary?.holeScores[hole.number];
                              const scoreToPar = holeScore
                                ? holeScore.strokes - hole.par
                                : 0;

                              return (
                                <TableCell
                                  key={player.id}
                                  className="text-center"
                                >
                                  {holeScore ? (
                                    <div className="flex flex-col items-center">
                                      <span
                                        className={`font-medium ${
                                          scoreToPar <= -2
                                            ? "text-green-600"
                                            : scoreToPar === -1
                                              ? "text-blue-600"
                                              : scoreToPar === 0
                                                ? "text-gray-900"
                                                : scoreToPar === 1
                                                  ? "text-orange-600"
                                                  : "text-red-600"
                                        }`}
                                      >
                                        {holeScore.strokes}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {holeScore.points}pt
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      -
                                    </span>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      {/* Totals Row */}
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell colSpan={3}>TOTAL</TableCell>
                        {playerSummaries.map((summary) => (
                          <TableCell
                            key={summary.player.id}
                            className="text-center"
                          >
                            <div className="flex flex-col items-center">
                              <span>{summary.totalStrokes}</span>
                              <span className="text-sm text-primary font-bold">
                                {summary.totalPoints} pts
                              </span>
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Player Statistics */}
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {playerSummaries.map((summary) => (
                    <div
                      key={summary.player.id}
                      className="p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{summary.player.name}</h4>
                        <Badge
                          variant={summary.rank === 1 ? "default" : "secondary"}
                        >
                          #{summary.rank}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-center text-sm">
                        <div>
                          <div className="text-green-600 font-semibold">
                            {summary.eagles}
                          </div>
                          <div className="text-muted-foreground">Eagles</div>
                        </div>
                        <div>
                          <div className="text-blue-600 font-semibold">
                            {summary.birdies}
                          </div>
                          <div className="text-muted-foreground">Birdies</div>
                        </div>
                        <div>
                          <div className="text-gray-900 font-semibold">
                            {summary.pars}
                          </div>
                          <div className="text-muted-foreground">Pars</div>
                        </div>
                        <div>
                          <div className="text-orange-600 font-semibold">
                            {summary.bogeys}
                          </div>
                          <div className="text-muted-foreground">Bogeys</div>
                        </div>
                        <div>
                          <div className="text-red-600 font-semibold">
                            {summary.doubleBogeys}
                          </div>
                          <div className="text-muted-foreground">Double+</div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                        <span>Score to Par:</span>
                        <span className="font-medium">
                          {summary.totalStrokes -
                            game.course.holes
                              .slice(0, game.roundLength)
                              .reduce((sum, hole) => sum + hole.par, 0) >
                          0
                            ? "+"
                            : ""}
                          {summary.totalStrokes -
                            game.course.holes
                              .slice(0, game.roundLength)
                              .reduce((sum, hole) => sum + hole.par, 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Results */}
            {game.mode === "betterball" && teamSummaries.length > 0 && (
              <Card className="golf-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Betterball Team Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamSummaries.map((team, index) => (
                      <div
                        key={team.teamId}
                        className={`p-4 rounded-lg border ${
                          index === 0
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                index === 0
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold">{team.teamName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {team.players.map((p) => p.name).join(" & ")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {team.totalPoints}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              points
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Export Options */}
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Results
                </CardTitle>
                <CardDescription>Download your scorecard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={exportToPDF}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Print Scorecard
                </Button>
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            {/* Round Information */}
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Round Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course:</span>
                  <span className="font-medium text-right">
                    {game.course.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {new Date(game.startTime).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="font-medium capitalize">{game.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Players:</span>
                  <span className="font-medium">{game.players.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Holes:</span>
                  <span className="font-medium">{game.roundLength}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Round Par:</span>
                  <span className="font-medium">
                    {game.course.holes
                      .slice(0, game.roundLength)
                      .reduce((sum, hole) => sum + hole.par, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duration:
                  </span>
                  <span className="font-medium">
                    {hours > 0 ? `${hours}h ` : ""}
                    {minutes}m
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Final Rankings */}
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Final Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {playerSummaries.map((summary, index) => (
                    <div
                      key={summary.player.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        index === 0
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-muted"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted-foreground/20"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{summary.player.name}</p>
                        <p className="text-xs text-muted-foreground">
                          HC: {summary.player.handicap}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{summary.totalPoints}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
