import { auth } from "@clerk/nextjs/server";
import { db } from "@/src/db";
import { workouts } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkoutsByDate(date: string) {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  return await db.query.workouts.findMany({
    where: and(
      eq(workouts.clerkUserId, userId),
      eq(workouts.date, date)
    ),
    with: {
      workoutExercises: {
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.order)],
        with: {
          exercise: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
      },
    },
  });
}
