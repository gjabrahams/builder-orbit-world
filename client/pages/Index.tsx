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
  Trophy,
  Users,
  Target,
  BarChart3,
  FileText,
  Download,
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Course Selection",
      description:
        "Choose from a variety of golf courses with detailed hole information",
    },
    {
      icon: Users,
      title: "Multiple Game Modes",
      description:
        "Play individual rounds or competitive betterball with teams",
    },
    {
      icon: BarChart3,
      title: "Live Scoring",
      description: "Track scores and calculate points in real-time as you play",
    },
    {
      icon: Trophy,
      title: "Handicap System",
      description:
        "Fair play with built-in handicap calculations and adjustments",
    },
    {
      icon: FileText,
      title: "Detailed Summary",
      description: "Comprehensive results with stats and performance analysis",
    },
    {
      icon: Download,
      title: "Export Results",
      description: "Download your scorecards as PDF or Excel files",
    },
  ];

  return (
    <div className="min-h-screen golf-gradient golf-gradient-dark">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight">
            GolfScore Pro
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The ultimate golf scoring app for players and tournaments. Track
            your game, compete with friends, and improve your performance.
          </p>
          <Button
            onClick={() => navigate("/course-selection")}
            className="golf-button text-lg px-8 py-4 h-auto"
          >
            Start New Round
          </Button>
        </div>
      </header>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          Everything You Need for Perfect Golf Scoring
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="golf-card hover:shadow-xl transition-all duration-300 border-0"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="golf-card border-0 text-center">
          <CardHeader>
            <CardTitle className="text-3xl mb-4">
              Ready to Improve Your Game?
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mb-6">
              Join thousands of golfers who use GolfScore Pro to track their
              rounds, compete with friends, and lower their handicaps.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/course-selection")}
                className="golf-button"
              >
                Start Your Round
              </Button>
              <Button
                onClick={() => navigate("/saved-rounds")}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                View Saved Rounds
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 border-t border-border">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">
            © 2024 GolfScore Pro. Built for golfers, by golfers.
          </p>
        </div>
      </footer>
    </div>
  );
}
