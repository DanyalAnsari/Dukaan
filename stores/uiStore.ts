import { createStore } from "zustand/vanilla";

export type UIState = {
  setupFormActiveStep: number;
};

export type UIActions = {
  setSetupFormActiveStep: (step: number) => void;
};

export type UIStore = UIState & UIActions;

export const defaultInitState: UIState = {
  setupFormActiveStep: 0,
};

export const createUIStore = (initState: UIState = defaultInitState) => {
  return createStore<UIStore>()((set) => ({
    ...initState,
    setSetupFormActiveStep: (step: number) =>
      set(() => ({ setupFormActiveStep: step })),
  }));
};
