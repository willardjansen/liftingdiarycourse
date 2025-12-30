import { format } from "date-fns";
import { notFound } from "next/navigation";

import { getWorkoutById } from "@/src/data/workouts";
import { getExercises } from "./actions";
import { EditWorkoutForm } from "../_components/edit-workout-form";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  const workoutIdNum = parseInt(workoutId);

  if (isNaN(workoutIdNum)) {
    notFound();
  }

  const workout = await getWorkoutById(workoutIdNum);

  if (!workout) {
    notFound();
  }

  const exercises = await getExercises();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Workout</h1>
      <p className="mb-6 text-muted-foreground">
        {format(new Date(workout.date + "T00:00:00"), "do MMM yyyy")}
      </p>
      <EditWorkoutForm workout={workout} exercises={exercises} />
    </div>
  );
}
