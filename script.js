// FireCLIME VA JavaScript Functions

// Global data storage
let assessmentData = {
prework: {},
exposure: {},
sensitivity: {},
responses: {},
treatments: {},
results: {}
};

// Fire regime components
const fireComponents = [‘size’, ‘frequency’, ‘severity’, ‘area’];
const fireComponentNames = {
size: ‘High Severity Patch Size’,
frequency: ‘Fire Frequency’,
severity: ‘Soil Burn Severity’,
area: ‘Annual Area Burned’
};

// Ecosystem components (5 total)
const ecosystemComponents = [‘survivorship’, ‘recruitment’, ‘erosion’, ‘composition’, ‘structure’];
const ecosystemComponentNames = {
survivorship: ‘Survivorship’,
recruitment: ‘Recruitment’,
erosion: ‘Erosion & Debris Flows’,
composition: ‘Composition’,
structure: ‘Structure’
};

// Fuel components (3 total)
const fuelComponents = [‘loading’, ‘horizontal’, ‘vertical’];
const fuelComponentNames = {
loading: ‘Fuel Loading’,
horizontal: ‘Fuel Horizontal Continuity’,
vertical: ‘Fuel Vertical Arrangement’
};

// Initialize the application
document.addEventListener(‘DOMContentLoaded’, function() {
initializeResponseMatrix();
setupEventListeners();
setDefaultDate();
calculateRisk();
});

// Tab management
function showTab(tabName) {
// Hide all panels
document.querySelectorAll(’.tab-panel’).forEach(panel => {
panel.classList.remove(‘active’);
});

```
// Remove active class from all tabs
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
});

// Show selected panel
const targetPanel = document.getElementById(tabName);
if (targetPanel) {
    targetPanel.classList.add('active');
}

// Find and activate the correct tab
const tabs = document.querySelectorAll('.nav-tab');
const tabIndex = {
    'overview': 0,
    'prework': 1, 
    'exposure': 2,
    'sensitivity': 3,
    'baseline': 4,
    'treatments': 5,
    'results': 6
};

if (tabs[tabIndex[tabName]]) {
    tabs[tabIndex[tabName]].classList.add('active');
}

updateProgress();
```

}

// Initialize the response matrix (32 assessments: 20 ecosystem + 12 fuel)
function initializeResponseMatrix() {
const matrixContainer = document.getElementById(‘response-matrix’);
if (!matrixContainer) return;

```
let matrixHTML = '';

fireComponents.forEach(fireComp => {
    matrixHTML += `
        <div class="fire-component-section">
            <h4 class="fire-component-title">Response to Changes in ${fireComponentNames[fireComp]}</h4>
            <div class="component-groups">
                <div class="component-group">
                    <h6>Ecosystem Components</h6>
    `;
    
    // Add ecosystem components for this fire component
    ecosystemComponents.forEach(ecoComp => {
        matrixHTML += `
            <div class="component-item">
                <label class="form-label">${ecosystemComponentNames[ecoComp]}</label>
                <select class="form-input response-select" id="response-${fireComp}-${ecoComp}" data-fire="${fireComp}" data-component="${ecoComp}" data-type="ecosystem">
                    <option value="">Select response</option>
                    <option value="further">Further from DFC</option>
                    <option value="closer">Closer to DFC</option>
                    <option value="no-change">No Change</option>
                </select>
            </div>
        `;
    });
    
    matrixHTML += `
                </div>
                <div class="component-group">
                    <h6>Fuel Components</h6>
    `;
    
    // Add fuel components for this fire component
    fuelComponents.forEach(fuelComp => {
        matrixHTML += `
            <div class="component-item">
                <label class="form-label">${fuelComponentNames[fuelComp]}</label>
                <select class="form-input response-select" id="response-${fireComp}-${fuelComp}" data-fire="${fireComp}" data-component="${fuelComp}" data-type="fuel">
                    <option value="">Select response</option>
                    <option value="further">Further from DFC</option>
                    <option value="closer">Closer to DFC</option>
                    <option value="no-change">No Change</option>
                </select>
            </div>
        `;
    });
    
    matrixHTML += `
                </div>
            </div>
        </div>
    `;
});

matrixContainer.innerHTML = matrixHTML;
```

}

// Setup event listeners
function setupEventListeners() {
// Add listeners for all form inputs
document.addEventListener(‘change’, function(e) {
if (e.target.classList.contains(‘form-input’)) {
updateProgress();
calculateRisk();
}
});

```
// Specific listeners for sensitivity questions
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('sensitivity-q')) {
        calculateIntrinsicSensitivity();
    }
});
```

}

// Set default date
function setDefaultDate() {
const dateInput = document.getElementById(‘assessment-date’);
if (dateInput) {
dateInput.value = new Date().toISOString().split(‘T’)[0];
}
}

// Calculate Exposure Scores
function calculateExposure() {
const exposureScores = {};

```
fireComponents.forEach(component => {
    const directionSelect = document.getElementById(`exposure-${component}-direction`);
    let score = 0;
    
    if (directionSelect && directionSelect.value) {
        switch(directionSelect.value) {
            case 'further':
                score = 1; // Further from DFC
                break;
            case 'closer':
                score = 0; // Closer to DFC
                break;
            case 'no-change':
                score = 0; // No change
                break;
            default:
                score = 0;
        }
    }
    
    exposureScores[component] = score;
});

return exposureScores;
```

}

// Calculate Intrinsic Sensitivity
function calculateIntrinsicSensitivity() {
const sensitivityQuestions = document.querySelectorAll(’.sensitivity-q’);
let sensitivityCount = 0;
let totalQuestions = 0;

```
sensitivityQuestions.forEach(select => {
    if (select.value) {
        totalQuestions++;
        const isReverse = select.dataset.reverse === 'true';
        
        if (isReverse) {
            // Question 1 is reversed (No = sensitivity)
            if (select.value === 'no') sensitivityCount++;
        } else {
            // All other questions (Yes = sensitivity)
            if (select.value === 'yes') sensitivityCount++;
        }
    }
});

// Update sensitivity score display
const scoreDisplay = document.getElementById('sensitivity-score');
if (scoreDisplay) {
    scoreDisplay.textContent = `${sensitivityCount}/${totalQuestions}`;
}

// Standardize to 0-10 scale
const proportion = totalQuestions > 0 ? sensitivityCount / totalQuestions : 0;
const standardizedScore = proportion * 10;

return {
    rawCount: sensitivityCount,
    totalQuestions: totalQuestions,
    proportion: proportion,
    standardizedScore: standardizedScore
};
```

}

// Calculate Component Response Scores
function calculateComponentResponses() {
const responses = {
ecosystem: {},
fuel: {},
byFire: {},
byComponent: {}
};

```
// Initialize structures
fireComponents.forEach(fireComp => {
    responses.byFire[fireComp] = { ecosystem: 0, fuel: 0, total: 0 };
});

ecosystemComponents.forEach(ecoComp => {
    responses.byComponent[ecoComp] = 0;
});

fuelComponents.forEach(fuelComp => {
    responses.byComponent[fuelComp] = 0;
});

// Calculate scores from the 32 assessments
fireComponents.forEach(fireComp => {
    // Ecosystem responses for this fire component
    ecosystemComponents.forEach(ecoComp => {
        const select = document.getElementById(`response-${fireComp}-${ecoComp}`);
        if (select && select.value) {
            let score = 0;
            if (select.value === 'further') score = 1;
            else if (select.value === 'closer') score = -1;
            // no-change = 0
            
            responses.byFire[fireComp].ecosystem += score;
            responses.byFire[fireComp].total += score;
            responses.byComponent[ecoComp] += score;
        }
    });
    
    // Fuel responses for this fire component
    fuelComponents.forEach(fuelComp => {
        const select = document.getElementById(`response-${fireComp}-${fuelComp}`);
        if (select && select.value) {
            let score = 0;
            if (select.value === 'further') score = 1;
            else if (select.value === 'closer') score = -1;
            // no-change = 0
            
            responses.byFire[fireComp].fuel += score;
            responses.byFire[fireComp].total += score;
            responses.byComponent[fuelComp] += score;
        }
    });
});

return responses;
```

}

// Calculate standardization factors
function calculateStandardizationFactors() {
// Based on the number of components and possible score range
const maxEcosystemScore = ecosystemComponents.length; // 5 components × 1 max score = 5
const maxFuelScore = fuelComponents.length; // 3 components × 1 max score = 3
const maxFireComponentScore = maxEcosystemScore + maxFuelScore; // 8 total components

```
return {
    ecosystemFactor: 10 / maxEcosystemScore, // Scale to -10 to +10
    fuelFactor: 10 / maxFuelScore,
    fireComponentFactor: 10 / maxFireComponentScore,
    totalComponentFactor: 10 / (ecosystemComponents.length + fuelComponents.length) // For individual components
};
```

}

// Calculate Impact Scores
function calculateImpact() {
const exposureScores = calculateExposure();
const componentResponses = calculateComponentResponses();
const factors = calculateStandardizationFactors();

```
const impactScores = {
    byFire: {},
    byComponent: {},
    overall: 0
};

// Calculate impact for each fire component
fireComponents.forEach(fireComp => {
    const exposure = exposureScores[fireComp];
    
    // Only calculate impact if exposure score = 1 (further from DFC)
    if (exposure === 1) {
        // Impact = exposure × sensitivity (for components affected by this fire regime)
        const ecosystemImpact = componentResponses.byFire[fireComp].ecosystem * exposure;
        const fuelImpact = componentResponses.byFire[fireComp].fuel * exposure;
        const totalImpact = componentResponses.byFire[fireComp].total * exposure;
        
        impactScores.byFire[fireComp] = {
            ecosystem: ecosystemImpact * factors.ecosystemFactor,
            fuel: fuelImpact * factors.fuelFactor,
            total: totalImpact * factors.fireComponentFactor
        };
    } else {
        // No impact if exposure is 0 or -1
        impactScores.byFire[fireComp] = {
            ecosystem: 0,
            fuel: 0,
            total: 0
        };
    }
});

// Calculate impact for individual components
[...ecosystemComponents, ...fuelComponents].forEach(component => {
    let componentImpact = 0;
    
    fireComponents.forEach(fireComp => {
        const exposure = exposureScores[fireComp];
        if (exposure === 1) {
            // Find this component's response to this fire component
            const select = document.getElementById(`response-${fireComp}-${component}`);
            if (select && select.value) {
                let responseScore = 0;
                if (select.value === 'further') responseScore = 1;
                else if (select.value === 'closer') responseScore = -1;
                
                componentImpact += responseScore * exposure;
            }
        }
    });
    
    impactScores.byComponent[component] = componentImpact * factors.totalComponentFactor;
});

// Calculate overall impact (sum of all fire component impacts)
impactScores.overall = Object.values(impactScores.byFire)
    .reduce((sum, fireImpact) => sum + fireImpact.total, 0);

return impactScores;
```

}

// Calculate Treatment Effects
function calculateTreatmentEffects() {
const treatmentEffects = {};

```
fireComponents.forEach(component => {
    const select = document.getElementById(`treatment-${component}`);
    if (select && select.value) {
        treatmentEffects[component] = parseInt(select.value);
    } else {
        treatmentEffects[component] = 0;
    }
});

// Calculate total treatment effect
const totalTreatmentEffect = Object.values(treatmentEffects)
    .reduce((sum, effect) => sum + effect, 0);

return {
    byComponent: treatmentEffects,
    total: totalTreatmentEffect
};
```

}

// Calculate Overall Vulnerability
function calculateOverallVulnerability() {
const intrinsicSensitivity = calculateIntrinsicSensitivity();
const impactScores = calculateImpact();
const treatmentEffects = calculateTreatmentEffects();

```
// Vulnerability before treatment = (impact + intrinsic sensitivity) × 0.22
const vulnerabilityBeforeTreatment = (impactScores.overall + intrinsicSensitivity.standardizedScore) * 0.22;

// Adjust for treatment effects (simplified - could be more complex)
const treatmentAdjustment = treatmentEffects.total * 0.1; // Treatment factor
const finalVulnerability = vulnerabilityBeforeTreatment - treatmentAdjustment;

// Clamp to reasonable range
const clampedVulnerability = Math.max(-10, Math.min(10, finalVulnerability));

return {
    beforeTreatment: vulnerabilityBeforeTreatment,
    treatmentAdjustment: treatmentAdjustment,
    finalVulnerability: clampedVulnerability,
    intrinsicSensitivity: intrinsicSensitivity.standardizedScore,
    impactScore: impactScores.overall
};
```

}

// Main calculation function
function calculateRisk() {
try {
const vulnerability = calculateOverallVulnerability();
const exposure = calculateExposure();
const sensitivity = calculateIntrinsicSensitivity();
const responses = calculateComponentResponses();
const impact = calculateImpact();
const treatment = calculateTreatmentEffects();

```
    // Store results
    assessmentData.results = {
        vulnerability,
        exposure,
        sensitivity,
        responses,
        impact,
        treatment
    };
    
    // Update displays
    updateResultsDisplay();
    updateComponentScores();
    updateRecommendations();
    
} catch (error) {
    console.error('Error in calculateRisk:', error);
}
```

}

// Update results display
function updateResultsDisplay() {
const results = assessmentData.results;
if (!results || !results.vulnerability) return;

```
const vulnerability = results.vulnerability.finalVulnerability;

// Update main score
const scoreElement = document.getElementById('overall-risk-score');
if (scoreElement) {
    scoreElement.textContent = vulnerability.toFixed(1);
}

// Update risk level
updateRiskLevel(vulnerability);

// Update results grid
const resultsGrid = document.getElementById('results-grid');
if (resultsGrid) {
    resultsGrid.innerHTML = `
        <div class="score-card">
            <h4>Exposure Score</h4>
            <div class="score-value" style="color: #dc2626;">${Object.values(results.exposure).reduce((a, b) => a + b, 0)}</div>
            <div class="score-description">Fire regime exposure</div>
        </div>
        <div class="score-card">
            <h4>Intrinsic Sensitivity</h4>
            <div class="score-value" style="color: #2563eb;">${results.sensitivity.standardizedScore.toFixed(1)}</div>
            <div class="score-description">Baseline sensitivity</div>
        </div>
        <div class="score-card">
            <h4>Impact Score</h4>
            <div class="score-value" style="color: #dc2626;">${results.impact.overall.toFixed(1)}</div>
            <div class="score-description">Combined impact</div>
        </div>
        <div class="score-card">
            <h4>Treatment Effect</h4>
            <div class="score-value" style="color: #16a34a;">${results.treatment.total}</div>
            <div class="score-description">Management benefit</div>
        </div>
        <div class="score-card">
            <h4>Overall Vulnerability</h4>
            <div class="score-value" style="color: #059669;">${vulnerability.toFixed(1)}</div>
            <div class="score-description">FireCLIME VA Score</div>
        </div>
    `;
}
```

}

// Update component scores
function updateComponentScores() {
const results = assessmentData.results;
if (!results || !results.impact) return;

```
const componentScoresContainer = document.getElementById('component-scores');
if (!componentScoresContainer) return;

let html = '<div class="component-scores-grid">';

// Fire component scores
fireComponents.forEach(fireComp => {
    const impact = results.impact.byFire[fireComp];
    if (impact) {
        html += `
            <div class="component-score-item">
                <h6>${fireComponentNames[fireComp]}</h6>
                <div class="component-score-value">${impact.total.toFixed(1)}</div>
            </div>
        `;
    }
});

// Individual component scores
[...ecosystemComponents, ...fuelComponents].forEach(component => {
    const impact = results.impact.byComponent[component];
    if (impact !== undefined) {
        const name = ecosystemComponentNames[component] || fuelComponentNames[component];
        html += `
            <div class="component-score-item">
                <h6>${name}</h6>
                <div class="component-score-value">${impact.toFixed(1)}</div>
            </div>
        `;
    }
});

html += '</div>';
componentScoresContainer.innerHTML = html;
```

}

// Update risk level
function updateRiskLevel(vulnerability) {
let riskLevel = ‘’;
let riskColor = ‘’;

```
if (vulnerability >= 7) {
    riskLevel = 'Very High Vulnerability';
    riskColor = '#dc2626';
} else if (vulnerability >= 4) {
    riskLevel = 'High Vulnerability';  
    riskColor = '#ea580c';
} else if (vulnerability >= 1) {
    riskLevel = 'Moderate Vulnerability';
    riskColor = '#d97706';
} else if (vulnerability >= -2) {
    riskLevel = 'Low Vulnerability';
    riskColor = '#16a34a';
} else {
    riskLevel = 'Very Low Vulnerability';
    riskColor = '#15803d';
}

const riskLevelElement = document.getElementById('risk-level-text');
if (riskLevelElement) {
    riskLevelElement.textContent = riskLevel;
}

const summaryElement = document.querySelector('.results-summary');
if (summaryElement) {
    summaryElement.style.background = `linear-gradient(135deg, ${riskColor} 0%, ${riskColor}dd 100%)`;
}
```

}

// Update recommendations
function updateRecommendations() {
const results = assessmentData.results;
if (!results || !results.vulnerability) return;

```
const vulnerability = results.vulnerability.finalVulnerability;
let recommendations = '';
let findings = [];

if (vulnerability >= 7) {
    recommendations = 'Very high vulnerability detected. Immediate and intensive management interventions recommended. Consider comprehensive adaptive management strategies and frequent monitoring.';
    findings.push('Very high vulnerability to fire-climate interactions');
    findings.push('Multiple risk factors exceed thresholds');
    findings.push('Priority candidate for adaptive management');
} else if (vulnerability >= 4) {
    recommendations = 'High vulnerability requires proactive management. Implement targeted treatments addressing key vulnerability drivers. Focus on components with highest impact scores.';
    findings.push('High vulnerability requires management attention');
    findings.push('Several components show concerning response patterns');
    findings.push('Good candidate for preventive treatments');
} else if (vulnerability >= 1) {
    recommendations = 'Moderate vulnerability suggests monitoring and selective management. Consider preventive treatments and continue regular assessment. Good opportunity for adaptive management.';
    findings.push('Moderate vulnerability with manageable risk levels');
    findings.push('Some components show sensitivity to fire-climate interactions');
    findings.push('Continue monitoring and consider preventive measures');
} else if (vulnerability >= -2) {
    recommendations = 'Low vulnerability indicates good resilience. Maintain current management practices and continue monitoring. System appears well-adapted to fire-climate interactions.';
    findings.push('Low vulnerability - system shows resilience');
    findings.push('Most components adapt well to expected changes');
    findings.push('Maintain existing management regime');
} else {
    recommendations = 'Very low vulnerability indicates excellent resilience. System is well-adapted to fire-climate interactions. Continue current management and monitoring protocols.';
    findings.push('Excellent resilience to fire-climate interactions');
    findings.push('System well-adapted to expected conditions');
    findings.push('Continue successful management practices');
}

const recommendationElement = document.getElementById('recommendation-text');
if (recommendationElement) {
    recommendationElement.textContent = recommendations;
}

const findingsList = document.getElementById('findings-list');
if (findingsList) {
    findingsList.innerHTML = '';
    findings.forEach(finding => {
        const li = document.createElement('li');
        li.textContent = finding;
        findingsList.appendChild(li);
    });
}
```

}

// Progress tracking
function updateProgress() {
const sections = [‘prework’, ‘exposure’, ‘sensitivity’, ‘baseline’, ‘treatments’];

```
sections.forEach(section => {
    const inputs = document.querySelectorAll(`#${section} .form-input`);
    let filled = 0;
    
    inputs.forEach(input => {
        if (input.value && input.value !== '') filled++;
    });
    
    const progress = inputs.length > 0 ? Math.round((filled / inputs.length) * 100) : 0;
    
    const progressElement = document.getElementById(`${section}-progress`);
    const progressBar = document.getElementById(`${section}-bar`);
    
    if (progressElement) progressElement.textContent = progress + '%';
    if (progressBar) progressBar.style.width = progress + '%';
});
```

}

// Export results
function exportResults() {
const results = assessmentData.results;
const siteName = document.getElementById(‘site-name’)?.value || ‘’;
const assessor = document.getElementById(‘assessor-name’)?.value || ‘’;

```
const exportData = {
    timestamp: new Date().toISOString(),
    siteName: siteName,
    assessor: assessor,
    fireclimeVersion: '3.1',
    results: results,
    methodology: 'Southwest FireCLIME Vulnerability Assessment',
    overallVulnerability: results?.vulnerability?.finalVulnerability || 0,
    riskLevel: document.getElementById('risk-level-text')?.textContent || 'Unknown'
};

const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `fireclime-va-results-${siteName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
a.click();
URL.revokeObjectURL(url);
```

}
