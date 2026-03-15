import { create } from 'zustand';

export const useTarsStore = create((set, get) => ({
  // ── Current synthesis job ───────────────────────────────────────────────
  currentDocId:    null,
  currentRunbookId: null,
  agentStates: {
    ingestion:           { status: 'idle', message: '', logs: [] },
    step_extractor:      { status: 'idle', message: '', logs: [] },
    dependency_analyzer: { status: 'idle', message: '', logs: [] },
    param_mapper:        { status: 'idle', message: '', logs: [] },
  },
  synthesisComplete: false,
  synthesizedRunbook: null,

  // ── Validation ─────────────────────────────────────────────────────────
  validationResult: null,
  validating: false,

  // ── Execution ──────────────────────────────────────────────────────────
  executionState: null,   // { runId, status, steps[], currentStepId }
  executing: false,

  // ── Actions ────────────────────────────────────────────────────────────
  setCurrentDocId: (id) => set({ currentDocId: id }),
  setCurrentRunbookId: (id) => set({ currentRunbookId: id }),

  resetPipeline: () => set({
    currentDocId: null,
    currentRunbookId: null,
    synthesisComplete: false,
    synthesizedRunbook: null,
    validationResult: null,
    executionState: null,
    agentStates: {
      ingestion:           { status: 'idle', message: '', logs: [] },
      step_extractor:      { status: 'idle', message: '', logs: [] },
      dependency_analyzer: { status: 'idle', message: '', logs: [] },
      param_mapper:        { status: 'idle', message: '', logs: [] },
    },
  }),

  setAgentStatus: ({ agent, status, message, ...rest }) =>
    set(state => ({
      agentStates: {
        ...state.agentStates,
        [agent]: { ...state.agentStates[agent], status, message, ...rest },
      },
    })),

  appendAgentLog: ({ agent, message }) =>
    set(state => ({
      agentStates: {
        ...state.agentStates,
        [agent]: {
          ...state.agentStates[agent],
          logs: [...(state.agentStates[agent]?.logs || []), message].slice(-20),
        },
      },
    })),

  setSynthesisComplete: (runbook) =>
    set({ synthesisComplete: true, synthesizedRunbook: runbook }),

  setValidationResult: (result) => set({ validationResult: result }),
  setValidating: (v) => set({ validating: v }),

  initExecution: (runId, totalSteps) =>
    set({ executing: true, executionState: { runId, totalSteps, steps: [], currentStepId: null, status: 'RUNNING' } }),

  updateExecutionStep: (stepData) =>
    set(state => {
      if (!state.executionState) return {};
      const steps = [...state.executionState.steps];
      const idx = steps.findIndex(s => s.stepId === stepData.stepId);
      if (idx >= 0) steps[idx] = { ...steps[idx], ...stepData };
      else steps.push(stepData);
      return { executionState: { ...state.executionState, steps, currentStepId: stepData.stepId } };
    }),

  completeExecution: (data) =>
    set(state => ({
      executing: false,
      executionState: { ...state.executionState, ...data, status: data.status },
    })),
}));
