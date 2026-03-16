"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Simulation = void 0;
class Simulation {
    constructor(initialCitizens, initialBusinesses, initialGovSettings) {
        this.citizens = initialCitizens;
        this.businesses = initialBusinesses;
        this.government = initialGovSettings;
        this.metricsHistory = [];
        this.currentYear = 0;
    }
    runYear() {
        this.currentYear++;
        // 0. Demographics age naturally
        this.citizens.forEach(c => c.age++);
        // 1. Citizens earn wages & Gov collects income tax
        let totalTaxCollected = 0;
        this.citizens.forEach(c => {
            if (c.employmentStatus === 'employed' && c.employerId) {
                const employer = this.businesses.find(b => b.id === c.employerId);
                if (employer) {
                    // Earn wage
                    let grossWage = employer.wageLevel * c.skillLevel; // simple skill multiplier
                    let tax = grossWage * this.government.incomeTaxRate;
                    totalTaxCollected += tax;
                    c.income = grossWage - tax;
                }
                else {
                    c.employmentStatus = 'unemployed';
                    c.income = 0;
                }
            }
            else {
                c.income = 0;
            }
        });
        // 2. Gov distributes welfare & UBI
        this.citizens.forEach(c => {
            c.income += this.government.universalBasicIncome;
            this.government.budget -= this.government.universalBasicIncome;
            if (c.employmentStatus === 'unemployed') {
                // Placeholder welfare
                c.income += this.government.subsidyPolicies / this.citizens.length; // distribute evenly for now
                this.government.budget -= this.government.subsidyPolicies / this.citizens.length;
            }
        });
        this.government.budget += totalTaxCollected;
        // 3. Citizens spend money & Businesses generate revenue
        this.businesses.forEach(b => b.revenue = 0); // Reset revenue
        this.citizens.forEach(c => {
            let disposable = c.income + c.savings;
            let spending = disposable * c.consumptionTendency;
            c.savings = disposable - spending;
            // Randomly distribute spending to businesses for now
            if (this.businesses.length > 0) {
                const b = this.businesses[Math.floor(Math.random() * this.businesses.length)];
                b.revenue += spending;
            }
        });
        // 4. Businesses pay corporate tax, adjust workforce
        this.businesses.forEach(b => {
            let corpTax = b.revenue * this.government.corporateTaxRate;
            b.revenue -= corpTax;
            this.government.budget += corpTax;
            // Basic hiring/firing logic based on profitability
            b.operatingCosts = b.workers.length * b.wageLevel;
            let profit = b.revenue - b.operatingCosts;
            if (profit > b.wageLevel * 2) {
                // Try to hire
                const unemployed = this.citizens.find(c => c.employmentStatus === 'unemployed');
                if (unemployed) {
                    unemployed.employmentStatus = 'employed';
                    unemployed.employerId = b.id;
                    b.workers.push(unemployed.id);
                }
            }
            else if (profit < 0 && b.workers.length > 1) {
                // Fire a worker to save costs
                const firedId = b.workers.pop();
                if (firedId) {
                    const fired = this.citizens.find(c => c.id === firedId);
                    if (fired) {
                        fired.employmentStatus = 'unemployed';
                        fired.employerId = null;
                    }
                }
            }
        });
        // Compute macro indicators
        const metrics = this.calculateMetrics();
        this.metricsHistory.push(metrics);
    }
    calculateMetrics() {
        const employed = this.citizens.filter((c) => c.employmentStatus === 'employed').length;
        const unemploymentRate = 1 - employed / this.citizens.length;
        const incomes = this.citizens.map((c) => c.income).sort((a, b) => a - b);
        const medianIncome = incomes[Math.floor(incomes.length / 2)] || 0;
        let totalGdp = this.businesses.reduce((sum, b) => sum + b.revenue, 0);
        // Gini Index Calculation (approx)
        let sumDiffs = 0;
        for (let i = 0; i < incomes.length; i++) {
            for (let j = 0; j < incomes.length; j++) {
                sumDiffs += Math.abs(incomes[i] - incomes[j]);
            }
        }
        let meanIncome = incomes.reduce((a, b) => a + b, 0) / incomes.length;
        let giniIndex = sumDiffs / (2 * Math.pow(incomes.length, 2) * meanIncome) || 0;
        return {
            year: this.currentYear,
            gdp: totalGdp,
            unemploymentRate,
            medianIncome,
            inflationRate: 0.02, // Placeholder
            governmentBudget: this.government.budget,
            giniIndex: isNaN(giniIndex) ? 0 : giniIndex,
        };
    }
}
exports.Simulation = Simulation;
