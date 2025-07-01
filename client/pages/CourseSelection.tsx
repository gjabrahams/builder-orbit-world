import { useState } from "react";
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
import { ArrowLeft, MapPin, Flag, Ruler } from "lucide-react";
import { Course } from "@shared/golf-types";

// Sample courses data
const sampleCourses: Course[] = [
  {
    id: "1",
    name: "Pine Valley Golf Club",
    location: "Pine Valley, NJ",
    par: 72,
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: i % 3 === 0 ? 5 : i % 2 === 0 ? 4 : 3,
      handicap: i + 1,
      distance: {
        men: 350 + Math.floor(Math.random() * 200),
        women: 300 + Math.floor(Math.random() * 150),
      },
    })),
  },
  {
    id: "2",
    name: "Augusta National Golf Club",
    location: "Augusta, GA",
    par: 72,
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: i % 3 === 0 ? 5 : i % 2 === 0 ? 4 : 3,
      handicap: i + 1,
      distance: {
        men: 380 + Math.floor(Math.random() * 220),
        women: 320 + Math.floor(Math.random() * 180),
      },
    })),
  },
  {
    id: "3",
    name: "Pebble Beach Golf Links",
    location: "Pebble Beach, CA",
    par: 72,
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: i % 3 === 0 ? 5 : i % 2 === 0 ? 4 : 3,
      handicap: i + 1,
      distance: {
        men: 340 + Math.floor(Math.random() * 190),
        women: 290 + Math.floor(Math.random() * 140),
      },
    })),
  },
  {
    id: "4",
    name: "St. Andrews Old Course",
    location: "St. Andrews, Scotland",
    par: 72,
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: i % 3 === 0 ? 5 : i % 2 === 0 ? 4 : 3,
      handicap: i + 1,
      distance: {
        men: 360 + Math.floor(Math.random() * 200),
        women: 310 + Math.floor(Math.random() * 160),
      },
    })),
  },
];

export default function CourseSelection() {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleContinue = () => {
    if (selectedCourse) {
      // Store selected course in localStorage for now
      localStorage.setItem("selectedCourse", JSON.stringify(selectedCourse));
      navigate("/player-setup");
    }
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
              <h1 className="text-2xl font-bold">Select Course</h1>
            </div>
            <Button
              onClick={handleContinue}
              disabled={!selectedCourse}
              className="golf-button"
            >
              Continue
            </Button>
          </div>
        </div>
      </header>

      {/* Course Selection */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Choose Your Course</h2>
          <p className="text-muted-foreground">
            Select a golf course to start your round. Each course includes
            detailed hole information and par scoring.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sampleCourses.map((course) => {
            const totalDistance = course.holes.reduce(
              (sum, hole) => sum + hole.distance.men,
              0,
            );
            const isSelected = selectedCourse?.id === course.id;

            return (
              <Card
                key={course.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected
                    ? "ring-2 ring-primary bg-primary/5"
                    : "golf-card border-0"
                }`}
                onClick={() => setSelectedCourse(course)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">
                        {course.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {course.location}
                      </CardDescription>
                    </div>
                    {isSelected && (
                      <Badge className="bg-primary text-primary-foreground">
                        Selected
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                        <Flag className="w-4 h-4" />
                        Holes
                      </div>
                      <div className="text-lg font-semibold">
                        {course.holes.length}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                        <Flag className="w-4 h-4" />
                        Par
                      </div>
                      <div className="text-lg font-semibold">{course.par}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                        <Ruler className="w-4 h-4" />
                        Distance
                      </div>
                      <div className="text-lg font-semibold">
                        {Math.round(totalDistance / 1000).toFixed(1)}k yds
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Course Preview</h4>
                    <div className="grid grid-cols-9 gap-1">
                      {course.holes.slice(0, 9).map((hole) => (
                        <div
                          key={hole.number}
                          className="text-xs text-center p-1 bg-muted rounded"
                        >
                          <div className="font-medium">{hole.number}</div>
                          <div className="text-muted-foreground">
                            Par {hole.par}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedCourse && (
          <div className="mt-8">
            <Card className="golf-card border-0">
              <CardHeader>
                <CardTitle>Course Details: {selectedCourse.name}</CardTitle>
                <CardDescription>
                  Review the complete hole information for your selected course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Front Nine</h4>
                    <div className="space-y-2">
                      {selectedCourse.holes.slice(0, 9).map((hole) => (
                        <div
                          key={hole.number}
                          className="flex justify-between items-center p-2 bg-muted rounded"
                        >
                          <span className="font-medium">
                            Hole {hole.number}
                          </span>
                          <span>Par {hole.par}</span>
                          <span className="text-sm text-muted-foreground">
                            {hole.distance.men} yds
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Back Nine</h4>
                    <div className="space-y-2">
                      {selectedCourse.holes.slice(9, 18).map((hole) => (
                        <div
                          key={hole.number}
                          className="flex justify-between items-center p-2 bg-muted rounded"
                        >
                          <span className="font-medium">
                            Hole {hole.number}
                          </span>
                          <span>Par {hole.par}</span>
                          <span className="text-sm text-muted-foreground">
                            {hole.distance.men} yds
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
