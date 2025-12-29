"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { workouts, workoutExercises, sets, exercises } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(date: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [workout] = await db
    .insert(workouts)
    .values({
      clerkUserId: userId,
      date,
      startedAt: new Date(),
    })
    .returning();

  return workout;
}

export async function getExercises() {
  return await db.query.exercises.findMany({
    orderBy: (exercises, { asc }) => [asc(exercises.name)],
  });
}

export async function addExerciseToWorkout(
  workoutId: number,
  exerciseId: number,
  order: number
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the workout belongs to the user
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.clerkUserId, userId)),
  });

  if (!workout) {
    throw new Error("Workout not found");
  }

  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({
      workoutId,
      exerciseId,
      order,
    })
    .returning();

  return workoutExercise;
}

export async function addSet(
  workoutExerciseId: number,
  setNumber: number,
  weight: number,
  reps: number
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the workout exercise belongs to the user
  const workoutExercise = await db.query.workoutExercises.findFirst({
    where: eq(workoutExercises.id, workoutExerciseId),
    with: {
      workout: true,
    },
  });

  if (!workoutExercise || workoutExercise.workout.clerkUserId !== userId) {
    throw new Error("Workout exercise not found");
  }

  const [set] = await db
    .insert(sets)
    .values({
      workoutExerciseId,
      setNumber,
      weight,
      reps,
    })
    .returning();

  return set;
}

export async function completeWorkout(workoutId: number, date: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .update(workouts)
    .set({ completedAt: new Date() })
    .where(and(eq(workouts.id, workoutId), eq(workouts.clerkUserId, userId)));

  revalidatePath("/dashboard");
  redirect(`/dashboard?date=${date}`);
}

export async function createExercise(name: string) {
  const [exercise] = await db
    .insert(exercises)
    .values({ name })
    .returning();

  return exercise;
}
