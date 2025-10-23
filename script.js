// FireCLIME VA JavaScript Functions - Updated with Corrected Calculations

// Global data storage
let assessmentData = {
    scenario: {},
    exposure: {},
    sensitivity: {},
    responses: {},
    treatments: {},
    results: {}
};

// Fire regime components
const fireComponents = ["size", "frequency", "severity", "area"];
const fireComponentNames = {
    size: "High Severity Patch Size",
    frequency: "Fire Frequency", 
    severity: "Soil Burn Severity",
    area: "Annual Area Burned"
};

// Ecosystem components (5 total)
const ecosystemComponents = ["survivorship", "recruitment", "erosion", "composition", "structure"];
const ecosystemComponentNames = {
    survivorship: "Survivorship",
    recruitment: "Recruitment",
    erosion: "Erosion & Debris Flows",
    composition: "Composition",
    structure: "Structure"
};

// Fuel components (3 total)
const fuelComponents = ["loading", "horizontal", "vertical"];
const fuelComponentNames = {
    loading: "Fuel Loading",
    horizontal: "Fuel Horizontal Continuity",
    vertical: "Fuel Vertical Arrangement"
};

// Tooltip content
const tooltipContent = {
    "climate-vars": `<strong>Climate Variables:</strong> The VA tool includes climate components that (1) are identified as important in studies of Southwestern climate-fire interactions, (2) have sufficient data or information within scientific literature to enable judgment of impacts, and (3) are of relevance to fire management. These components significantly impact wildfire regimes in multiple and complex ways.`,
    
    "fire-size": `<strong>High Severity Patch Size:</strong> The spatial extent of areas burned at high severity affects post-fire recovery, erosion potential, and ecosystem structure. Large patches may exceed regeneration thresholds for some species.`,
    
    "fire-frequency": `<strong>Fire Frequency:</strong> Fire frequency, or the number of fire events per unit time, heavily influences which plant species or functional groups dominate in a given area. If fire is too frequent or infrequent to allow a species to complete its life cycle, that species will be excluded from the system.`,
    
    "fire-severity": `<strong>Soil Burn Severity:</strong> The degree to which soil is altered by fire, affecting soil structure, nutrient availability, and erosion potential. High severity burns can sterilize soil and create hydrophobic conditions.`,
    
    "fire-area": `<strong>Annual Area Burned:</strong> Annual area burned is strongly regulated by combinations of both fire-year and antecedent conditions, particularly drought and seasonal precipitation. Area burned is sensitive to climate drivers because the combination of prior-season precipitation and current drought promotes fire spread over large areas.`,
    
    "ecosystem-components": `<strong>Ecosystem & Fuel Components:</strong> These responses evaluate how changes in fire regimes affect key ecosystem processes (survivorship, recruitment, composition, structure, erosion) and fuel characteristics (loading, horizontal continuity, vertical arrangement). Select whether expected changes move components further from, closer to, or maintain distance from Desired Future Conditions.`
};

// Initialize the application
document.addEventListener("DOMContentLoaded", function() {
    initializeResponseMatrix();
    setupEventListeners();
    setupTooltips();
    setDefaultDate();
    calculateRisk();
});

// Setup tooltip system
function setupTooltips() {
    const infoIcons = document.querySelectorAll('.info-icon');
    const tooltip = document.getElementById('tooltip-container');
    
    infoIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function(e) {
            const tooltipKey = this.dataset.tooltip;
            const content = tooltipContent[tooltipKey];
            
            if (content) {
                tooltip.innerHTML = content;
                tooltip.style.display = 'block';
                positionTooltip(e, tooltip);
            }
        });
        
        icon.addEventListener('mouseleave', function() {
            tooltip.style.display = 'none';
        });
        
        icon.addEventListener('mousemove', function(e) {
            positionTooltip(e, tooltip);
        });
    });
}

function positionTooltip(e, tooltip) {
    const x = e.pageX + 15;
    const y = e.pageY + 15;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
}

// Tab management
function showTab(tabName) {
    // Hide all panels
    document.querySelectorAll(".tab-panel").forEach(panel => {
        panel.classList.remove("active");
    });
    
    // Remove active class from all tabs
    document.querySelectorAll(".nav-tab").forEach(tab => {
        tab.classList.remove("active");
    });
    
    // Show selected panel
    const targetPanel = document.getElementById(tabName);
    if (targetPanel) {
        targetPanel.classList.add("active");
    }
    
    // Find and activate the correct tab
    const tabs = document.querySelectorAll(".nav-tab");
    const tabIndex = {
        "overview": 0,
        "scenario": 1, 
        "exposure": 2,
        "sensitivity": 3,
        "baseline": 4,
        "treatments": 5,
        "results": 6
    };
    
    if (tabs[tabIndex[tabName]]) {
        tabs[tabIndex[tabName]].classList.add("active");
    }
    
    updateProgress();
}

// Initialize the response matrix (32 assessments: 20 ecosystem + 12 fuel)
function initializeResponseMatrix() {
    const matrixContainer = document.getElementById("response-matrix");
    if (!matrixContainer) return;
    
    let matrixHTML = "";
    
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
}

// Setup event listeners
function setupEventListeners() {
    // Add listeners for all form inputs
    document.addEventListener("change", function(e) {
        if (e.target.classList.contains("form-input")) {
            updateProgress();
            calculateRisk();
        }
    });
    
    // Specific listeners for sensitivity questions
    document.addEventListener("change", function(e) {
        if (e.target.classList.contains("sensitivity-q")) {
            calculateIntrinsicSensitivity();
        }
    });
}

// Set default date
function setDefaultDate() {
    const dateInput = document.getElementById("assessment-date");
    if (dateInput) {
        dateInput.value = new Date().toISOString().split("T")[0];
    }
}

// Calculate Exposure Scores - CORRECTED PER RUBRIC
function calculateExposure() {
    const exposureScores = {};
    
    fireComponents.forEach(component => {
        const changeSelect = document.getElementById(`exposure-${component}-change`);
        const directionSelect = document.getElementById(`exposure-${component}-direction`);
        let score = 0;
        
        if (changeSelect && directionSelect && changeSelect.value && directionSelect.value) {
            const hasChange = changeSelect.value !== "no-change";
            const direction = directionSelect.value;
            
            // Per rubric:
            // Score = 1: Fire regime changes AND further from DFC
            // Score = 0: No change OR change moves closer/within DFC
            // Score = -1: No fire regime change AND moves toward DFC
            
            if (hasChange && direction === "further") {
                score = 1; // Change AND further from DFC
            } else if (!hasChange && (direction === "closer" || direction === "within")) {
                score = -1; // No change but moving toward DFC
            } else {
                score = 0; // No change OR change moves closer
            }
        }
        
        exposureScores[component] = score;
    });
    
    return exposureScores;
}

// Calculate Intrinsic Sensitivity - CORRECTED PER RUBRIC
function calculateIntrinsicSensitivity() {
    const sensitivityQuestions = document.querySelectorAll(".sensitivity-q");
    let sensitivityCount = 0;
    let totalQuestions = 0;
    
    sensitivityQuestions.forEach(select => {
        if (select.value) {
            totalQuestions++;
            const isReverse = select.dataset.reverse === "true";
            
            if (isReverse) {
                // Question 1 is reversed (No = sensitivity)
                if (select.value === "no") sensitivityCount++;
            } else {
                // All other questions (Yes = sensitivity)
                if (select.value === "yes") sensitivityCount++;
            }
        }
    });
    
    // Calculate proportion and standardize to 0-10 scale
    const proportion = totalQuestions > 0 ? sensitivityCount / totalQuestions : 0;
    const standardizedScore = proportion * 10; // Standardize to 0-10 range
    
    return {
        rawCount: sensitivityCount,
        totalQuestions: totalQuestions,
        proportion: proportion,
        standardizedScore: standardizedScore
    };
}

// Calculate Component Sensitivity - CORRECTED PER RUBRIC
function calculateComponentSensitivity(exposureScores) {
    const componentScores = {
        byFire: {},
        byComponent: {},
        ecosystem: {},
        fuel: {}
    };
    
    // Initialize scores
    fireComponents.forEach(fireComp => {
        componentScores.byFire[fireComp] = {
            ecosystem: 0,
            fuel: 0,
            total: 0,
            ecosystemStandardized: 0,
            fuelStandardized: 0,
            totalStandardized: 0
        };
    });
    
    [...ecosystemComponents, ...fuelComponents].forEach(comp => {
        componentScores.byComponent[comp] = 0;
    });
    
    // Calculate scores for each fire component
    fireComponents.forEach(fireComp => {
        let ecosystemSum = 0;
        let fuelSum = 0;
        
        // Ecosystem components
        ecosystemComponents.forEach(ecoComp => {
            const select = document.getElementById(`response-${fireComp}-${ecoComp}`);
            if (select && select.value) {
                let score = 0;
                if (select.value === "further") score = 1;
                else if (select.value === "closer") score = -1;
                // no-change = 0
                
                ecosystemSum += score;
                componentScores.byComponent[ecoComp] = (componentScores.byComponent[ecoComp] || 0) + score;
            }
        });
        
        // Fuel components
        fuelComponents.forEach(fuelComp => {
            const select = document.getElementById(`response-${fireComp}-${fuelComp}`);
            if (select && select.value) {
                let score = 0;
                if (select.value === "further") score = 1;
                else if (select.value === "closer") score = -1;
                // no-change = 0
                
                fuelSum += score;
                componentScores.byComponent[fuelComp] = (componentScores.byComponent[fuelComp] || 0) + score;
            }
        });
        
        // Store raw sums
        componentScores.byFire[fireComp].ecosystem = ecosystemSum;
        componentScores.byFire[fireComp].fuel = fuelSum;
        componentScores.byFire[fireComp].total = ecosystemSum + fuelSum;
        
        // Standardize per rubric
        componentScores.byFire[fireComp].ecosystemStandardized = ecosystemSum * 0.5;
        componentScores.byFire[fireComp].fuelStandardized = fuelSum * 0.8334;
        componentScores.byFire[fireComp].totalStandardized = (ecosystemSum + fuelSum) * 0.31223;
    });
    
    // Standardize individual component scores (multiply by 2.5 per rubric)
    Object.keys(componentScores.byComponent).forEach(comp => {
        componentScores.byComponent[comp] *= 2.5;
    });
    
    return componentScores;
}

// Calculate Impact - CORRECTED PER RUBRIC
function calculateImpact(exposureScores, componentSensitivity) {
    const impactScores = {
        byFire: {},
        byComponent: {},
        overall: 0
    };
    
    // Initialize
    fireComponents.forEach(fireComp => {
        impactScores.byFire[fireComp] = {
            ecosystem: 0,
            fuel: 0,
            total: 0
        };
    });
    
    [...ecosystemComponents, ...fuelComponents].forEach(comp => {
        impactScores.byComponent[comp] = 0;
    });
    
    // Calculate impact for each fire component
    // CRITICAL: Only calculate impact if exposure = 1
    fireComponents.forEach(fireComp => {
        const exposure = exposureScores[fireComp];
        
        if (exposure === 1) {
            // Only calculate impact when there is negative exposure
            impactScores.byFire[fireComp].ecosystem = 
                exposure * componentSensitivity.byFire[fireComp].ecosystemStandardized;
            impactScores.byFire[fireComp].fuel = 
                exposure * componentSensitivity.byFire[fireComp].fuelStandardized;
            impactScores.byFire[fireComp].total = 
                exposure * componentSensitivity.byFire[fireComp].totalStandardized;
            
            // Also calculate impact for individual components
            ecosystemComponents.forEach(ecoComp => {
                const select = document.getElementById(`response-${fireComp}-${ecoComp}`);
                if (select && select.value) {
                    let sensitivityScore = 0;
                    if (select.value === "further") sensitivityScore = 1;
                    else if (select.value === "closer") sensitivityScore = -1;
                    
                    impactScores.byComponent[ecoComp] += exposure * sensitivityScore;
                }
            });
            
            fuelComponents.forEach(fuelComp => {
                const select = document.getElementById(`response-${fireComp}-${fuelComp}`);
                if (select && select.value) {
                    let sensitivityScore = 0;
                    if (select.value === "further") sensitivityScore = 1;
                    else if (select.value === "closer") sensitivityScore = -1;
                    
                    impactScores.byComponent[fuelComp] += exposure * sensitivityScore;
                }
            });
        }
        // If exposure = 0 or -1, impact remains 0 (already initialized)
    });
    
    // Standardize individual component impacts (multiply by 2.5)
    Object.keys(impactScores.byComponent).forEach(comp => {
        impactScores.byComponent[comp] *= 2.5;
    });
    
    // Calculate overall impact (sum of all fire component impacts)
    fireComponents.forEach(fireComp => {
        impactScores.overall += impactScores.byFire[fireComp].total;
    });
    
    return impactScores;
}

// Calculate Treatment Effects - CORRECTED PER RUBRIC
function calculateTreatmentEffects() {
    const treatmentScores = {
        byFireComponent: {},
        ecosystem: 0,
        fuel: 0,
        total: 0,
        standardizedTotal: 0
    };
    
    let totalTreatmentScore = 0;
    
    fireComponents.forEach(fireComp => {
        const select = document.getElementById(`treatment-${fireComp}`);
        let score = 0;
        
        if (select && select.value) {
            score = parseInt(select.value) || 0;
        }
        
        treatmentScores.byFireComponent[fireComp] = score;
        totalTreatmentScore += score;
    });
    
    treatmentScores.total = totalTreatmentScore;
    
    // Calculate ecosystem and fuel treatment effects
    // (This would require more detail about which components are affected)
    // For now, we'll distribute proportionally
    treatmentScores.ecosystem = totalTreatmentScore * 0.625; // 5/8 (5 ecosystem out of 8 total)
    treatmentScores.fuel = totalTreatmentScore * 0.375; // 3/8 (3 fuel out of 8 total)
    
    // Standardize total per rubric: (Ecosystem + Fuel) * 0.25
    treatmentScores.standardizedTotal = (treatmentScores.ecosystem + treatmentScores.fuel) * 0.25;
    
    return treatmentScores;
}

// Calculate overall risk/vulnerability
function calculateRisk() {
    // Step 1: Calculate Exposure
    const exposureScores = calculateExposure();
    
    // Step 2: Calculate Intrinsic Sensitivity
    const intrinsicSensitivity = calculateIntrinsicSensitivity();
    
    // Step 3: Calculate Component Sensitivity
    const componentSensitivity = calculateComponentSensitivity(exposureScores);
    
    // Step 4: Calculate Impact
    const impactScores = calculateImpact(exposureScores, componentSensitivity);
    
    // Step 5: Calculate preliminary impact score (sum of all ecosystem and fuel component impacts)
    const preliminaryImpact = impactScores.overall;
    
    // Step 6: Calculate vulnerability before treatment
    // Per rubric: ((preliminary impact) + (intrinsic sensitivity)) * 0.22
    const vulnerabilityBeforeTreatment = (preliminaryImpact + intrinsicSensitivity.standardizedScore) * 0.22;
    
    // Step 7: Calculate treatment effects
    const treatmentEffects = calculateTreatmentEffects();
    
    // Step 8: Calculate new vulnerability
    // Per rubric: Vulnerability before treatment - Standardized total treatment
    const newVulnerability = vulnerabilityBeforeTreatment - treatmentEffects.standardizedTotal;
    
    // Step 9: Calculate treatment effectiveness
    let treatmentEffectiveness = 0;
    if (vulnerabilityBeforeTreatment !== 0) {
        treatmentEffectiveness = (newVulnerability - vulnerabilityBeforeTreatment) / vulnerabilityBeforeTreatment;
    }
    
    // Store results
    assessmentData.results = {
        exposure: exposureScores,
        sensitivity: intrinsicSensitivity,
        componentSensitivity: componentSensitivity,
        impact: impactScores,
        treatment: treatmentEffects,
        vulnerability: {
            preliminary: preliminaryImpact,
            beforeTreatment: vulnerabilityBeforeTreatment,
            finalVulnerability: newVulnerability,
            treatmentEffectiveness: treatmentEffectiveness
        }
    };
    
    // Update displays
    updateResultsDisplay();
    updateComponentScores();
    updateRecommendations();
    updateTreatmentChart();
}

// Update results display
function updateResultsDisplay() {
    const results = assessmentData.results;
    if (!results || !results.vulnerability) return;
    
    const vulnerability = results.vulnerability.finalVulnerability;
    
    // Update overall score
    const scoreElement = document.getElementById("overall-risk-score");
    if (scoreElement) {
        scoreElement.textContent = vulnerability.toFixed(1);
    }
    
    // Update risk level
    updateRiskLevel(vulnerability);
    
    // Update results grid
    const resultsGrid = document.getElementById("results-grid");
    if (resultsGrid) {
        const exposureSum = Object.values(results.exposure).reduce((a, b) => a + b, 0);
        
        resultsGrid.innerHTML = `
            <div class="score-card">
                <h4>Exposure Score</h4>
                <div class="score-value" style="color: #dc2626;">${exposureSum}</div>
                <div class="score-description">Fire regime exposure (0-4 scale)</div>
            </div>
            <div class="score-card">
                <h4>Intrinsic Sensitivity</h4>
                <div class="score-value" style="color: #2563eb;">${results.sensitivity.standardizedScore.toFixed(1)}</div>
                <div class="score-description">Baseline sensitivity (0-10 scale)</div>
            </div>
            <div class="score-card">
                <h4>Impact Score</h4>
                <div class="score-value" style="color: #dc2626;">${results.impact.overall.toFixed(1)}</div>
                <div class="score-description">Combined impact (-10 to +10)</div>
            </div>
            <div class="score-card">
                <h4>Treatment Effect</h4>
                <div class="score-value" style="color: #16a34a;">${results.treatment.standardizedTotal.toFixed(1)}</div>
                <div class="score-description">Management benefit</div>
            </div>
            <div class="score-card">
                <h4>Overall Vulnerability</h4>
                <div class="score-value" style="color: #059669;">${vulnerability.toFixed(1)}</div>
                <div class="score-description">FireCLIME VA Score (-7 to +10)</div>
            </div>
        `;
    }
}

// Update component scores with separation between fire regime and ecosystem/fuel
function updateComponentScores() {
    const results = assessmentData.results;
    if (!results || !results.impact) return;
    
    // Fire Regime Component Scores
    const fireComponentScoresContainer = document.getElementById("fire-component-scores");
    if (fireComponentScoresContainer) {
        let html = '<div class="component-scores-grid">';
        
        fireComponents.forEach(fireComp => {
            const impact = results.impact.byFire[fireComp];
            const exposure = results.exposure[fireComp];
            
            if (exposure === 1) {
                html += `
                    <div class="component-score-item">
                        <h6>${fireComponentNames[fireComp]}</h6>
                        <div class="component-score-value" style="color: ${impact.total >= 0 ? '#dc2626' : '#16a34a'}">
                            ${impact.total.toFixed(1)}
                        </div>
                        <div class="score-description" style="font-size: 0.8rem;">Impact from climate</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="component-score-item" style="opacity: 0.6;">
                        <h6>${fireComponentNames[fireComp]}</h6>
                        <div class="component-score-value" style="color: #6b7280;">-</div>
                        <div class="score-description" style="font-size: 0.8rem;">No exposure calculated</div>
                    </div>
                `;
            }
        });
        
        html += "</div>";
        fireComponentScoresContainer.innerHTML = html;
    }
    
    // Ecosystem & Fuel Component Scores
    const componentScoresContainer = document.getElementById("component-scores");
    if (!componentScoresContainer) return;
    
    let html = '<div class="component-scores-grid">';
    
    // Ecosystem components section
    html += '<div style="grid-column: 1/-1; margin-top: 1rem; margin-bottom: 0.5rem;"><strong style="color: #2d3748;">Ecosystem Components</strong></div>';
    ecosystemComponents.forEach(component => {
        const impact = results.impact.byComponent[component];
        if (impact !== undefined) {
            const name = ecosystemComponentNames[component];
            html += `
                <div class="component-score-item">
                    <h6>${name}</h6>
                    <div class="component-score-value" style="color: ${impact >= 0 ? '#dc2626' : '#16a34a'}">
                        ${impact.toFixed(1)}
                    </div>
                    <div class="score-description" style="font-size: 0.8rem;">${impact > 0 ? 'More vulnerable' : impact < 0 ? 'Less vulnerable' : 'Neutral'}</div>
                </div>
            `;
        }
    });
    
    // Fuel components section
    html += '<div style="grid-column: 1/-1; margin-top: 1rem; margin-bottom: 0.5rem;"><strong style="color: #2d3748;">Fuel Components</strong></div>';
    fuelComponents.forEach(component => {
        const impact = results.impact.byComponent[component];
        if (impact !== undefined) {
            const name = fuelComponentNames[component];
            html += `
                <div class="component-score-item">
                    <h6>${name}</h6>
                    <div class="component-score-value" style="color: ${impact >= 0 ? '#dc2626' : '#16a34a'}">
                        ${impact.toFixed(1)}
                    </div>
                    <div class="score-description" style="font-size: 0.8rem;">${impact > 0 ? 'More vulnerable' : impact < 0 ? 'Less vulnerable' : 'Neutral'}</div>
                </div>
            `;
        }
    });
    
    html += "</div>";
    componentScoresContainer.innerHTML = html;
}

// Update treatment impact chart
function updateTreatmentChart() {
    const results = assessmentData.results;
    if (!results || !results.treatment || results.treatment.total === 0) {
        document.getElementById("treatment-impact-section").style.display = "none";
        return;
    }
    
    document.getElementById("treatment-impact-section").style.display = "block";
    
    const chartContainer = document.getElementById("treatment-chart-container");
    if (!chartContainer) return;
    
    const vulnerabilityBefore = results.vulnerability.beforeTreatment;
    const vulnerabilityAfter = results.vulnerability.finalVulnerability;
    const reduction = vulnerabilityBefore - vulnerabilityAfter;
    const effectiveness = results.vulnerability.treatmentEffectiveness * 100;
    
    let html = `
        <div class="treatment-chart">
            <div class="chart-bar-container">
                <div class="chart-label">Before Treatment</div>
                <div class="chart-bar" style="width: ${Math.min(Math.abs(vulnerabilityBefore) * 10, 100)}%; background: #dc2626;">
                    ${vulnerabilityBefore.toFixed(1)}
                </div>
            </div>
            <div class="chart-bar-container">
                <div class="chart-label">After Treatment</div>
                <div class="chart-bar" style="width: ${Math.min(Math.abs(vulnerabilityAfter) * 10, 100)}%; background: #16a34a;">
                    ${vulnerabilityAfter.toFixed(1)}
                </div>
            </div>
            <div class="treatment-summary">
                <p><strong>Vulnerability Reduction:</strong> ${reduction.toFixed(1)} points</p>
                <p><strong>Treatment Effectiveness:</strong> ${effectiveness.toFixed(1)}% reduction</p>
            </div>
        </div>
        
        <h5 style="margin-top: 1.5rem;">Component-Level Treatment Effects</h5>
        <div class="component-scores-grid" style="margin-top: 1rem;">
    `;
    
    fireComponents.forEach(fireComp => {
        const score = results.treatment.byFireComponent[fireComp];
        html += `
            <div class="component-score-item">
                <h6>${fireComponentNames[fireComp]}</h6>
                <div class="component-score-value" style="color: #16a34a;">${score}</div>
                <div class="score-description" style="font-size: 0.8rem;">
                    ${score === 5 ? 'Excellent' : score === 4 ? 'Very Good' : score === 3 ? 'Good' : score === 2 ? 'Fair' : score === 1 ? 'Poor' : 'No Change'}
                </div>
            </div>
        `;
    });
    
    html += "</div>";
    chartContainer.innerHTML = html;
}

// Update risk level
function updateRiskLevel(vulnerability) {
    let riskLevel = "";
    let riskColor = "";
    
    if (vulnerability >= 7) {
        riskLevel = "Very High Vulnerability";
        riskColor = "#dc2626";
    } else if (vulnerability >= 4) {
        riskLevel = "High Vulnerability";  
        riskColor = "#ea580c";
    } else if (vulnerability >= 1) {
        riskLevel = "Moderate Vulnerability";
        riskColor = "#d97706";
    } else if (vulnerability >= -2) {
        riskLevel = "Low Vulnerability";
        riskColor = "#16a34a";
    } else {
        riskLevel = "Very Low Vulnerability";
        riskColor = "#15803d";
    }
    
    const riskLevelElement = document.getElementById("risk-level-text");
    if (riskLevelElement) {
        riskLevelElement.textContent = riskLevel;
    }
    
    const summaryElement = document.querySelector(".results-summary");
    if (summaryElement) {
        summaryElement.style.background = `linear-gradient(135deg, ${riskColor} 0%, ${riskColor}dd 100%)`;
    }
}

// Update recommendations
function updateRecommendations() {
    const results = assessmentData.results;
    if (!results || !results.vulnerability) return;
    
    const vulnerability = results.vulnerability.finalVulnerability;
    let recommendations = "";
    let findings = [];
    
    if (vulnerability >= 7) {
        recommendations = "Very high vulnerability detected. Immediate and intensive management interventions recommended. Consider comprehensive adaptive management strategies and frequent monitoring.";
        findings.push("Very high vulnerability to fire-climate interactions");
        findings.push("Multiple risk factors exceed thresholds");
        findings.push("Priority candidate for adaptive management");
    } else if (vulnerability >= 4) {
        recommendations = "High vulnerability requires proactive management. Implement targeted treatments addressing key vulnerability drivers. Focus on components with highest impact scores.";
        findings.push("High vulnerability requires management attention");
        findings.push("Several components show concerning response patterns");
        findings.push("Good candidate for preventive treatments");
    } else if (vulnerability >= 1) {
        recommendations = "Moderate vulnerability suggests monitoring and selective management. Consider preventive treatments and continue regular assessment. Good opportunity for adaptive management.";
        findings.push("Moderate vulnerability with manageable risk levels");
        findings.push("Some components show sensitivity to fire-climate interactions");
        findings.push("Continue monitoring and consider preventive measures");
    } else if (vulnerability >= -2) {
        recommendations = "Low vulnerability indicates good resilience. Maintain current management practices and continue monitoring. System appears well-adapted to fire-climate interactions.";
        findings.push("Low vulnerability - system shows resilience");
        findings.push("Most components adapt well to expected changes");
        findings.push("Maintain existing management regime");
    } else {
        recommendations = "Very low vulnerability indicates excellent resilience. System is well-adapted to fire-climate interactions. Continue current management and monitoring protocols.";
        findings.push("Excellent resilience to fire-climate interactions");
        findings.push("System well-adapted to expected conditions");
        findings.push("Continue successful management practices");
    }
    
    const recommendationElement = document.getElementById("recommendation-text");
    if (recommendationElement) {
        recommendationElement.textContent = recommendations;
    }
    
    const findingsList = document.getElementById("findings-list");
    if (findingsList) {
        findingsList.innerHTML = "";
        findings.forEach(finding => {
            const li = document.createElement("li");
            li.textContent = finding;
            findingsList.appendChild(li);
        });
    }
}

// Progress tracking
function updateProgress() {
    const sections = ["scenario", "exposure", "sensitivity", "baseline", "treatments"];
    
    sections.forEach(section => {
        const inputs = document.querySelectorAll(`#${section} .form-input`);
        let filled = 0;
        
        inputs.forEach(input => {
            if (input.value && input.value !== "") filled++;
        });
        
        const progress = inputs.length > 0 ? Math.round((filled / inputs.length) * 100) : 0;
        
        const progressElement = document.getElementById(`${section}-progress`);
        const progressBar = document.getElementById(`${section}-bar`);
        
        if (progressElement) progressElement.textContent = progress + "%";
        if (progressBar) progressBar.style.width = progress + "%";
    });
}

// Export results
function exportResults() {
    const results = assessmentData.results;
    const siteName = document.getElementById("site-name")?.value || "unknown-site";
    const assessor = document.getElementById("assessor-name")?.value || "";
    
    const exportData = {
        timestamp: new Date().toISOString(),
        siteName: siteName,
        assessor: assessor,
        fireclimeVersion: "3.1",
        results: results,
        methodology: "Southwest FireCLIME Vulnerability Assessment",
        overallVulnerability: results?.vulnerability?.finalVulnerability || 0,
        riskLevel: document.getElementById("risk-level-text")?.textContent || "Unknown"
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fireclime-va-results-${siteName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
