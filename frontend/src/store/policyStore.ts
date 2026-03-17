import { create } from 'zustand';

export interface EconomicMetrics {
  year: number;
  gdp: number;
  unemploymentRate: number;
  medianIncome: number;
  inflationRate: number;
  governmentBudget: number;
  giniIndex: number;
}

export interface ConfidenceBandPoint {
  year: number;
  gdpMean: number;
  gdpMin: number;
  gdpMax: number;
  unemploymentMean: number;
  unemploymentMin: number;
  unemploymentMax: number;
  incomeMean: number;
  incomeMin: number;
  incomeMax: number;
}

export interface PolicyConfig {
  incomeTaxRate: number;
  corporateTaxRate: number;
  minimumWage: number;
  universalBasicIncome: number;
  subsidyPolicies: number;
}

interface PolicyState extends PolicyConfig {
  // Current simulation results
  simulationResults: EconomicMetrics[];
  confidenceBand: ConfidenceBandPoint[];
  lastRunId: string | null;
  simulationsCount: number;

  // Baseline for comparison
  baselineResults: EconomicMetrics[];
  baselineConfidenceBand: ConfidenceBandPoint[];
  baselinePolicies: PolicyConfig | null;

  // Actions
  setPolicy: (key: keyof PolicyConfig, value: number) => void;
  setResults: (results: EconomicMetrics[], runId: string, band: ConfidenceBandPoint[]) => void;
  saveBaseline: () => void;
  clearBaseline: () => void;
  applyPreset: (preset: PolicyConfig) => void;
  reset: () => void;
}

const defaultPolicies: PolicyConfig = {
  incomeTaxRate: 0.20,
  corporateTaxRate: 0.15,
  minimumWage: 15,
  universalBasicIncome: 0,
  subsidyPolicies: 0,
};

export const PRESETS: Record<string, { label: string; emoji: string; description: string; policies: PolicyConfig }> = {
  nordic: {
    label: 'Nordic Model',
    emoji: '🇸🇪',
    description: 'High taxes, strong safety net',
    policies: { incomeTaxRate: 0.45, corporateTaxRate: 0.20, minimumWage: 22, universalBasicIncome: 8000, subsidyPolicies: 40000 },
  },
  reaganomics: {
    label: 'Reaganomics',
    emoji: '📉',
    description: 'Low taxes, low intervention',
    policies: { incomeTaxRate: 0.28, corporateTaxRate: 0.15, minimumWage: 7, universalBasicIncome: 0, subsidyPolicies: 5000 },
  },
  ubi: {
    label: 'UBI Utopia',
    emoji: '🌍',
    description: 'Universal basic income focus',
    policies: { incomeTaxRate: 0.35, corporateTaxRate: 0.25, minimumWage: 15, universalBasicIncome: 24000, subsidyPolicies: 20000 },
  },
  laissezfaire: {
    label: 'Laissez-Faire',
    emoji: '🏪',
    description: 'Minimal government role',
    policies: { incomeTaxRate: 0.15, corporateTaxRate: 0.08, minimumWage: 0, universalBasicIncome: 0, subsidyPolicies: 0 },
  },
  mixed: {
    label: 'Mixed Economy',
    emoji: '⚖️',
    description: 'Balanced approach',
    policies: { incomeTaxRate: 0.30, corporateTaxRate: 0.20, minimumWage: 15, universalBasicIncome: 4000, subsidyPolicies: 15000 },
  },
};

export const usePolicyStore = create<PolicyState>((set, get) => ({
  ...defaultPolicies,
  simulationResults: [],
  confidenceBand: [],
  lastRunId: null,
  simulationsCount: 0,
  baselineResults: [],
  baselineConfidenceBand: [],
  baselinePolicies: null,

  setPolicy: (key, value) => set((state) => ({ ...state, [key]: value })),

  setResults: (results, runId, band) =>
    set((state) => ({
      simulationResults: results,
      confidenceBand: band,
      lastRunId: runId,
      simulationsCount: state.simulationsCount + 1,
    })),

  saveBaseline: () => {
    const state = get();
    set({
      baselineResults: state.simulationResults,
      baselineConfidenceBand: state.confidenceBand,
      baselinePolicies: {
        incomeTaxRate: state.incomeTaxRate,
        corporateTaxRate: state.corporateTaxRate,
        minimumWage: state.minimumWage,
        universalBasicIncome: state.universalBasicIncome,
        subsidyPolicies: state.subsidyPolicies,
      },
    });
  },

  clearBaseline: () =>
    set({ baselineResults: [], baselineConfidenceBand: [], baselinePolicies: null }),

  applyPreset: (preset) => set({ ...preset }),

  reset: () => set({ ...defaultPolicies }),
}));
