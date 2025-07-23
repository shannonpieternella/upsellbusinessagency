// Regional Coordination Service
const coordinationService = {
    // Regional hospital network data
    hospitals: [
        {
            id: 'UMC-UTR',
            name: 'UMC Utrecht',
            location: { lat: 52.0907, lng: 5.1214 },
            departments: ['GGZ', 'Verpleeghuis', 'Revalidatie', 'Dagbehandeling'],
            capacity: {
                total: 500,
                used: 425,
                available: 75
            },
            averageWaitTime: 67,
            specialties: ['Psychiatrie', 'Neurologie', 'Geriatrie'],
            acceptsTransfers: true
        },
        {
            id: 'DIA-UTR',
            name: 'Diakonessenhuis',
            location: { lat: 52.0853, lng: 5.1493 },
            departments: ['GGZ', 'Revalidatie', 'Dagbehandeling'],
            capacity: {
                total: 300,
                used: 135,
                available: 165
            },
            averageWaitTime: 32,
            specialties: ['Psychiatrie', 'Revalidatie'],
            acceptsTransfers: true
        },
        {
            id: 'ANT-UTR',
            name: 'St. Antonius',
            location: { lat: 52.0789, lng: 5.1468 },
            departments: ['Verpleeghuis', 'Revalidatie'],
            capacity: {
                total: 400,
                used: 380,
                available: 20
            },
            averageWaitTime: 89,
            specialties: ['Geriatrie', 'Revalidatie'],
            acceptsTransfers: true
        },
        {
            id: 'MEA-AMF',
            name: 'Meander MC',
            location: { lat: 52.1560, lng: 5.3878 },
            departments: ['GGZ', 'Verpleeghuis', 'Dagbehandeling'],
            capacity: {
                total: 350,
                used: 182,
                available: 168
            },
            averageWaitTime: 41,
            specialties: ['Psychiatrie', 'Geriatrie'],
            acceptsTransfers: true
        }
    ],
    
    getRegionalCapacity() {
        // Calculate regional overview
        const totalCapacity = this.hospitals.reduce((sum, h) => sum + h.capacity.total, 0);
        const totalUsed = this.hospitals.reduce((sum, h) => sum + h.capacity.used, 0);
        const totalAvailable = this.hospitals.reduce((sum, h) => sum + h.capacity.available, 0);
        
        const byDepartment = {};
        this.hospitals.forEach(hospital => {
            hospital.departments.forEach(dept => {
                if (!byDepartment[dept]) {
                    byDepartment[dept] = {
                        totalCapacity: 0,
                        available: 0,
                        hospitals: []
                    };
                }
                byDepartment[dept].totalCapacity += Math.floor(hospital.capacity.total / hospital.departments.length);
                byDepartment[dept].available += Math.floor(hospital.capacity.available / hospital.departments.length);
                byDepartment[dept].hospitals.push({
                    name: hospital.name,
                    available: Math.floor(hospital.capacity.available / hospital.departments.length),
                    waitTime: hospital.averageWaitTime
                });
            });
        });
        
        return {
            summary: {
                totalCapacity,
                totalUsed,
                totalAvailable,
                utilizationRate: ((totalUsed / totalCapacity) * 100).toFixed(1) + '%',
                criticalHospitals: this.hospitals.filter(h => 
                    (h.capacity.used / h.capacity.total) > 0.9
                ).length
            },
            hospitals: this.hospitals.map(h => ({
                ...h,
                utilizationRate: ((h.capacity.used / h.capacity.total) * 100).toFixed(1) + '%',
                status: this.getCapacityStatus(h.capacity.used / h.capacity.total)
            })),
            byDepartment,
            recommendations: this.generateRegionalRecommendations()
        };
    },
    
    generateTransferSuggestions(fromHospitalId, patientCount = 10) {
        const fromHospital = this.hospitals.find(h => h.id === fromHospitalId);
        if (!fromHospital) return null;
        
        // Find suitable transfer destinations
        const suggestions = [];
        
        this.hospitals.forEach(toHospital => {
            if (toHospital.id === fromHospitalId) return;
            
            // Check if hospitals share departments
            const sharedDepartments = fromHospital.departments.filter(d => 
                toHospital.departments.includes(d)
            );
            
            if (sharedDepartments.length === 0) return;
            
            // Calculate transfer benefit
            const waitTimeDiff = fromHospital.averageWaitTime - toHospital.averageWaitTime;
            const capacityAvailable = toHospital.capacity.available;
            
            if (waitTimeDiff > 0 && capacityAvailable >= patientCount) {
                const distance = this.calculateDistance(
                    fromHospital.location, 
                    toHospital.location
                );
                
                suggestions.push({
                    toHospital: {
                        id: toHospital.id,
                        name: toHospital.name,
                        available: capacityAvailable
                    },
                    benefits: {
                        waitTimeReduction: waitTimeDiff,
                        patientsHelped: Math.min(patientCount, capacityAvailable),
                        estimatedTransferTime: Math.round(distance * 2) + ' minuten'
                    },
                    sharedDepartments,
                    feasibility: this.calculateTransferFeasibility(
                        fromHospital, 
                        toHospital, 
                        patientCount
                    ),
                    implementation: {
                        steps: [
                            'Identificeer niet-urgente patiënten voor transfer',
                            'Coördineer met ontvangende ziekenhuis',
                            'Regel transport en overdracht',
                            'Update patiënt dossiers'
                        ],
                        estimatedTime: '3-5 werkdagen',
                        requiredApprovals: ['Medisch directeur', 'Patiënt toestemming']
                    }
                });
            }
        });
        
        // Sort by benefit
        suggestions.sort((a, b) => 
            b.benefits.waitTimeReduction - a.benefits.waitTimeReduction
        );
        
        return {
            fromHospital: fromHospital.name,
            suggestions: suggestions.slice(0, 3), // Top 3 suggestions
            totalPotentialBenefit: {
                patientsHelped: suggestions.reduce((sum, s) => 
                    sum + s.benefits.patientsHelped, 0
                ),
                avgWaitTimeReduction: suggestions.length > 0 ?
                    Math.round(suggestions.reduce((sum, s) => 
                        sum + s.benefits.waitTimeReduction, 0
                    ) / suggestions.length) : 0
            }
        };
    },
    
    getCapacityStatus(utilizationRate) {
        if (utilizationRate > 0.95) return 'critical';
        if (utilizationRate > 0.85) return 'high';
        if (utilizationRate > 0.70) return 'optimal';
        if (utilizationRate > 0.50) return 'good';
        return 'underutilized';
    },
    
    calculateDistance(loc1, loc2) {
        // Simplified distance calculation (in reality would use actual routing)
        const R = 6371; // Earth's radius in km
        const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
        const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round(R * c);
    },
    
    calculateTransferFeasibility(fromHospital, toHospital, patientCount) {
        let score = 100;
        
        // Distance factor
        const distance = this.calculateDistance(fromHospital.location, toHospital.location);
        if (distance > 50) score -= 20;
        else if (distance > 30) score -= 10;
        
        // Capacity factor
        const capacityRatio = patientCount / toHospital.capacity.available;
        if (capacityRatio > 0.5) score -= 15;
        else if (capacityRatio > 0.3) score -= 5;
        
        // Specialty match
        const specialtyOverlap = fromHospital.specialties.filter(s => 
            toHospital.specialties.includes(s)
        ).length;
        score += specialtyOverlap * 5;
        
        return {
            score: Math.max(0, Math.min(100, score)),
            rating: score > 80 ? 'Excellent' : score > 60 ? 'Good' : score > 40 ? 'Fair' : 'Poor',
            factors: {
                distance: distance + ' km',
                capacityMatch: capacityRatio < 0.3 ? 'Good' : 'Limited',
                specialtyAlignment: specialtyOverlap > 2 ? 'Strong' : 'Moderate'
            }
        };
    },
    
    generateRegionalRecommendations() {
        const recommendations = [];
        
        // Identify imbalances
        const criticalHospitals = this.hospitals.filter(h => 
            (h.capacity.used / h.capacity.total) > 0.9
        );
        const underutilizedHospitals = this.hospitals.filter(h => 
            (h.capacity.used / h.capacity.total) < 0.6
        );
        
        if (criticalHospitals.length > 0 && underutilizedHospitals.length > 0) {
            recommendations.push({
                type: 'transfer',
                priority: 'high',
                description: `Transfer patiënten van ${criticalHospitals[0].name} naar ${underutilizedHospitals[0].name}`,
                impact: 'Tot 50 patiënten sneller geholpen',
                implementation: 'Start binnen 1 week'
            });
        }
        
        // Department-specific recommendations
        if (criticalHospitals.some(h => h.departments.includes('GGZ'))) {
            recommendations.push({
                type: 'capacity',
                priority: 'high',
                description: 'Regionale GGZ capaciteit kritiek - overweeg mobiel crisis team',
                impact: '30% reductie in crisis opnames',
                implementation: 'Plan voor Q1 2025'
            });
        }
        
        // Efficiency recommendations
        recommendations.push({
            type: 'coordination',
            priority: 'medium',
            description: 'Implementeer gezamenlijk intake systeem voor snellere plaatsing',
            impact: '15% efficiëntere capaciteitsbenutting',
            implementation: '3 maanden implementatie'
        });
        
        return recommendations;
    },
    
    simulateRegionalOptimization() {
        // Calculate current state
        const currentMetrics = {
            avgWaitTime: this.hospitals.reduce((sum, h) => sum + h.averageWaitTime, 0) / this.hospitals.length,
            totalWaiting: this.hospitals.reduce((sum, h) => sum + (h.capacity.used * 0.3), 0),
            imbalanceScore: this.calculateImbalanceScore()
        };
        
        // Simulate optimized state
        const optimizedMetrics = {
            avgWaitTime: Math.round(currentMetrics.avgWaitTime * 0.7),
            totalWaiting: Math.round(currentMetrics.totalWaiting * 0.8),
            imbalanceScore: Math.round(currentMetrics.imbalanceScore * 0.5)
        };
        
        return {
            current: currentMetrics,
            optimized: optimizedMetrics,
            improvements: {
                waitTimeReduction: Math.round(
                    (1 - optimizedMetrics.avgWaitTime / currentMetrics.avgWaitTime) * 100
                ) + '%',
                capacityGain: '22% effectieve capaciteitswinst',
                costSavings: '€1.8M per jaar'
            },
            requiredActions: [
                'Implementeer centraal verwijssysteem',
                'Start wekelijks capaciteitsoverleg',
                'Deel wachtlijstdata real-time',
                'Harmoniseer intake procedures'
            ]
        };
    },
    
    calculateImbalanceScore() {
        // Measure how imbalanced the system is
        const utilizations = this.hospitals.map(h => h.capacity.used / h.capacity.total);
        const avgUtilization = utilizations.reduce((a, b) => a + b) / utilizations.length;
        
        const variance = utilizations.reduce((sum, u) => 
            sum + Math.pow(u - avgUtilization, 2), 0
        ) / utilizations.length;
        
        return Math.round(Math.sqrt(variance) * 100);
    }
};

module.exports = coordinationService;