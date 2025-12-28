import 'dotenv/config';
import { db } from './index';
import { exercises, workouts, workoutExercises, sets } from './schema';

const USER_ID = 'user_37TiMBN9Y3K6sZCRBGHEQxLs5Hv';

async function seed() {
  console.log('Seeding database...');

  // 1. Insert exercises
  const insertedExercises = await db.insert(exercises).values([
    { name: 'Bench Press' },
    { name: 'Squat' },
    { name: 'Deadlift' },
    { name: 'Overhead Press' },
    { name: 'Barbell Row' },
    { name: 'Pull-up' },
    { name: 'Leg Press' },
    { name: 'Dumbbell Curl' },
    { name: 'Tricep Pushdown' },
    { name: 'Lat Pulldown' },
  ]).returning();
  console.log(`Inserted ${insertedExercises.length} exercises`);

  // 2. Insert workouts
  const insertedWorkouts = await db.insert(workouts).values([
    { clerkUserId: USER_ID, date: '2025-12-16', startedAt: new Date('2025-12-16T09:00:00'), completedAt: new Date('2025-12-16T10:15:00') },
    { clerkUserId: USER_ID, date: '2025-12-18', startedAt: new Date('2025-12-18T08:30:00'), completedAt: new Date('2025-12-18T09:45:00') },
    { clerkUserId: USER_ID, date: '2025-12-20', startedAt: new Date('2025-12-20T07:00:00'), completedAt: new Date('2025-12-20T08:30:00') },
    { clerkUserId: USER_ID, date: '2025-12-22', startedAt: new Date('2025-12-22T10:00:00'), completedAt: new Date('2025-12-22T11:15:00') },
    { clerkUserId: USER_ID, date: '2025-12-24', startedAt: new Date('2025-12-24T09:30:00'), completedAt: new Date('2025-12-24T10:45:00') },
    { clerkUserId: USER_ID, date: '2025-12-27', startedAt: new Date('2025-12-27T08:00:00'), completedAt: new Date('2025-12-27T09:30:00') },
  ]).returning();
  console.log(`Inserted ${insertedWorkouts.length} workouts`);

  // Create lookup maps
  const exerciseMap = Object.fromEntries(insertedExercises.map(e => [e.name, e.id]));
  const workoutIds = insertedWorkouts.map(w => w.id);

  // 3. Insert workout_exercises
  const insertedWorkoutExercises = await db.insert(workoutExercises).values([
    // Workout 1: Bench Press, OHP, Tricep Pushdown
    { workoutId: workoutIds[0], exerciseId: exerciseMap['Bench Press'], order: 1 },
    { workoutId: workoutIds[0], exerciseId: exerciseMap['Overhead Press'], order: 2 },
    { workoutId: workoutIds[0], exerciseId: exerciseMap['Tricep Pushdown'], order: 3 },
    // Workout 2: Squat, Leg Press, Deadlift
    { workoutId: workoutIds[1], exerciseId: exerciseMap['Squat'], order: 1 },
    { workoutId: workoutIds[1], exerciseId: exerciseMap['Leg Press'], order: 2 },
    { workoutId: workoutIds[1], exerciseId: exerciseMap['Deadlift'], order: 3 },
    // Workout 3: Barbell Row, Pull-up, Lat Pulldown
    { workoutId: workoutIds[2], exerciseId: exerciseMap['Barbell Row'], order: 1 },
    { workoutId: workoutIds[2], exerciseId: exerciseMap['Pull-up'], order: 2 },
    { workoutId: workoutIds[2], exerciseId: exerciseMap['Lat Pulldown'], order: 3 },
    // Workout 4: Bench Press, Dumbbell Curl, Tricep Pushdown
    { workoutId: workoutIds[3], exerciseId: exerciseMap['Bench Press'], order: 1 },
    { workoutId: workoutIds[3], exerciseId: exerciseMap['Dumbbell Curl'], order: 2 },
    { workoutId: workoutIds[3], exerciseId: exerciseMap['Tricep Pushdown'], order: 3 },
    // Workout 5: Squat, Deadlift
    { workoutId: workoutIds[4], exerciseId: exerciseMap['Squat'], order: 1 },
    { workoutId: workoutIds[4], exerciseId: exerciseMap['Deadlift'], order: 2 },
    // Workout 6: OHP, Lat Pulldown
    { workoutId: workoutIds[5], exerciseId: exerciseMap['Overhead Press'], order: 1 },
    { workoutId: workoutIds[5], exerciseId: exerciseMap['Lat Pulldown'], order: 2 },
  ]).returning();
  console.log(`Inserted ${insertedWorkoutExercises.length} workout_exercises`);

  const weIds = insertedWorkoutExercises.map(we => we.id);

  // 4. Insert sets (47 total)
  const insertedSets = await db.insert(sets).values([
    // Workout Exercise 1: Bench Press (3 sets)
    { workoutExerciseId: weIds[0], setNumber: 1, weight: 60.0, reps: 10 },
    { workoutExerciseId: weIds[0], setNumber: 2, weight: 80.0, reps: 8 },
    { workoutExerciseId: weIds[0], setNumber: 3, weight: 85.0, reps: 6 },
    // Workout Exercise 2: OHP (3 sets)
    { workoutExerciseId: weIds[1], setNumber: 1, weight: 30.0, reps: 10 },
    { workoutExerciseId: weIds[1], setNumber: 2, weight: 50.0, reps: 8 },
    { workoutExerciseId: weIds[1], setNumber: 3, weight: 55.0, reps: 6 },
    // Workout Exercise 3: Tricep Pushdown (3 sets)
    { workoutExerciseId: weIds[2], setNumber: 1, weight: 25.0, reps: 12 },
    { workoutExerciseId: weIds[2], setNumber: 2, weight: 30.0, reps: 10 },
    { workoutExerciseId: weIds[2], setNumber: 3, weight: 30.0, reps: 10 },
    // Workout Exercise 4: Squat (4 sets)
    { workoutExerciseId: weIds[3], setNumber: 1, weight: 60.0, reps: 10 },
    { workoutExerciseId: weIds[3], setNumber: 2, weight: 100.0, reps: 8 },
    { workoutExerciseId: weIds[3], setNumber: 3, weight: 110.0, reps: 6 },
    { workoutExerciseId: weIds[3], setNumber: 4, weight: 120.0, reps: 4 },
    // Workout Exercise 5: Leg Press (3 sets)
    { workoutExerciseId: weIds[4], setNumber: 1, weight: 100.0, reps: 12 },
    { workoutExerciseId: weIds[4], setNumber: 2, weight: 140.0, reps: 10 },
    { workoutExerciseId: weIds[4], setNumber: 3, weight: 160.0, reps: 8 },
    // Workout Exercise 6: Deadlift (3 sets)
    { workoutExerciseId: weIds[5], setNumber: 1, weight: 80.0, reps: 8 },
    { workoutExerciseId: weIds[5], setNumber: 2, weight: 120.0, reps: 5 },
    { workoutExerciseId: weIds[5], setNumber: 3, weight: 140.0, reps: 3 },
    // Workout Exercise 7: Barbell Row (3 sets)
    { workoutExerciseId: weIds[6], setNumber: 1, weight: 50.0, reps: 10 },
    { workoutExerciseId: weIds[6], setNumber: 2, weight: 70.0, reps: 8 },
    { workoutExerciseId: weIds[6], setNumber: 3, weight: 75.0, reps: 8 },
    // Workout Exercise 8: Pull-up (3 sets)
    { workoutExerciseId: weIds[7], setNumber: 1, weight: 0.0, reps: 8 },
    { workoutExerciseId: weIds[7], setNumber: 2, weight: 0.0, reps: 7 },
    { workoutExerciseId: weIds[7], setNumber: 3, weight: 0.0, reps: 6 },
    // Workout Exercise 9: Lat Pulldown (3 sets)
    { workoutExerciseId: weIds[8], setNumber: 1, weight: 50.0, reps: 12 },
    { workoutExerciseId: weIds[8], setNumber: 2, weight: 60.0, reps: 10 },
    { workoutExerciseId: weIds[8], setNumber: 3, weight: 65.0, reps: 8 },
    // Workout Exercise 10: Bench Press (3 sets)
    { workoutExerciseId: weIds[9], setNumber: 1, weight: 60.0, reps: 10 },
    { workoutExerciseId: weIds[9], setNumber: 2, weight: 82.5, reps: 8 },
    { workoutExerciseId: weIds[9], setNumber: 3, weight: 87.5, reps: 5 },
    // Workout Exercise 11: Dumbbell Curl (3 sets)
    { workoutExerciseId: weIds[10], setNumber: 1, weight: 12.0, reps: 12 },
    { workoutExerciseId: weIds[10], setNumber: 2, weight: 14.0, reps: 10 },
    { workoutExerciseId: weIds[10], setNumber: 3, weight: 16.0, reps: 8 },
    // Workout Exercise 12: Tricep Pushdown (2 sets)
    { workoutExerciseId: weIds[11], setNumber: 1, weight: 27.5, reps: 12 },
    { workoutExerciseId: weIds[11], setNumber: 2, weight: 32.5, reps: 10 },
    // Workout Exercise 13: Squat (3 sets)
    { workoutExerciseId: weIds[12], setNumber: 1, weight: 60.0, reps: 10 },
    { workoutExerciseId: weIds[12], setNumber: 2, weight: 105.0, reps: 8 },
    { workoutExerciseId: weIds[12], setNumber: 3, weight: 115.0, reps: 5 },
    // Workout Exercise 14: Deadlift (3 sets)
    { workoutExerciseId: weIds[13], setNumber: 1, weight: 100.0, reps: 6 },
    { workoutExerciseId: weIds[13], setNumber: 2, weight: 130.0, reps: 4 },
    { workoutExerciseId: weIds[13], setNumber: 3, weight: 145.0, reps: 2 },
    // Workout Exercise 15: OHP (3 sets)
    { workoutExerciseId: weIds[14], setNumber: 1, weight: 35.0, reps: 10 },
    { workoutExerciseId: weIds[14], setNumber: 2, weight: 52.5, reps: 7 },
    { workoutExerciseId: weIds[14], setNumber: 3, weight: 57.5, reps: 5 },
    // Workout Exercise 16: Lat Pulldown (2 sets)
    { workoutExerciseId: weIds[15], setNumber: 1, weight: 55.0, reps: 12 },
    { workoutExerciseId: weIds[15], setNumber: 2, weight: 67.5, reps: 8 },
  ]).returning();
  console.log(`Inserted ${insertedSets.length} sets`);

  console.log('Seeding complete!');
}

seed().catch(console.error);
