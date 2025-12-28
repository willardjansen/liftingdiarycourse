import { pgTable, serial, text, date, timestamp, integer, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Exercise library
export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workout sessions
export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  clerkUserId: text('clerk_user_id').notNull(),
  date: date('date').notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Junction table: exercises performed in a workout
export const workoutExercises = pgTable('workout_exercises', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Individual sets
export const sets = pgTable('sets', {
  id: serial('id').primaryKey(),
  workoutExerciseId: integer('workout_exercise_id').notNull().references(() => workoutExercises.id),
  setNumber: integer('set_number').notNull(),
  weight: real('weight').notNull(),
  reps: integer('reps').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout: one(workouts, {
    fields: [workoutExercises.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [workoutExercises.exerciseId],
    references: [exercises.id],
  }),
  sets: many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));
