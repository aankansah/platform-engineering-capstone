type TaskPayload = Record<string, any>;

function validateTask(payload: TaskPayload) {
  if (!payload) return { valid: false, reason: 'missing body' };
  if (typeof payload.name !== 'string' || payload.name.trim() === '') {
    return { valid: false, reason: 'name is required' };
  }
  // priority can be optional but if present should be a string
  if (payload.priority && typeof payload.priority !== 'string') {
    return { valid: false, reason: 'priority must be a string' };
  }
  return { valid: true };
}

export { validateTask };
