import { create } from 'zustand';

interface PolicyState {
  incomeTaxRate: number;
  corporateTaxRate: number;
  minimumWage: number;
  universalBasicIncome: number;
  subsidyPolicies: number;
  setPolicy: (key: keyof Omit<PolicyState, 'setPolicy' | 'reset'>, value: number) => void;
  reset: () => void;
}

const defaultPolicies = {
  incomeTaxRate: 0.20,
  corporateTaxRate: 0.15,
  minimumWage: 15,
  universalBasicIncome: 0,
  subsidyPolicies: 0,
};

export const usePolicyStore = create<PolicyState>((set) => ({
  ...defaultPolicies,
  setPolicy: (key, value) => set((state) => ({ ...state, [key]: value })),
  reset: () => set(defaultPolicies),
}));
