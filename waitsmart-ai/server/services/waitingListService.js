// Waiting List Service
const fs = require('fs');
const path = require('path');

// Mock data storage (in production, this would be a real database)
let waitingListData = null;

// Initialize mock data
function initializeData() {
    if (!waitingListData) {
        waitingListData = {
            patients: generateMockPatients(3000),
            lastUpdated: new Date()
        };
    }
    return waitingListData;
}

// Generate mock patient data
function generateMockPatients(count) {
    const departments = ['GGZ', 'Verpleeghuis', 'Revalidatie', 'Dagbehandeling'];
    const conditions = {
        'GGZ': ['Depressie', 'Angststoornis', 'PTSD', 'Bipolaire Stoornis', 'Psychose'],
        'Verpleeghuis': ['Dementie', 'Parkinson', 'CVA', 'Algemene Verzorging'],
        'Revalidatie': ['Orthopedisch', 'Neurologisch', 'Cardiologisch', 'Pulmonaal'],
        'Dagbehandeling': ['Oncologie', 'Dialyse', 'Geriatrie', 'Psychiatrie']
    };
    
    const patients = [];
    for (let i = 1; i <= count; i++) {
        const department = departments[Math.floor(Math.random() * departments.length)];
        const condition = conditions[department][Math.floor(Math.random() * conditions[department].length)];
        const waitDays = Math.floor(Math.random() * 180) + 1;
        
        patients.push({
            id: `PAT-${String(i).padStart(6, '0')}`,
            department,
            condition,
            waitDays,
            admissionDate: new Date(Date.now() - waitDays * 24 * 60 * 60 * 1000),
            urgencyScore: calculateUrgencyScore(department, condition, waitDays),
            age: Math.floor(Math.random() * 60) + 20,
            hasSupport: Math.random() > 0.3,
            deteriorationRisk: Math.random(),
            lastContact: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            status: 'waiting',
            dataQuality: Math.random() > 0.5 ? 'complete' : 'incomplete'
        });
    }
    
    return patients;
}

// Calculate urgency score based on various factors
function calculateUrgencyScore(department, condition, waitDays) {
    let baseScore = 50;
    
    // Department weight
    const departmentWeights = {
        'GGZ': 1.2,
        'Verpleeghuis': 1.0,
        'Revalidatie': 0.9,
        'Dagbehandeling': 0.8
    };
    
    // Condition severity
    const severityScores = {
        'Psychose': 30,
        'Depressie': 25,
        'Dementie': 28,
        'CVA': 26,
        'Oncologie': 29
    };
    
    baseScore *= departmentWeights[department] || 1;
    baseScore += severityScores[condition] || 10;
    
    // Wait time factor
    if (waitDays > 120) baseScore += 20;
    else if (waitDays > 60) baseScore += 10;
    else if (waitDays > 30) baseScore += 5;
    
    // Add some randomness for realism
    baseScore += Math.random() * 10 - 5;
    
    return Math.min(100, Math.max(0, Math.round(baseScore)));
}

// Service methods
const waitingListService = {
    getDashboardMetrics() {
        const data = initializeData();
        const patients = data.patients;
        
        const totalWaiting = patients.filter(p => p.status === 'waiting').length;
        const urgentCases = patients.filter(p => p.urgencyScore > 80).length;
        const averageWaitTime = Math.round(
            patients.reduce((sum, p) => sum + p.waitDays, 0) / patients.length
        );
        
        const dataQualityScore = Math.round(
            (patients.filter(p => p.dataQuality === 'complete').length / patients.length) * 100
        );
        
        // Calculate trends
        const lastMonthTotal = Math.round(totalWaiting * 1.12);
        const lastMonthUrgent = Math.round(urgentCases * 1.18);
        
        return {
            totalWaiting: {
                value: totalWaiting,
                change: ((totalWaiting - lastMonthTotal) / lastMonthTotal * 100).toFixed(1),
                trend: 'down'
            },
            urgentCases: {
                value: urgentCases,
                newToday: Math.floor(Math.random() * 30) + 10,
                requiresAction: true
            },
            averageWaitTime: {
                value: averageWaitTime,
                target: 60,
                change: -8,
                unit: 'dagen'
            },
            dataQuality: {
                value: dataQualityScore,
                change: 15,
                trend: 'up'
            }
        };
    },
    
    getWaitingList(filters = {}) {
        const data = initializeData();
        let patients = [...data.patients];
        
        // Apply filters
        if (filters.department) {
            patients = patients.filter(p => p.department === filters.department);
        }
        if (filters.urgency) {
            const urgencyThreshold = filters.urgency === 'high' ? 80 : 
                                   filters.urgency === 'medium' ? 50 : 0;
            patients = patients.filter(p => p.urgencyScore >= urgencyThreshold);
        }
        if (filters.status) {
            patients = patients.filter(p => p.status === filters.status);
        }
        
        // Sort by urgency score
        patients.sort((a, b) => b.urgencyScore - a.urgencyScore);
        
        return patients.slice(0, 100); // Return top 100 for performance
    },
    
    getPatientById(id) {
        const data = initializeData();
        return data.patients.find(p => p.id === id);
    },
    
    updatePatientStatus(id, status) {
        const data = initializeData();
        const patient = data.patients.find(p => p.id === id);
        if (patient) {
            patient.status = status;
            patient.lastUpdated = new Date();
            return patient;
        }
        return null;
    },
    
    validateDataQuality() {
        const data = initializeData();
        const errors = [];
        const warnings = [];
        
        data.patients.forEach(patient => {
            // Check for missing data
            if (!patient.condition) {
                errors.push({
                    patientId: patient.id,
                    field: 'condition',
                    message: 'Missing medical condition'
                });
            }
            
            // Check for data inconsistencies
            if (patient.waitDays < 0) {
                errors.push({
                    patientId: patient.id,
                    field: 'waitDays',
                    message: 'Invalid wait time (negative value)'
                });
            }
            
            // Check for outdated information
            const daysSinceContact = (Date.now() - patient.lastContact) / (1000 * 60 * 60 * 24);
            if (daysSinceContact > 30) {
                warnings.push({
                    patientId: patient.id,
                    field: 'lastContact',
                    message: 'No contact for over 30 days'
                });
            }
        });
        
        return {
            errors,
            warnings,
            dataQualityScore: Math.round((1 - errors.length / data.patients.length) * 100),
            totalRecords: data.patients.length,
            errorCount: errors.length,
            warningCount: warnings.length
        };
    },
    
    fixDataErrors(errors) {
        const data = initializeData();
        let fixedCount = 0;
        
        errors.forEach(error => {
            const patient = data.patients.find(p => p.id === error.patientId);
            if (patient) {
                switch (error.field) {
                    case 'condition':
                        // Apply default based on department
                        patient.condition = 'Algemeen';
                        fixedCount++;
                        break;
                    case 'waitDays':
                        // Fix negative values
                        patient.waitDays = Math.abs(patient.waitDays);
                        fixedCount++;
                        break;
                    // Add more fix logic as needed
                }
                patient.dataQuality = 'complete';
                patient.lastUpdated = new Date();
            }
        });
        
        return fixedCount;
    }
};

module.exports = waitingListService;