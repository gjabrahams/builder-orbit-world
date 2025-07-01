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
  Calendar,
  Clock,
  MapPin,
  Award,
  TrendingUp,
} from "lucide-react";
import { SavedRound } from "@shared/golf-types";

export default function RoundDetails() {
  const navigate = useNavigate();
  const [round, setRound] = useState<SavedRound | null>(null);

  useEffect(() => {
    const viewingRound = localStorage.getItem("viewingRound");
    if (viewingRound) {
      setRound(JSON.parse(viewingRound));
    } else {
      navigate("/saved-rounds");
    }
  }, [navigate]);

  const exportToPDF = () => {
    if (!round) return;

    const printContent = `
      <html>
        <head>
          <title>${round.game.course.name} - ${new Date(round.completedAt).toLocaleDateString()}</title>
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
            <h2>${round.game.course.name}</h2>
            <p>${new Date(round.completedAt).toLocaleDateString()} • ${round.game.mode === "betterball" ? "Betterball" : "Individual"}</p>
          </div>

          <table class="scorecard">
            <thead>
              <tr>
                <th>Hole</th>
                <th>Par</th>
                <th>S.I.</th>
                ${round.game.players.map((p) => `<th>${p.name}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${round.game.course.holes
                .map(
                  (hole) => `
                <tr>
                  <td>${hole.number}</td>
                  <td>${hole.par}</td>
                  <td>${hole.handicap}</td>
                  ${round.game.players
                    .map((player) => {
                      const score = round.game.scores.find(
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
                ${round.playerSummaries.map((summary) => `<td>${summary.totalStrokes}</td>`).join("")}
              </tr>
              <tr style="background-color: #e8f5e8; font-weight: bold;">
                <td colspan="3">POINTS</td>
                ${round.playerSummaries.map((summary) => `<td>${summary.totalPoints}</td>`).join("")}
              </tr>
            </tbody>
          </table>

          <div class="summary">
            <h3>Final Results</h3>
            ${round.playerSummaries
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

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportToCSV = () => {
    if (!round) return;

    let csvContent = `Course,${round.game.course.name}\n`;
    csvContent += `Date,${new Date(round.completedAt).toLocaleDateString()}\n`;
    csvContent += `Mode,${round.game.mode === "betterball" ? "Betterball" : "Individual"}\n\n`;

    csvContent += `Hole,Par,S.I.,${round.game.players.map((p) => p.name).join(",")}\n`;

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

    csvContent += `TOTAL,,,${round.playerSummaries.map((s) => s.totalStrokes).join(",")}\n`;
    csvContent += `POINTS,,,${round.playerSummaries.map((s) => s.totalPoints).join(",")}\n`;

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

  if (!round) {
    return <div>Loading...</div>;
  }

  const winner = round.playerSummaries[0];
  const roundDuration =
    new Date(round.completedAt).getTime() -
    new Date(round.game.startTime).getTime();
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
                onClick={() => navigate("/saved-rounds")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Rounds
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Round Details</h1>
                <p className="text-sm text-muted-foreground">
                  {round.game.course.name} • {round.game.roundLength} holes •{" "}
                  {new Date(round.completedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={exportToPDF}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Print
              </Button>
              <Button
                onClick={exportToCSV}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Detailed Scorecard */}
          <div className="xl:col-span-3 space-y-6">
            {/* Winner Announcement */}
            <Card className="golf-card border-0 text-center">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">
                  🏆 {winner.player.name} Wins!
                </CardTitle>
                <CardDescription className="text-lg">
                  {winner.totalPoints} points • {winner.totalStrokes} strokes
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Complete Scorecard */}
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
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
                        {round.game.players.map((player) => (
                          <TableHead key={player.id} className="text-center">
                            {player.name}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {round.game.course.holes
                        .slice(0, round.game.roundLength)
                        .map((hole) => (
                          <TableRow key={hole.number}>
                            <TableCell className="font-medium">
                              {hole.number}
                            </TableCell>
                            <TableCell>{hole.par}</TableCell>
                            <TableCell>{hole.handicap}</TableCell>
                            {round.game.players.map((player) => {
                              const playerSummary = round.playerSummaries.find(
                                (s) => s.player.id === player.id,
                              );
                              const score = round.game.scores.find(
                                (s) =>
                                  s.playerId === player.id &&
                                  s.holeNumber === hole.number,
                              );
                              const scoreToPar = score
                                ? score.strokes - hole.par
                                : 0;

                              return (
                                <TableCell
                                  key={player.id}
                                  className="text-center"
                                >
                                  {score ? (
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
                                        {score.strokes}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {score.points}pt
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
                        {round.playerSummaries.map((summary) => (
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
                  {round.playerSummaries.map((summary) => (
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
                            round.game.course.holes
                              .slice(0, round.game.roundLength)
                              .reduce((sum, hole) => sum + hole.par, 0) >
                          0
                            ? "+"
                            : ""}
                          {summary.totalStrokes -
                            round.game.course.holes
                              .slice(0, round.game.roundLength)
                              .reduce((sum, hole) => sum + hole.par, 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Results */}
            {round.game.mode === "betterball" &&
              round.teamSummaries &&
              round.teamSummaries.length > 0 && (
                <Card className="golf-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Betterball Team Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {round.teamSummaries.map((team, index) => (
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
                                <h4 className="font-semibold">
                                  {team.teamName}
                                </h4>
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
                    {round.game.course.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {new Date(round.completedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="font-medium capitalize">
                    {round.game.mode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Players:</span>
                  <span className="font-medium">
                    {round.game.players.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Round Par:</span>
                  <span className="font-medium">
                    {round.game.course.holes
                      .slice(0, round.game.roundLength)
                      .reduce((sum, hole) => sum + hole.par, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Holes:</span>
                  <span className="font-medium">{round.game.roundLength}</span>
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
                  {round.playerSummaries.map((summary, index) => (
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
