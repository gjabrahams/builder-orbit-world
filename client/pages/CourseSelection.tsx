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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Flag, Ruler, Plus } from "lucide-react";
import { Course, Hole } from "@shared/golf-types";

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
  const [customCourses, setCustomCourses] = useState<Course[]>([]);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [customCourse, setCustomCourse] = useState({
    name: "",
    location: "",
    holes: 18,
  });
  const [holes, setHoles] = useState<Hole[]>([]);

  const initializeHoles = (numHoles: number) => {
    const newHoles: Hole[] = Array.from({ length: numHoles }, (_, i) => ({
      number: i + 1,
      par: 4,
      handicap: i + 1,
      distance: {
        men: 350,
        women: 300,
      },
    }));
    setHoles(newHoles);
  };

  const updateHole = (holeNumber: number, field: keyof Hole, value: any) => {
    setHoles(
      holes.map((hole) =>
        hole.number === holeNumber ? { ...hole, [field]: value } : hole,
      ),
    );
  };

  const createCustomCourse = () => {
    if (
      !customCourse.name.trim() ||
      !customCourse.location.trim() ||
      holes.length === 0
    ) {
      return;
    }

    const newCourse: Course = {
      id: `custom-${Date.now()}`,
      name: customCourse.name,
      location: customCourse.location,
      par: holes.reduce((sum, hole) => sum + hole.par, 0),
      holes: holes,
    };

    setCustomCourses([...customCourses, newCourse]);
    setSelectedCourse(newCourse);
    setIsCreatingCourse(false);
    setCustomCourse({ name: "", location: "", holes: 18 });
    setHoles([]);
  };

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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Choose Your Course</h2>
              <p className="text-muted-foreground">
                Select a golf course to start your round. Each course includes
                detailed hole information and par scoring.
              </p>
            </div>
            <Dialog open={isCreatingCourse} onOpenChange={setIsCreatingCourse}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setIsCreatingCourse(true);
                    initializeHoles(18);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Create Custom Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Custom Course</DialogTitle>
                  <DialogDescription>
                    Design your own golf course with custom par and stroke index
                    settings.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Course Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="course-name">Course Name</Label>
                      <Input
                        id="course-name"
                        value={customCourse.name}
                        onChange={(e) =>
                          setCustomCourse({
                            ...customCourse,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter course name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-location">Location</Label>
                      <Input
                        id="course-location"
                        value={customCourse.location}
                        onChange={(e) =>
                          setCustomCourse({
                            ...customCourse,
                            location: e.target.value,
                          })
                        }
                        placeholder="City, State/Country"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="num-holes">Number of Holes</Label>
                      <Select
                        value={customCourse.holes.toString()}
                        onValueChange={(value) => {
                          const numHoles = parseInt(value);
                          setCustomCourse({ ...customCourse, holes: numHoles });
                          initializeHoles(numHoles);
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9">9 Holes</SelectItem>
                          <SelectItem value="18">18 Holes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Holes Setup */}
                  {holes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-4">Hole Configuration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Front Nine */}
                        <div>
                          <h5 className="font-medium mb-3">Front Nine</h5>
                          <div className="space-y-3">
                            {holes.slice(0, 9).map((hole) => (
                              <div
                                key={hole.number}
                                className="grid grid-cols-4 gap-2 items-center p-2 border rounded"
                              >
                                <div className="font-medium">
                                  Hole {hole.number}
                                </div>
                                <div>
                                  <Label className="text-xs">Par</Label>
                                  <Select
                                    value={hole.par.toString()}
                                    onValueChange={(value) =>
                                      updateHole(
                                        hole.number,
                                        "par",
                                        parseInt(value),
                                      )
                                    }
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="3">3</SelectItem>
                                      <SelectItem value="4">4</SelectItem>
                                      <SelectItem value="5">5</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">S.I.</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max={customCourse.holes}
                                    value={hole.handicap}
                                    onChange={(e) =>
                                      updateHole(
                                        hole.number,
                                        "handicap",
                                        parseInt(e.target.value) || 1,
                                      )
                                    }
                                    className="h-8"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Yds</Label>
                                  <Input
                                    type="number"
                                    min="50"
                                    max="700"
                                    value={hole.distance.men}
                                    onChange={(e) =>
                                      updateHole(hole.number, "distance", {
                                        men: parseInt(e.target.value) || 350,
                                        women: Math.round(
                                          (parseInt(e.target.value) || 350) *
                                            0.85,
                                        ),
                                      })
                                    }
                                    className="h-8"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Back Nine */}
                        {customCourse.holes === 18 && (
                          <div>
                            <h5 className="font-medium mb-3">Back Nine</h5>
                            <div className="space-y-3">
                              {holes.slice(9, 18).map((hole) => (
                                <div
                                  key={hole.number}
                                  className="grid grid-cols-4 gap-2 items-center p-2 border rounded"
                                >
                                  <div className="font-medium">
                                    Hole {hole.number}
                                  </div>
                                  <div>
                                    <Label className="text-xs">Par</Label>
                                    <Select
                                      value={hole.par.toString()}
                                      onValueChange={(value) =>
                                        updateHole(
                                          hole.number,
                                          "par",
                                          parseInt(value),
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="3">3</SelectItem>
                                        <SelectItem value="4">4</SelectItem>
                                        <SelectItem value="5">5</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-xs">S.I.</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max={customCourse.holes}
                                      value={hole.handicap}
                                      onChange={(e) =>
                                        updateHole(
                                          hole.number,
                                          "handicap",
                                          parseInt(e.target.value) || 1,
                                        )
                                      }
                                      className="h-8"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Yds</Label>
                                    <Input
                                      type="number"
                                      min="50"
                                      max="700"
                                      value={hole.distance.men}
                                      onChange={(e) =>
                                        updateHole(hole.number, "distance", {
                                          men: parseInt(e.target.value) || 350,
                                          women: Math.round(
                                            (parseInt(e.target.value) || 350) *
                                              0.85,
                                          ),
                                        })
                                      }
                                      className="h-8"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Course Summary */}
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Total Par
                            </div>
                            <div className="text-xl font-bold">
                              {holes.reduce((sum, hole) => sum + hole.par, 0)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Total Distance
                            </div>
                            <div className="text-xl font-bold">
                              {holes.reduce(
                                (sum, hole) => sum + hole.distance.men,
                                0,
                              )}{" "}
                              yds
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Holes
                            </div>
                            <div className="text-xl font-bold">
                              {holes.length}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingCourse(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createCustomCourse}
                      disabled={
                        !customCourse.name.trim() ||
                        !customCourse.location.trim() ||
                        holes.length === 0
                      }
                      className="golf-button"
                    >
                      Create Course
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
