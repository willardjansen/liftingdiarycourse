import { format } from "date-fns";
import { getExercises } from "./actions";
import { WorkoutForm } from "../_components/workout-form";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = params.date || format(new Date(), "yyyy-MM-dd");
  const exercises = await getExercises();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Log New Workout</h1>
      <p className="mb-6 text-muted-foreground">
        {format(new Date(selectedDate + "T00:00:00"), "do MMM yyyy")}
      </p>
      <WorkoutForm date={selectedDate} exercises={exercises} />
    </div>
  );
}
