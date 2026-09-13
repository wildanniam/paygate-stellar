// A local illustration only. This module deliberately has no network/wallet API.
export const INITIAL_SAMPLE = { run: 0, step: 'idle', credited: false };

export function createLandingPilotSimulation(onChange, clock = globalThis) {
  let state = { ...INITIAL_SAMPLE };
  let disposed = false;
  const timers = new Set();

  function emit(step, credited = state.credited) {
    state = { ...state, step, credited };
    onChange(state);
  }

  function later(fn, delay) {
    const run = state.run;
    const timer = clock.setTimeout(() => {
      timers.delete(timer);
      if (!disposed && state.run === run) fn();
    }, delay);
    timers.add(timer);
  }

  function cancel() {
    timers.forEach((timer) => clock.clearTimeout(timer));
    timers.clear();
  }

  return {
    get state() { return state; },
    request() {
      if (disposed || state.step !== 'idle') return;
      emit('requesting');
      later(() => emit('required'), 900);
    },
    pay() {
      if (disposed || state.step !== 'required') return;
      emit('verifying');
      later(() => {
        emit('credited', true);
        later(() => emit('forwarding'), 900);
        later(() => emit('returning'), 2100);
        later(() => emit('complete'), 3400);
      }, 1200);
    },
    reset() {
      if (disposed) return;
      cancel();
      state = { ...INITIAL_SAMPLE, run: state.run + 1 };
      onChange(state);
    },
    dispose() { disposed = true; cancel(); },
  };
}
