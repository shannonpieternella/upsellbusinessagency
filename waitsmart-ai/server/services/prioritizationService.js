// AI Prioritization Service
const waitingListService = require('./waitingListService');

// AI Prioritization Engine
const prioritizationService = {
    calculatePriority(patientId) {
        const patient = waitingListService.getPatientById(patientId);
        if (!patient) return null;
        
        // Multi-factor priority calculation
        const factors = this.getPriorityFactors(patientId);
        
        // Weighted scoring algorithm
        const weights = {
            medicalUrgency: 0.35,
            waitTime: 0.25,
            deteriorationRisk: 0.20,
            socialFactors: 0.10,
            ageRisk: 0.10
        };
        
        let totalScore = 0;
        totalScore += factors.medicalUrgency.score * weights.medicalUrgency;
        totalScore += factors.waitTime.score * weights.waitTime;
        totalScore += factors.deteriorationRisk.score * weights.deteriorationRisk;
        totalScore += factors.socialFactors.score * weights.socialFactors;
        totalScore += factors.ageRisk.score * weights.ageRisk;
        
        // Apply fairness balancing
        const fairnessAdjustment = this.calculateFairnessAdjustment(patient);
        totalScore = Math.min(100, totalScore + fairnessAdjustment);
        
        return {
            patientId,
            priorityScore: Math.round(totalScore),
            category: this.getUrgencyCategory(totalScore),
            factors,
            recommendation: this.generateRecommendation(totalScore, factors),
            lastCalculated: new Date()
        };
    },
    
    getPriorityFactors(patientId) {
        const patient = waitingListService.getPatientById(patientId);
        if (!patient) return null;
        
        return {
            medicalUrgency: this.calculateMedicalUrgency(patient),
            waitTime: this.calculateWaitTimeScore(patient),
            deteriorationRisk: this.calculateDeteriorationRisk(patient),
            socialFactors: this.calculateSocialFactors(patient),
            ageRisk: this.calculateAgeRisk(patient)
        };
    },
    
    calculateMedicalUrgency(patient) {
        // Condition-based urgency scoring
        const conditionScores = {
            'Psychose': 95,
            'Depressie': 75,
            'Angststoornis': 65,
            'PTSD': 80,
            'Bipolaire Stoornis': 85,
            'Dementie': 90,
            'Parkinson': 75,
            'CVA': 85,
            'Oncologie': 95,
            'Dialyse': 90
        };
        
        const baseScore = conditionScores[patient.condition] || 50;
        
        // Adjust for department criticality
        const departmentMultiplier = {
            'GGZ': 1.1,
            'Verpleeghuis': 1.0,
            'Revalidatie': 0.9,
            'Dagbehandeling': 0.95
        };
        
        const score = baseScore * (departmentMultiplier[patient.department] || 1);
        
        return {
            score: Math.min(100, score),
            reasoning: [
                `${patient.condition} heeft een hoge medische prioriteit`,
                patient.department === 'GGZ' ? 'Psychiatrische aandoeningen vereisen snelle interventie' : null
            ].filter(Boolean)
        };
    },
    
    calculateWaitTimeScore(patient) {
        // Progressive scoring based on wait time
        let score = 0;
        const waitDays = patient.waitDays;
        
        if (waitDays > 150) score = 90;
        else if (waitDays > 120) score = 80;
        else if (waitDays > 90) score = 70;
        else if (waitDays > 60) score = 60;
        else if (waitDays > 30) score = 40;
        else score = 20;
        
        // Exponential increase for extreme wait times
        if (waitDays > 180) {
            score = Math.min(100, score + (waitDays - 180) * 0.1);
        }
        
        return {
            score,
            reasoning: [
                `Wacht al ${waitDays} dagen`,
                waitDays > 120 ? 'Ver boven acceptabele wachttijd' : null
            ].filter(Boolean)
        };
    },
    
    calculateDeteriorationRisk(patient) {
        let riskScore = patient.deteriorationRisk * 100;
        
        // Adjust based on condition
        const highRiskConditions = ['Psychose', 'Depressie', 'Dementie', 'CVA'];
        if (highRiskConditions.includes(patient.condition)) {
            riskScore *= 1.2;
        }
        
        // Consider lack of support system
        if (!patient.hasSupport) {
            riskScore *= 1.3;
        }
        
        // Time-based deterioration
        const monthsWaiting = patient.waitDays / 30;
        if (monthsWaiting > 3) {
            riskScore += monthsWaiting * 2;
        }
        
        return {
            score: Math.min(100, riskScore),
            reasoning: [
                riskScore > 70 ? 'Hoog risico op verslechtering' : 'Stabiele situatie',
                !patient.hasSupport ? 'Geen support systeem aanwezig' : null,
                monthsWaiting > 3 ? 'Langdurig wachten verhoogt risico' : null
            ].filter(Boolean)
        };
    },
    
    calculateSocialFactors(patient) {
        let score = 50; // Base score
        
        // Support system
        if (!patient.hasSupport) {
            score += 30;
        }
        
        // Recent contact (isolation risk)
        const daysSinceContact = (Date.now() - patient.lastContact) / (1000 * 60 * 60 * 24);
        if (daysSinceContact > 60) {
            score += 20;
        } else if (daysSinceContact > 30) {
            score += 10;
        }
        
        return {
            score: Math.min(100, score),
            reasoning: [
                !patient.hasSupport ? 'Geen mantelzorger of familie support' : null,
                daysSinceContact > 30 ? 'Lange tijd geen contact gehad' : null
            ].filter(Boolean)
        };
    },
    
    calculateAgeRisk(patient) {
        let score = 0;
        
        // Age-based risk calculation
        if (patient.age < 18) {
            score = 80; // Children priority
        } else if (patient.age > 75) {
            score = 70;
        } else if (patient.age > 65) {
            score = 60;
        } else if (patient.age < 25) {
            score = 55; // Young adults
        } else {
            score = 40;
        }
        
        // Condition-age interaction
        if (patient.condition === 'Dementie' && patient.age > 70) {
            score += 20;
        }
        
        return {
            score: Math.min(100, score),
            reasoning: [
                patient.age < 18 ? 'Minderjarige patiënt' : null,
                patient.age > 75 ? 'Kwetsbare oudere' : null
            ].filter(Boolean)
        };
    },
    
    calculateFairnessAdjustment(patient) {
        // Ensure equitable access across demographics
        let adjustment = 0;
        
        // Long waiters get progressive boost
        if (patient.waitDays > 150) {
            adjustment += 5;
        }
        
        // Prevent discrimination
        // In real implementation, this would consider protected characteristics
        
        return adjustment;
    },
    
    getUrgencyCategory(score) {
        if (score >= 80) return 'critical';
        if (score >= 60) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    },
    
    generateRecommendation(score, factors) {
        const recommendations = [];
        
        if (score >= 80) {
            recommendations.push('Direct plannen voor behandeling');
            recommendations.push('Contact opnemen binnen 24 uur');
        } else if (score >= 60) {
            recommendations.push('Plannen binnen 2 weken');
            recommendations.push('Wekelijkse monitoring instellen');
        } else if (score >= 40) {
            recommendations.push('Reguliere planning handhaven');
            recommendations.push('Maandelijkse check-in');
        } else {
            recommendations.push('Standaard wachtlijst procedure');
        }
        
        // Specific recommendations based on factors
        if (factors.deteriorationRisk.score > 70) {
            recommendations.push('Extra monitoring voor deterioratie risico');
        }
        
        if (!factors.socialFactors.score > 70) {
            recommendations.push('Sociale ondersteuning regelen');
        }
        
        return recommendations;
    },
    
    batchPrioritize(patientIds) {
        return patientIds.map(id => this.calculatePriority(id))
            .filter(Boolean)
            .sort((a, b) => b.priorityScore - a.priorityScore);
    },
    
    suggestOptimalScheduling(capacity) {
        // Get all waiting patients
        const patients = waitingListService.getWaitingList();
        
        // Calculate priorities for all
        const prioritized = patients.map(p => ({
            ...p,
            priority: this.calculatePriority(p.id)
        })).sort((a, b) => b.priority.priorityScore - a.priority.priorityScore);
        
        // Match to available capacity
        const scheduled = [];
        let remainingCapacity = capacity;
        
        for (const patient of prioritized) {
            if (remainingCapacity > 0) {
                scheduled.push({
                    patientId: patient.id,
                    priorityScore: patient.priority.priorityScore,
                    recommendedSlot: this.findOptimalSlot(patient),
                    reasoning: patient.priority.recommendation
                });
                remainingCapacity--;
            }
        }
        
        return {
            scheduled,
            utilization: ((capacity - remainingCapacity) / capacity * 100).toFixed(1),
            highPriorityScheduled: scheduled.filter(s => s.priorityScore >= 80).length
        };
    },
    
    findOptimalSlot(patient) {
        // In real implementation, this would check actual calendar
        const urgencyCategory = this.getUrgencyCategory(patient.priority.priorityScore);
        
        const slotMapping = {
            'critical': 'Morgen 09:00',
            'high': 'Deze week',
            'medium': 'Volgende week',
            'low': 'Binnen 30 dagen'
        };
        
        return slotMapping[urgencyCategory];
    }
};

module.exports = prioritizationService;