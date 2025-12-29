"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock workout data for UI demonstration
const mockWorkouts = [
  {
    id: "1",
    name: "Bench Press",
    sets: [
      { reps: 8, weight: 135 },
      { reps: 8, weight: 155 },
      { reps: 6, weight: 175 },
    ],
  },
  {
    id: "2",
    name: "Squats",
    sets: [
      { reps: 10, weight: 185 },
      { reps: 8, weight: 205 },
      { reps: 6, weight: 225 },
    ],
  },
  {
    id: "3",
    name: "Deadlift",
    sets: [
      { reps: 5, weight: 225 },
      { reps: 5, weight: 275 },
      { reps: 3, weight: 315 },
    ],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Workout Log</h1>

      <div className="mb-8">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "do MMM yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-muted-foreground">
          Workouts for {format(date, "do MMM yyyy")}
        </h2>

        {mockWorkouts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No workouts logged for this date.
            </CardContent>
          </Card>
        ) : (
          mockWorkouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{workout.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {workout.sets.map((set, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 text-sm text-muted-foreground"
                    >
                      <span className="w-16">Set {index + 1}</span>
                      <span>{set.reps} reps</span>
                      <span>@ {set.weight} lbs</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
