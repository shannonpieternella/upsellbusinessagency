// Analytics and Forecasting Service
const waitingListService = require('./waitingListService');

const analyticsService = {
    generateForecast(months = 6) {
        // Get current metrics
        const currentMetrics = waitingListService.getDashboardMetrics();
        const baseValue = currentMetrics.totalWaiting.value;
        
        // Generate forecast data
        const forecast = [];
        const monthNames = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        
        // Historical trend analysis (simulated)
        const seasonalFactors = {
            0: 1.15,  // January - post holiday surge
            1: 1.12,  // February
            2: 1.08,  // March
            3: 1.02,  // April
            4: 0.98,  // May
            5: 0.95,  // June
            6: 0.92,  // July - summer dip
            7: 0.94,  // August
            8: 1.05,  // September - back to school
            9: 1.08,  // October
            10: 1.10, // November
            11: 1.05  // December
        };
        
        // Generate predictions
        for (let i = 0; i < months; i++) {
            const monthIndex = (currentMonth + i) % 12;
            const monthName = monthNames[monthIndex];
            
            // Base growth rate
            const growthRate = 0.02; // 2% monthly growth
            const seasonalMultiplier = seasonalFactors[monthIndex];
            
            // Without intervention
            const withoutIntervention = Math.round(
                baseValue * Math.pow(1 + growthRate, i) * seasonalMultiplier
            );
            
            // With AI optimization
            const reductionRate = 0.03; // 3% reduction per month
            const withIntervention = Math.round(
                baseValue * Math.pow(1 - reductionRate, i) * seasonalMultiplier * 0.9
            );
            
            forecast.push({
                month: monthName,
                withoutIntervention,
                withIntervention,
                potentialSavings: withoutIntervention - withIntervention,
                capacityNeeded: Math.round(withIntervention / 30), // Daily capacity
                recommendedActions: this.generateMonthlyRecommendations(monthIndex, withIntervention)
            });
        }
        
        return {
            forecast,
            summary: {
                projectedGrowth: `${((forecast[months-1].withoutIntervention / baseValue - 1) * 100).toFixed(1)}%`,
                potentialReduction: `${((1 - forecast[months-1].withIntervention / forecast[months-1].withoutIntervention) * 100).toFixed(1)}%`,
                totalPatientsSaved: forecast.reduce((sum, f) => sum + f.potentialSavings, 0)
            },
            insights: this.generateForecastInsights(forecast)
        };
    },
    
    getTrends(period = '6months') {
        // Generate historical trend data
        const months = period === '3months' ? 3 : period === '6months' ? 6 : 12;
        const trends = {
            waitingList: [],
            urgentCases: [],
            averageWaitTime: [],
            noShowRate: [],
            satisfactionScore: []
        };
        
        const monthNames = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        
        // Generate historical data
        for (let i = months - 1; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            const month = monthNames[monthIndex];
            
            // Simulated historical data with realistic patterns
            trends.waitingList.push({
                month,
                value: Math.round(2847 + (i * 50) + Math.random() * 100)
            });
            
            trends.urgentCases.push({
                month,
                value: Math.round(142 + (i * 8) + Math.random() * 20)
            });
            
            trends.averageWaitTime.push({
                month,
                value: Math.round(73 + (i * 3) + Math.random() * 10)
            });
            
            trends.noShowRate.push({
                month,
                value: Math.round(15 + (i * 0.5) + Math.random() * 3)
            });
            
            trends.satisfactionScore.push({
                month,
                value: Math.round(75 - (i * 2) + Math.random() * 5)
            });
        }
        
        return {
            trends,
            insights: this.generateTrendInsights(trends),
            anomalies: this.detectAnomalies(trends)
        };
    },
    
    generateExecutiveSummary() {
        const metrics = waitingListService.getDashboardMetrics();
        const forecast = this.generateForecast(3);
        const trends = this.getTrends('3months');
        
        return {
            period: 'December 2024',
            highlights: [
                {
                    metric: 'Wachtlijst Reductie',
                    value: '-12%',
                    impact: 'positive',
                    description: '342 minder patiënten dan vorige maand'
                },
                {
                    metric: 'Data Kwaliteit',
                    value: '94%',
                    impact: 'positive',
                    description: 'Verbeterd van 79% drie maanden geleden'
                },
                {
                    metric: 'Urgente Cases',
                    value: '142',
                    impact: 'warning',
                    description: '27 nieuwe cases vandaag - actie vereist'
                }
            ],
            keyMetrics: {
                totalWaiting: metrics.totalWaiting.value,
                averageWaitTime: metrics.averageWaitTime.value,
                dataQuality: metrics.dataQuality.value,
                monthlyAdmissions: Math.round(metrics.totalWaiting.value / 3),
                capacityUtilization: '87%'
            },
            achievements: [
                'Gemiddelde wachttijd verminderd met 8 dagen',
                'Data accuraatheid verhoogd naar 94%',
                'Succesvolle implementatie AI prioritering',
                'ROI van €380,000 in Q4'
            ],
            recommendations: [
                {
                    priority: 'high',
                    action: 'Verhoog GGZ capaciteit met 15%',
                    impact: '~50 urgente cases sneller geholpen',
                    deadline: 'Januari 2025'
                },
                {
                    priority: 'medium',
                    action: 'Implementeer automated reminders',
                    impact: 'Verwachte no-show reductie van 30%',
                    deadline: 'Februari 2025'
                },
                {
                    priority: 'low',
                    action: 'Start regionale samenwerking pilot',
                    impact: 'Potentieel 200 transfers per maand',
                    deadline: 'Maart 2025'
                }
            ],
            forecast: {
                threeMonthOutlook: forecast.summary,
                criticalMetrics: {
                    expectedGrowth: forecast.summary.projectedGrowth,
                    capacityGap: '120 slots per maand',
                    budgetImpact: '€2.1M indien geen actie'
                }
            }
        };
    },
    
    generateMonthlyRecommendations(monthIndex, projectedWaiting) {
        const recommendations = [];
        
        // Seasonal recommendations
        if (monthIndex === 0 || monthIndex === 1) {
            recommendations.push('Verhoog wintercapaciteit voor GGZ');
            recommendations.push('Extra aandacht voor seizoensgebonden depressie');
        }
        
        if (monthIndex >= 6 && monthIndex <= 8) {
            recommendations.push('Benut vakantieperiode voor inhaalslag');
            recommendations.push('Plan electieve procedures');
        }
        
        // Volume-based recommendations
        if (projectedWaiting > 3000) {
            recommendations.push('Activeer overflow protocol');
            recommendations.push('Start regionale samenwerking');
        }
        
        return recommendations;
    },
    
    generateForecastInsights(forecast) {
        const insights = [];
        
        // Growth pattern detection
        const growthRate = (forecast[forecast.length-1].withoutIntervention / forecast[0].withoutIntervention - 1) * 100;
        if (growthRate > 10) {
            insights.push({
                type: 'warning',
                message: `Wachtlijst groeit met ${growthRate.toFixed(1)}% zonder interventie`,
                action: 'Directe capaciteitsuitbreiding noodzakelijk'
            });
        }
        
        // Seasonal patterns
        const winterMonths = forecast.filter(f => ['Dec', 'Jan', 'Feb'].includes(f.month));
        if (winterMonths.length > 0) {
            insights.push({
                type: 'info',
                message: 'Winterpiek verwacht in GGZ aanvragen',
                action: 'Plan preventieve capaciteit'
            });
        }
        
        // Optimization potential
        const totalSavings = forecast.reduce((sum, f) => sum + f.potentialSavings, 0);
        insights.push({
            type: 'success',
            message: `AI optimalisatie kan ${totalSavings} patiënten sneller helpen`,
            action: 'Implementeer voorgestelde maatregelen'
        });
        
        return insights;
    },
    
    generateTrendInsights(trends) {
        const insights = [];
        
        // Analyze waiting list trend
        const waitingListTrend = this.calculateTrendDirection(trends.waitingList);
        insights.push({
            metric: 'Wachtlijst',
            trend: waitingListTrend,
            interpretation: waitingListTrend === 'decreasing' ? 
                'Positieve trend door AI implementatie' : 
                'Aandacht nodig voor capaciteitsuitbreiding'
        });
        
        // Analyze urgent cases
        const urgentTrend = this.calculateTrendDirection(trends.urgentCases);
        if (urgentTrend === 'increasing') {
            insights.push({
                metric: 'Urgente Cases',
                trend: urgentTrend,
                interpretation: 'Stijgende trend vereist directe actie',
                severity: 'high'
            });
        }
        
        // Satisfaction correlation
        const satisfactionTrend = this.calculateTrendDirection(trends.satisfactionScore);
        insights.push({
            metric: 'Patiënttevredenheid',
            trend: satisfactionTrend,
            interpretation: satisfactionTrend === 'increasing' ? 
                'Verbeterde communicatie werkt' : 
                'Focus op patiënt ervaring nodig'
        });
        
        return insights;
    },
    
    detectAnomalies(trends) {
        const anomalies = [];
        
        // Simple anomaly detection based on standard deviation
        Object.entries(trends).forEach(([metric, values]) => {
            const numbers = values.map(v => v.value);
            const mean = numbers.reduce((a, b) => a + b) / numbers.length;
            const stdDev = Math.sqrt(
                numbers.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / numbers.length
            );
            
            values.forEach((point, index) => {
                if (Math.abs(point.value - mean) > 2 * stdDev) {
                    anomalies.push({
                        metric,
                        month: point.month,
                        value: point.value,
                        expectedRange: `${Math.round(mean - stdDev)} - ${Math.round(mean + stdDev)}`,
                        severity: Math.abs(point.value - mean) > 3 * stdDev ? 'high' : 'medium'
                    });
                }
            });
        });
        
        return anomalies;
    },
    
    calculateTrendDirection(dataPoints) {
        if (dataPoints.length < 2) return 'stable';
        
        // Simple linear regression
        const n = dataPoints.length;
        const sumX = dataPoints.reduce((sum, _, i) => sum + i, 0);
        const sumY = dataPoints.reduce((sum, p) => sum + p.value, 0);
        const sumXY = dataPoints.reduce((sum, p, i) => sum + i * p.value, 0);
        const sumX2 = dataPoints.reduce((sum, _, i) => sum + i * i, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        
        if (slope > 0.5) return 'increasing';
        if (slope < -0.5) return 'decreasing';
        return 'stable';
    },
    
    generateCapacityRecommendations(currentCapacity, waitingList) {
        const optimalCapacity = Math.ceil(waitingList / 60); // Target 60 days wait
        const gap = optimalCapacity - currentCapacity;
        
        return {
            currentCapacity,
            optimalCapacity,
            gap,
            recommendations: [
                gap > 50 ? 'Urgent: Verhoog capaciteit met 20%' : null,
                gap > 20 ? 'Plan geleidelijke uitbreiding' : null,
                gap < 0 ? 'Overcapaciteit - optimaliseer planning' : null
            ].filter(Boolean),
            estimatedCost: gap * 50000, // €50k per FTE
            expectedROI: gap * 80000 // €80k value per FTE
        };
    }
};

module.exports = analyticsService;