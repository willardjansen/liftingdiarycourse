"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/src/db";
import { workouts, workoutExercises, sets, exercises } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

const updateSetSchema = z.object({
  setId: z.number().positive(),
  weight: z.number().min(0),
  reps: z.number().positive(),
});

export async function updateSet(setId: number, weight: number, reps: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = updateSetSchema.parse({ setId, weight, reps });

  // Verify the set belongs to the user
  const set = await db.query.sets.findFirst({
    where: eq(sets.id, validated.setId),
    with: {
      workoutExercise: {
        with: {
          workout: true,
        },
      },
    },
  });

  if (!set || set.workoutExercise.workout.clerkUserId !== userId) {
    throw new Error("Set not found");
  }

  await db
    .update(sets)
    .set({ weight: validated.weight, reps: validated.reps })
    .where(eq(sets.id, validated.setId));

  revalidatePath("/dashboard");
}

const deleteSetSchema = z.object({
  setId: z.number().positive(),
});

export async function deleteSet(setId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = deleteSetSchema.parse({ setId });

  // Verify the set belongs to the user
  const set = await db.query.sets.findFirst({
    where: eq(sets.id, validated.setId),
    with: {
      workoutExercise: {
        with: {
          workout: true,
        },
      },
    },
  });

  if (!set || set.workoutExercise.workout.clerkUserId !== userId) {
    throw new Error("Set not found");
  }

  await db.delete(sets).where(eq(sets.id, validated.setId));

  revalidatePath("/dashboard");
}

const addSetToExerciseSchema = z.object({
  workoutExerciseId: z.number().positive(),
  setNumber: z.number().positive(),
  weight: z.number().min(0),
  reps: z.number().positive(),
});

export async function addSetToExercise(
  workoutExerciseId: number,
  setNumber: number,
  weight: number,
  reps: number
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = addSetToExerciseSchema.parse({
    workoutExerciseId,
    setNumber,
    weight,
    reps,
  });

  // Verify the workout exercise belongs to the user
  const workoutExercise = await db.query.workoutExercises.findFirst({
    where: eq(workoutExercises.id, validated.workoutExerciseId),
    with: {
      workout: true,
    },
  });

  if (!workoutExercise || workoutExercise.workout.clerkUserId !== userId) {
    throw new Error("Workout exercise not found");
  }

  const [newSet] = await db
    .insert(sets)
    .values({
      workoutExerciseId: validated.workoutExerciseId,
      setNumber: validated.setNumber,
      weight: validated.weight,
      reps: validated.reps,
    })
    .returning();

  revalidatePath("/dashboard");
  return newSet;
}

const deleteWorkoutExerciseSchema = z.object({
  workoutExerciseId: z.number().positive(),
});

export async function deleteWorkoutExercise(workoutExerciseId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = deleteWorkoutExerciseSchema.parse({ workoutExerciseId });

  // Verify the workout exercise belongs to the user
  const workoutExercise = await db.query.workoutExercises.findFirst({
    where: eq(workoutExercises.id, validated.workoutExerciseId),
    with: {
      workout: true,
    },
  });

  if (!workoutExercise || workoutExercise.workout.clerkUserId !== userId) {
    throw new Error("Workout exercise not found");
  }

  // Delete associated sets first
  await db
    .delete(sets)
    .where(eq(sets.workoutExerciseId, validated.workoutExerciseId));

  // Delete the workout exercise
  await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, validated.workoutExerciseId));

  revalidatePath("/dashboard");
}

const addExerciseToWorkoutSchema = z.object({
  workoutId: z.number().positive(),
  exerciseId: z.number().positive(),
  order: z.number().positive(),
});

export async function addExerciseToWorkout(
  workoutId: number,
  exerciseId: number,
  order: number
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = addExerciseToWorkoutSchema.parse({
    workoutId,
    exerciseId,
    order,
  });

  // Verify the workout belongs to the user
  const workout = await db.query.workouts.findFirst({
    where: and(
      eq(workouts.id, validated.workoutId),
      eq(workouts.clerkUserId, userId)
    ),
  });

  if (!workout) {
    throw new Error("Workout not found");
  }

  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({
      workoutId: validated.workoutId,
      exerciseId: validated.exerciseId,
      order: validated.order,
    })
    .returning();

  revalidatePath("/dashboard");
  return workoutExercise;
}

export async function getExercises() {
  return await db.query.exercises.findMany({
    orderBy: (exercises, { asc }) => [asc(exercises.name)],
  });
}

export async function createExercise(name: string) {
  const createExerciseSchema = z.object({
    name: z.string().min(1).max(100),
  });

  const validated = createExerciseSchema.parse({ name });

  const [exercise] = await db
    .insert(exercises)
    .values({ name: validated.name })
    .returning();

  return { id: exercise.id, name: exercise.name };
}

const deleteWorkoutSchema = z.object({
  workoutId: z.number().positive(),
});

export async function deleteWorkout(workoutId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = deleteWorkoutSchema.parse({ workoutId });

  // Verify the workout belongs to the user
  const workout = await db.query.workouts.findFirst({
    where: and(
      eq(workouts.id, validated.workoutId),
      eq(workouts.clerkUserId, userId)
    ),
    with: {
      workoutExercises: true,
    },
  });

  if (!workout) {
    throw new Error("Workout not found");
  }

  // Delete all sets for this workout
  for (const workoutExercise of workout.workoutExercises) {
    await db.delete(sets).where(eq(sets.workoutExerciseId, workoutExercise.id));
  }

  // Delete all workout exercises
  await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.workoutId, validated.workoutId));

  // Delete the workout
  await db.delete(workouts).where(eq(workouts.id, validated.workoutId));

  revalidatePath("/dashboard");
}
