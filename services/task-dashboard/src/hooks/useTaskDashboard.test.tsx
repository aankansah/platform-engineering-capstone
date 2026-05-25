import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { vi } from 'vitest';
import type { TaskPayload } from '../types';

// Mock the two hooks used inside useTaskDashboard
vi.mock('./useEventsQuery', () => ({
  useEventsQuery: () => ({
    events: [],
    eventsError: null,
    lastUpdated: null,
    prependEvent: vi.fn(),
    refetchEvents: vi.fn(),
  }),
}));

vi.mock('./useCreateTaskMutation', () => ({
  useCreateTaskMutation: () => ({
    isSubmitting: false,
    submitMessage: null,
    submitTask: async (task: TaskPayload) => ({ ...task, taskId: 'mocked' }),
  }),
}));

import { useTaskDashboard } from './useTaskDashboard';

describe('useTaskDashboard', () => {
  it('returns expected shape and can submit a task', async () => {
    const { result } = renderHook(() => useTaskDashboard());

    expect(result.current).toHaveProperty('task');
    expect(typeof result.current.submitTask).toBe('function');

    await act(async () => {
      // call submitTask with a fake form event
      await result.current.submitTask({ preventDefault: () => {} } as unknown as React.FormEvent<HTMLFormElement>);
    });

    // after submit, events remains an array (mocked)
    expect(Array.isArray(result.current.events)).toBe(true);
  });
});
