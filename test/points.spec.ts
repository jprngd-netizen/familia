import { describe, it, expect } from 'vitest';

type Task = { id: string; points: number; completed: boolean };

type Child = { id: string; points: number; tasks: Task[] };

function toggleTask(child: Child, taskId: string): Child {
  const tasks = child.tasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t));
  const task = child.tasks.find(t => t.id === taskId);
  if (!task) return { ...child, tasks };

  // Matches App.tsx fixed logic: if it WAS completed, we're unchecking now.
  if (task.completed) {
    return { ...child, tasks, points: Math.max(0, child.points - task.points) };
  }
  return { ...child, tasks, points: child.points + task.points };
}

describe('task points logic', () => {
  it('adds points when completing an incomplete task', () => {
    const child: Child = {
      id: 'c1',
      points: 10,
      tasks: [{ id: 't1', points: 5, completed: false }],
    };
    const updated = toggleTask(child, 't1');
    expect(updated.points).toBe(15);
    expect(updated.tasks[0].completed).toBe(true);
  });

  it('subtracts points when unchecking a completed task (not below 0)', () => {
    const child: Child = {
      id: 'c1',
      points: 3,
      tasks: [{ id: 't1', points: 5, completed: true }],
    };
    const updated = toggleTask(child, 't1');
    expect(updated.points).toBe(0);
    expect(updated.tasks[0].completed).toBe(false);
  });
});
