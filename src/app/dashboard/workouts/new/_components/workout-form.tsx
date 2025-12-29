"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Save } from "lucide-react";

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
  createWorkout,
  addExerciseToWorkout,
  addSet,
  completeWorkout,
  createExercise,
} from "../actions";

type Exercise = {
  id: number;
  name: string;
};

type SetData = {
  id: string;
  weight: string;
  reps: string;
};

type ExerciseEntry = {
  id: string;
  exerciseId: number | null;
  exerciseName: string;
  sets: SetData[];
};

export function WorkoutForm({
  date,
  exercises: initialExercises,
}: {
  date: string;
  exercises: Exercise[];
}) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [isPending, startTransition] = useTransition();
  const [newExerciseName, setNewExerciseName] = useState("");

  const addExerciseEntry = () => {
    setEntries([
      ...entries,
      {
        id: crypto.randomUUID(),
        exerciseId: null,
        exerciseName: "",
        sets: [{ id: crypto.randomUUID(), weight: "", reps: "" }],
      },
    ]);
  };

  const removeExerciseEntry = (entryId: string) => {
    setEntries(entries.filter((e) => e.id !== entryId));
  };

  const updateExercise = (entryId: string, exerciseId: number) => {
    setEntries(
      entries.map((e) =>
        e.id === entryId
          ? {
              ...e,
              exerciseId,
              exerciseName:
                exercises.find((ex) => ex.id === exerciseId)?.name || "",
            }
          : e
      )
    );
  };

  const addSetToEntry = (entryId: string) => {
    setEntries(
      entries.map((e) =>
        e.id === entryId
          ? {
              ...e,
              sets: [...e.sets, { id: crypto.randomUUID(), weight: "", reps: "" }],
            }
          : e
      )
    );
  };

  const removeSet = (entryId: string, setId: string) => {
    setEntries(
      entries.map((e) =>
        e.id === entryId
          ? { ...e, sets: e.sets.filter((s) => s.id !== setId) }
          : e
      )
    );
  };

  const updateSet = (
    entryId: string,
    setId: string,
    field: "weight" | "reps",
    value: string
  ) => {
    setEntries(
      entries.map((e) =>
        e.id === entryId
          ? {
              ...e,
              sets: e.sets.map((s) =>
                s.id === setId ? { ...s, [field]: value } : s
              ),
            }
          : e
      )
    );
  };

  const handleCreateExercise = async () => {
    if (!newExerciseName.trim()) return;

    startTransition(async () => {
      const exercise = await createExercise(newExerciseName.trim());
      setExercises([...exercises, exercise].sort((a, b) =>
        a.name.localeCompare(b.name)
      ));
      setNewExerciseName("");
    });
  };

  const handleSave = async () => {
    // Validate all entries
    const validEntries = entries.filter(
      (e) =>
        e.exerciseId &&
        e.sets.length > 0 &&
        e.sets.every((s) => s.weight && s.reps)
    );

    if (validEntries.length === 0) {
      return;
    }

    startTransition(async () => {
      // Create the workout
      const workout = await createWorkout(date);

      // Add each exercise and its sets
      for (let i = 0; i < validEntries.length; i++) {
        const entry = validEntries[i];
        const workoutExercise = await addExerciseToWorkout(
          workout.id,
          entry.exerciseId!,
          i + 1
        );

        for (let j = 0; j < entry.sets.length; j++) {
          const set = entry.sets[j];
          await addSet(
            workoutExercise.id,
            j + 1,
            parseFloat(set.weight),
            parseInt(set.reps)
          );
        }
      }

      // Complete and redirect
      await completeWorkout(workout.id, date);
    });
  };

  return (
    <div className="space-y-6">
      {/* Add New Exercise */}
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
        <Card key={entry.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Exercise {entryIndex + 1}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeExerciseEntry(entry.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Exercise</Label>
              <Select
                value={entry.exerciseId?.toString() || ""}
                onValueChange={(value) =>
                  updateExercise(entry.id, parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id.toString()}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sets</Label>
              {entry.sets.map((set, setIndex) => (
                <div key={set.id} className="flex items-center gap-2">
                  <span className="w-12 text-sm text-muted-foreground">
                    Set {setIndex + 1}
                  </span>
                  <Input
                    type="number"
                    placeholder="Weight"
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(entry.id, set.id, "weight", e.target.value)
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">lbs</span>
                  <Input
                    type="number"
                    placeholder="Reps"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(entry.id, set.id, "reps", e.target.value)
                    }
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">reps</span>
                  {entry.sets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSet(entry.id, set.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSetToEntry(entry.id)}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Set
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={addExerciseEntry}>
          <Plus className="mr-2 h-4 w-4" />
          Add Exercise
        </Button>

        {entries.length > 0 && (
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Saving..." : "Save Workout"}
          </Button>
        )}
      </div>
    </div>
  );
}
