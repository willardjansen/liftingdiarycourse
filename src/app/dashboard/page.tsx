import { format } from "date-fns";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkoutsByDate } from "@/src/data/workouts";
import { DatePicker } from "./_components/date-picker";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = params.date || format(new Date(), "yyyy-MM-dd");

  const workouts = await getWorkoutsByDate(selectedDate);

  const displayDate = new Date(selectedDate + "T00:00:00");

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Workout Log</h1>

      <div className="mb-8 flex items-center justify-between">
        <DatePicker selectedDate={selectedDate} />
        <Button asChild>
          <Link href={`/dashboard/workout/new?date=${selectedDate}`}>
            <Plus className="mr-2 h-4 w-4" />
            Log new workout
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-muted-foreground">
          Workouts for {format(displayDate, "do MMM yyyy")}
        </h2>

        {workouts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No workouts logged for this date.
            </CardContent>
          </Card>
        ) : (
          workouts.map((workout) =>
            workout.workoutExercises.map((workoutExercise) => (
              <Link
                key={workoutExercise.id}
                href={`/dashboard/workout/${workout.id}`}
                className="block transition-colors hover:bg-muted/50 rounded-lg"
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {workoutExercise.exercise.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {workoutExercise.sets.map((set) => (
                        <div
                          key={set.id}
                          className="flex items-center gap-4 text-sm text-muted-foreground"
                        >
                          <span className="w-16">Set {set.setNumber}</span>
                          <span>{set.reps} reps</span>
                          <span>@ {set.weight} lbs</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )
        )}
      </div>
    </div>
  );
}
