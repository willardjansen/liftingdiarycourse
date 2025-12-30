"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateSet,
  deleteSet,
  addSetToExercise,
  deleteWorkoutExercise,
  addExerciseToWorkout,
  createExercise,
  deleteWorkout,
} from "../[workoutId]/actions";

type Exercise = {
  id: number;
  name: string;
};

type SetData = {
  id: number;
  setNumber: number;
  weight: number;
  reps: number;
};

type WorkoutExerciseData = {
  id: number;
  order: number;
  exercise: Exercise;
  sets: SetData[];
};

type WorkoutData = {
  id: number;
  date: string;
  workoutExercises: WorkoutExerciseData[];
};

type LocalSetData = {
  id: number | null;
  localId: string;
  weight: string;
  reps: string;
  isNew: boolean;
};

type LocalExerciseEntry = {
  id: number | null;
  localId: string;
  exerciseId: number | null;
  exerciseName: string;
  sets: LocalSetData[];
  isNew: boolean;
};

export function EditWorkoutForm({
  workout,
  exercises: initialExercises,
}: {
  workout: WorkoutData;
  exercises: Exercise[];
}) {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [isPending, startTransition] = useTransition();
  const [newExerciseName, setNewExerciseName] = useState("");

  // Convert workout data to local state
  const [entries, setEntries] = useState<LocalExerciseEntry[]>(
    workout.workoutExercises.map((we) => ({
      id: we.id,
      localId: crypto.randomUUID(),
      exerciseId: we.exercise.id,
      exerciseName: we.exercise.name,
      sets: we.sets.map((s) => ({
        id: s.id,
        localId: crypto.randomUUID(),
        weight: s.weight.toString(),
        reps: s.reps.toString(),
        isNew: false,
      })),
      isNew: false,
    }))
  );

  const handleUpdateSet = async (
    setId: number,
    weight: string,
    reps: string
  ) => {
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps);

    if (isNaN(weightNum) || isNaN(repsNum)) return;

    startTransition(async () => {
      await updateSet(setId, weightNum, repsNum);
    });
  };

  const handleDeleteSet = async (entryLocalId: string, setId: number) => {
    startTransition(async () => {
      await deleteSet(setId);
      setEntries(
        entries.map((e) =>
          e.localId === entryLocalId
            ? { ...e, sets: e.sets.filter((s) => s.id !== setId) }
            : e
        )
      );
    });
  };

  const handleAddSet = async (entry: LocalExerciseEntry) => {
    if (!entry.id) return;

    const nextSetNumber = entry.sets.length + 1;
    const lastSet = entry.sets[entry.sets.length - 1];
    const defaultWeight = lastSet ? parseFloat(lastSet.weight) || 0 : 0;
    const defaultReps = lastSet ? parseInt(lastSet.reps) || 1 : 1;

    startTransition(async () => {
      const newSet = await addSetToExercise(
        entry.id!,
        nextSetNumber,
        defaultWeight,
        defaultReps
      );

      setEntries(
        entries.map((e) =>
          e.localId === entry.localId
            ? {
                ...e,
                sets: [
                  ...e.sets,
                  {
                    id: newSet.id,
                    localId: crypto.randomUUID(),
                    weight: defaultWeight.toString(),
                    reps: defaultReps.toString(),
                    isNew: false,
                  },
                ],
              }
            : e
        )
      );
    });
  };

  const handleDeleteExercise = async (entryLocalId: string, exerciseId: number) => {
    startTransition(async () => {
      await deleteWorkoutExercise(exerciseId);
      setEntries(entries.filter((e) => e.localId !== entryLocalId));
    });
  };

  const handleAddExercise = () => {
    setEntries([
      ...entries,
      {
        id: null,
        localId: crypto.randomUUID(),
        exerciseId: null,
        exerciseName: "",
        sets: [],
        isNew: true,
      },
    ]);
  };

  const handleSelectExercise = async (
    entryLocalId: string,
    exerciseId: number
  ) => {
    const entry = entries.find((e) => e.localId === entryLocalId);
    if (!entry || !entry.isNew) return;

    const nextOrder = entries.length;

    startTransition(async () => {
      const workoutExercise = await addExerciseToWorkout(
        workout.id,
        exerciseId,
        nextOrder
      );

      // Add a default first set
      const newSet = await addSetToExercise(workoutExercise.id, 1, 0, 1);

      setEntries(
        entries.map((e) =>
          e.localId === entryLocalId
            ? {
                ...e,
                id: workoutExercise.id,
                exerciseId,
                exerciseName:
                  exercises.find((ex) => ex.id === exerciseId)?.name || "",
                isNew: false,
                sets: [
                  {
                    id: newSet.id,
                    localId: crypto.randomUUID(),
                    weight: "0",
                    reps: "1",
                    isNew: false,
                  },
                ],
              }
            : e
        )
      );
    });
  };

  const handleCreateExercise = async () => {
    if (!newExerciseName.trim()) return;

    startTransition(async () => {
      const exercise = await createExercise(newExerciseName.trim());
      setExercises(
        [...exercises, exercise].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewExerciseName("");
    });
  };

  const handleDeleteWorkout = async () => {
    if (!confirm("Are you sure you want to delete this workout?")) return;

    startTransition(async () => {
      await deleteWorkout(workout.id);
      router.push(`/dashboard?date=${workout.date}`);
    });
  };

  const updateLocalSet = (
    entryLocalId: string,
    setLocalId: string,
    field: "weight" | "reps",
    value: string
  ) => {
    setEntries(
      entries.map((e) =>
        e.localId === entryLocalId
          ? {
              ...e,
              sets: e.sets.map((s) =>
                s.localId === setLocalId ? { ...s, [field]: value } : s
              ),
            }
          : e
      )
    );
  };

  const removeNewEntry = (entryLocalId: string) => {
    setEntries(entries.filter((e) => e.localId !== entryLocalId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href={`/dashboard?date=${workout.date}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Button variant="destructive" onClick={handleDeleteWorkout} disabled={isPending}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Workout
        </Button>
      </div>

      {/* Create New Exercise */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Create New Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Exercise name..."
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateExercise()}
            />
            <Button
              variant="secondary"
              onClick={handleCreateExercise}
              disabled={isPending || !newExerciseName.trim()}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Entries */}
      {entries.map((entry, entryIndex) => (
        <Card key={entry.localId}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {entry.isNew
                  ? `Exercise ${entryIndex + 1}`
                  : entry.exerciseName}
              </CardTitle>
              {entry.isNew ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeNewEntry(entry.localId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteExercise(entry.localId, entry.id!)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {entry.isNew && (
              <div>
                <Label>Exercise</Label>
                <Select
                  value={entry.exerciseId?.toString() || ""}
                  onValueChange={(value) =>
                    handleSelectExercise(entry.localId, parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises.map((exercise) => (
                      <SelectItem
                        key={exercise.id}
                        value={exercise.id.toString()}
                      >
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!entry.isNew && (
              <div className="space-y-2">
                <Label>Sets</Label>
                {entry.sets.map((set, setIndex) => (
                  <div key={set.localId} className="flex items-center gap-2">
                    <span className="w-12 text-sm text-muted-foreground">
                      Set {setIndex + 1}
                    </span>
                    <Input
                      type="number"
                      placeholder="Weight"
                      value={set.weight}
                      onChange={(e) =>
                        updateLocalSet(
                          entry.localId,
                          set.localId,
                          "weight",
                          e.target.value
                        )
                      }
                      onBlur={() => {
                        if (set.id) {
                          handleUpdateSet(set.id, set.weight, set.reps);
                        }
                      }}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">lbs</span>
                    <Input
                      type="number"
                      placeholder="Reps"
                      value={set.reps}
                      onChange={(e) =>
                        updateLocalSet(
                          entry.localId,
                          set.localId,
                          "reps",
                          e.target.value
                        )
                      }
                      onBlur={() => {
                        if (set.id) {
                          handleUpdateSet(set.id, set.weight, set.reps);
                        }
                      }}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">reps</span>
                    {entry.sets.length > 1 && set.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSet(entry.localId, set.id!)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSet(entry)}
                  disabled={isPending}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Set
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add Exercise Button */}
      <Button variant="outline" onClick={handleAddExercise}>
        <Plus className="mr-2 h-4 w-4" />
        Add Exercise
      </Button>
    </div>
  );
}
