// FireCLIME VA JavaScript v3.2 - Complete Implementation

// Global data storage
let assessmentData = {
    scenario: {},
    exposure: {},
    sensitivity: {},
    responses: {},
    treatments: {
        treatment1: {},
        treatment2: {},
        treatment3: {}
    },
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
    "climate-vars": `<strong>Climate Variables:</strong><br>The VA tool includes climate components that are (1) identified as important in Southwestern climate-fire interactions, (2) have sufficient data in scientific literature, and (3) are relevant to fire management. These significantly impact wildfire regimes in complex ways.`,
    
    "fire-size": `<strong>High Severity Patch Size:</strong><br>The spatial extent of high severity burn patches affects post-fire recovery, erosion potential, and ecosystem structure. Large patches may exceed regeneration thresholds for some species. Distance from unburned forest edge greatly limits regeneration after high-severity fire.`,
    
    "fire-frequency": `<strong>Fire Frequency:</strong><br>The number of fire events per unit time heavily influences which plant species or functional groups dominate. If fire is too frequent or infrequent to allow a species to complete its life cycle, that species will be excluded from the system.`,
    
    "fire-severity": `<strong>Soil Burn Severity:</strong><br>The degree to which soil is altered by fire affects soil structure, nutrient availability, and erosion potential. High severity burns can sterilize soil, create hydrophobic conditions, and reduce water infiltration.`,
    
    "fire-area": `<strong>Annual Area Burned:</strong><br>Strongly regulated by fire-year and antecedent conditions, particularly drought and seasonal precipitation. Area burned is sensitive to climate drivers because combinations of prior-season precipitation and current drought promote fire spread over large areas.`,
    
    "ecosystem-components": `<strong>Ecosystem & Fuel Components:</strong><br>Evaluate how changes in fire regimes affect key ecosystem processes (survivorship, recruitment, composition, structure, erosion) and fuel characteristics (loading, horizontal continuity, vertical arrangement). Select whether expected changes move components further from, closer to, or maintain distance from Desired Future Conditions.`
};

// Initialize application
document.addEventListener("DOMContentLoaded", function() {
    initializeExposureGrid();
    initializeResponseMatrix();
    initializeTreatmentSections();
    setupEventListeners();
    setupTooltips();
    setDefaultDate();
    updateFireDepartureSummary();
    calculateRisk();
});

// Setup tooltip system
function setupTooltips() {
    document.addEventListener('mouseover', function(e) {
        if (e.target.classList.contains('info-icon')) {
            const tooltipKey = e.target.dataset.tooltip;
            const content = tooltipContent[tooltipKey];
            const tooltip = document.getElementById('tooltip-container');
            
            if (content && tooltip) {
                tooltip.innerHTML = content;
                tooltip.style.display = 'block';
                positionTooltip(e, tooltip);
            }
        }
    });
    
    document.addEventListener('mouseout', function(e) {
        if (e.target.classList.contains('info-icon')) {
            const tooltip = document.getElementById('tooltip-container');
            if (tooltip) tooltip.style.display = 'none';
        }
    });
    
    document.addEventListener('mousemove', function(e) {
        if (e.target.classList.contains('info-icon')) {
            const tooltip = document.getElementById('tooltip-container');
            if (tooltip && tooltip.style.display === 'block') {
                positionTooltip(e, tooltip);
            }
        }
    });
}

function positionTooltip(e, tooltip) {
    const x = e.pageX + 15;
    const y = e.pageY + 15;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
}

// Initialize exposure grid
function initializeExposureGrid() {
    const container = document.getElementById("exposure-container");
    if (!container) return;
    
    let html = "";
    fireComponents.forEach(fireComp => {
        html += `
            <div class="exposure-component">
                <h5>
                    ${fireComponentNames[fireComp]} 
                    <span class="info-icon" data-tooltip="fire-${fireComp}">ℹ️</span>
                </h5>
                <div class="form-group">
                    <label class="form-label">Expected Change Direction</label>
                    <select class="form-input" id="exposure-${fireComp}-change" data-component="${fireComp}">
                        <option value="">Select expected change</option>
                        <option value="increase">Increase</option>
                        <option value="decrease">Decrease</option>
                        <option value="no-change">No Change</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Relationship to DFC</label>
                    <select class="form-input" id="exposure-${fireComp}-direction" data-component="${fireComp}">
                        <option value="">Select relationship</option>
                        <option value="further">Further from DFC</option>
                        <option value="closer">Closer to DFC</option>
                        <option value="within">Within DFC Range</option>
                    </select>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Initialize response matrix with dynamic fire regime changes
function initializeResponseMatrix() {
    const matrixContainer = document.getElementById("response-matrix");
    if (!matrixContainer) return;
    
    let matrixHTML = "";
    
    fireComponents.forEach(fireComp => {
        matrixHTML += `
            <div class="fire-component-section">
                <h4 class="fire-component-title">
                    Response to <span class="dynamic-text" id="fire-change-${fireComp}">Changes in</span> ${fireComponentNames[fireComp]}
                </h4>
                <div class="component-groups">
                    <div class="component-group">
                        <h6>Ecosystem Components</h6>
        `;
        
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

// Initialize treatment sections (3 treatments)
function initializeTreatmentSections() {
    for (let i = 1; i <= 3; i++) {
        // Fire components
        let fireHTML = "";
        fireComponents.forEach(comp => {
            fireHTML += `
                <div class="form-group">
                    <label class="form-label">${fireComponentNames[comp]}</label>
                    <select class="form-input treatment-effect" id="treatment-${i}-fire-${comp}">
                        <option value="">Select effectiveness</option>
                        <option value="5">Excellent (5)</option>
                        <option value="4">Very Good (4)</option>
                        <option value="3">Good (3)</option>
                        <option value="2">Fair (2)</option>
                        <option value="1">Poor (1)</option>
                        <option value="0">No Change (0)</option>
                    </select>
                </div>
            `;
        });
        const fireContainer = document.getElementById(`treatment-${i}-fire-components`);
        if (fireContainer) fireContainer.innerHTML = fireHTML;
        
        // Fuel components
        let fuelHTML = "";
        fuelComponents.forEach(comp => {
            fuelHTML += `
                <div class="form-group">
                    <label class="form-label">${fuelComponentNames[comp]}</label>
                    <select class="form-input treatment-effect" id="treatment-${i}-fuel-${comp}">
                        <option value="">Select effectiveness</option>
                        <option value="5">Excellent (5)</option>
                        <option value="4">Very Good (4)</option>
                        <option value="3">Good (3)</option>
                        <option value="2">Fair (2)</option>
                        <option value="1">Poor (1)</option>
                        <option value="0">No Change (0)</option>
                    </select>
                </div>
            `;
        });
        const fuelContainer = document.getElementById(`treatment-${i}-fuel-components`);
        if (fuelContainer) fuelContainer.innerHTML = fuelHTML;
        
        // Ecosystem components
        let ecoHTML = "";
        ecosystemComponents.forEach(comp => {
            ecoHTML += `
                <div class="form-group">
                    <label class="form-label">${ecosystemComponentNames[comp]}</label>
                    <select class="form-input treatment-effect" id="treatment-${i}-ecosystem-${comp}">
                        <option value="">Select effectiveness</option>
                        <option value="5">Excellent (5)</option>
                        <option value="4">Very Good (4)</option>
                        <option value="3">Good (3)</option>
                        <option value="2">Fair (2)</option>
                        <option value="1">Poor (1)</option>
                        <option value="0">No Change (0)</option>
                    </select>
                </div>
            `;
        });
        const ecoContainer = document.getElementById(`treatment-${i}-ecosystem-components`);
        if (ecoContainer) ecoContainer.innerHTML = ecoHTML;
    }
}

// Update fire departure summary in sensitivity tab
function updateFireDepartureSummary() {
    const summary = document.getElementById("fire-departure-summary");
    if (!summary) return;
    
    const departures = [];
    fireComponents.forEach(comp => {
        const select = document.getElementById(`departure-${comp}`);
        if (select && select.value === "yes") {
            departures.push(fireComponentNames[comp]);
        }
    });
    
    if (departures.length > 0) {
        summary.textContent = `Currently departed: ${departures.join(", ")}`;
    } else {
        summary.textContent = "No fire regime components currently departed from DFC.";
    }
}

// Update dynamic fire regime change text
function updateFireRegimeChangeText() {
    fireComponents.forEach(comp => {
        const changeSelect = document.getElementById(`exposure-${comp}-change`);
        const textElement = document.getElementById(`fire-change-${comp}`);
        
        if (changeSelect && textElement) {
            const changeValue = changeSelect.value;
            let changeText = "Changes in";
            
            if (changeValue === "increase") changeText = "Increase in";
            else if (changeValue === "decrease") changeText = "Decrease in";
            else if (changeValue === "no-change") changeText = "No Change in";
            
            textElement.textContent = changeText;
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    document.addEventListener("change", function(e) {
        if (e.target.classList.contains("form-input")) {
            updateProgress();
            
            // Update fire departure summary when departure questions change
            if (e.target.classList.contains("fire-departure-q")) {
                updateFireDepartureSummary();
            }
            
            // Update dynamic text when exposure changes
            if (e.target.id && e.target.id.includes("exposure-")) {
                updateFireRegimeChangeText();
            }
            
            calculateRisk();
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

// Tab management
function showTab(tabName) {
    document.querySelectorAll(".tab-panel").forEach(panel => {
        panel.classList.remove("active");
    });
    
    document.querySelectorAll(".nav-tab").forEach(tab => {
        tab.classList.remove("active");
    });
    
    const targetPanel = document.getElementById(tabName);
    if (targetPanel) {
        targetPanel.classList.add("active");
    }
    
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

// Calculate Exposure Scores
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
                score = 1;
            } else if (!hasChange && (direction === "closer" || direction === "within")) {
                score = -1;
            } else {
                score = 0;
            }
        }
        
        exposureScores[component] = score;
    });
    
    return exposureScores;
}

// Calculate Intrinsic Sensitivity (13 questions total)
function calculateIntrinsicSensitivity() {
    let sensitivityCount = 0;
    let totalQuestions = 0;
    
    // Question 1 (reversed - No = sensitivity)
    const q1 = document.getElementById("sensitivity-q1");
    if (q1 && q1.value) {
        totalQuestions++;
        if (q1.value === "no") sensitivityCount++;
    }
    
    // Questions 2-5: Fire regime departure questions from scenario building
    fireComponents.forEach(comp => {
        const select = document.getElementById(`departure-${comp}`);
        if (select && select.value) {
            totalQuestions++;
            if (select.value === "yes") sensitivityCount++;
        }
    });
    
    // Questions 6-13 (regular - Yes = sensitivity)
    for (let i = 6; i <= 13; i++) {
        const select = document.getElementById(`sensitivity-q${i}`);
        if (select && select.value) {
            totalQuestions++;
            if (select.value === "yes") sensitivityCount++;
        }
    }
    
    // Calculate proportion and standardize to 0-10 scale
    const proportion = totalQuestions > 0 ? sensitivityCount / totalQuestions : 0;
    const standardizedScore = proportion * 10;
    
    return {
        rawCount: sensitivityCount,
        totalQuestions: totalQuestions,
        proportion: proportion,
        standardizedScore: standardizedScore
    };
}

// Calculate Component Sensitivity
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

// Calculate Impact
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
    });
    
    // Standardize individual component impacts (multiply by 2.5)
    Object.keys(impactScores.byComponent).forEach(comp => {
        impactScores.byComponent[comp] *= 2.5;
    });
    
    // Calculate overall impact
    fireComponents.forEach(fireComp => {
        impactScores.overall += impactScores.byFire[fireComp].total;
    });
    
    return impactScores;
}

// Calculate Treatment Effects (all 3 treatments)
function calculateTreatmentEffects() {
    const treatments = {};
    
    for (let i = 1; i <= 3; i++) {
        const treatmentScores = {
            fire: {},
            fuel: {},
            ecosystem: {},
            totalFire: 0,
            totalFuel: 0,
            totalEcosystem: 0,
            total: 0,
            standardizedTotal: 0
        };
        
        // Fire components
        fireComponents.forEach(comp => {
            const select = document.getElementById(`treatment-${i}-fire-${comp}`);
            const score = select && select.value ? parseInt(select.value) : 0;
            treatmentScores.fire[comp] = score;
            treatmentScores.totalFire += score;
        });
        
        // Fuel components
        fuelComponents.forEach(comp => {
            const select = document.getElementById(`treatment-${i}-fuel-${comp}`);
            const score = select && select.value ? parseInt(select.value) : 0;
            treatmentScores.fuel[comp] = score;
            treatmentScores.totalFuel += score;
        });
        
        // Ecosystem components
        ecosystemComponents.forEach(comp => {
            const select = document.getElementById(`treatment-${i}-ecosystem-${comp}`);
            const score = select && select.value ? parseInt(select.value) : 0;
            treatmentScores.ecosystem[comp] = score;
            treatmentScores.totalEcosystem += score;
        });
        
        // Total and standardized
        treatmentScores.total = treatmentScores.totalFire + treatmentScores.totalFuel + treatmentScores.totalEcosystem;
        treatmentScores.standardizedTotal = (treatmentScores.totalEcosystem + treatmentScores.totalFuel) * 0.25;
        
        treatments[`treatment${i}`] = treatmentScores;
    }
    
    return treatments;
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
    
    // Step 5: Calculate preliminary impact score
    const preliminaryImpact = impactScores.overall;
    
    // Step 6: Calculate vulnerability before treatment
    const vulnerabilityBeforeTreatment = (preliminaryImpact + intrinsicSensitivity.standardizedScore) * 0.22;
    
    // Step 7: Calculate treatment effects
    const treatmentEffects = calculateTreatmentEffects();
    
    // Step 8: Calculate vulnerabilities with each treatment
    const vulnerabilities = {
        beforeTreatment: vulnerabilityBeforeTreatment,
        treatment1: vulnerabilityBeforeTreatment - treatmentEffects.treatment1.standardizedTotal,
        treatment2: vulnerabilityBeforeTreatment - treatmentEffects.treatment2.standardizedTotal,
        treatment3: vulnerabilityBeforeTreatment - treatmentEffects.treatment3.standardizedTotal
    };
    
    // Best treatment (lowest vulnerability)
    const bestVulnerability = Math.min(
        vulnerabilities.treatment1,
        vulnerabilities.treatment2,
        vulnerabilities.treatment3
    );
    
    // Store results
    assessmentData.results = {
        exposure: exposureScores,
        sensitivity: intrinsicSensitivity,
        componentSensitivity: componentSensitivity,
        impact: impactScores,
        treatments: treatmentEffects,
        vulnerability: vulnerabilities,
        finalVulnerability: treatmentEffects.treatment1.total > 0 || 
                           treatmentEffects.treatment2.total > 0 || 
                           treatmentEffects.treatment3.total > 0 ? 
                           bestVulnerability : vulnerabilityBeforeTreatment
    };
    
    // Update displays
    updateResultsDisplay();
    updateComponentScores();
    updateRecommendations();
    updateTreatmentCharts();
}

// Update results display
function updateResultsDisplay() {
    const results = assessmentData.results;
    if (!results || !results.vulnerability) return;
    
    const vulnerability = results.finalVulnerability;
    
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
                <h4>Before Treatment</h4>
                <div class="score-value" style="color: #dc2626;">${results.vulnerability.beforeTreatment.toFixed(1)}</div>
                <div class="score-description">Vulnerability (-7 to +10)</div>
            </div>
            <div class="score-card">
                <h4>Final Vulnerability</h4>
                <div class="score-value" style="color: #059669;">${vulnerability.toFixed(1)}</div>
                <div class="score-description">After best treatment</div>
            </div>
        `;
    }
}

// Update component scores
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
                        <div class="score-description" style="font-size: 0.8rem;">Climate impact on fire</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="component-score-item" style="opacity: 0.6;">
                        <h6>${fireComponentNames[fireComp]}</h6>
                        <div class="component-score-value" style="color: #6b7280;">-</div>
                        <div class="score-description" style="font-size: 0.8rem;">No exposure calculated<br>(no impact indicated)</div>
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
    
    // Ecosystem components
    html += '<div style="grid-column: 1/-1; margin-top: 1rem; margin-bottom: 0.5rem; padding: 0.5rem; background: #f0f9ff; border-radius: 4px;"><strong style="color: #0369a1;">Ecosystem Components</strong></div>';
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
                    <div class="score-description" style="font-size: 0.8rem;">${impact > 0 ? '↑ More vulnerable' : impact < 0 ? '↓ Less vulnerable' : '= Neutral'}</div>
                </div>
            `;
        }
    });
    
    // Fuel components
    html += '<div style="grid-column: 1/-1; margin-top: 1rem; margin-bottom: 0.5rem; padding: 0.5rem; background: #fef3c7; border-radius: 4px;"><strong style="color: #92400e;">Fuel Components</strong></div>';
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
                    <div class="score-description" style="font-size: 0.8rem;">${impact > 0 ? '↑ More vulnerable' : impact < 0 ? '↓ Less vulnerable' : '= Neutral'}</div>
                </div>
            `;
        }
    });
    
    html += "</div>";
    componentScoresContainer.innerHTML = html;
}

// Update treatment comparison charts
function updateTreatmentCharts() {
    const results = assessmentData.results;
    if (!results || !results.treatments) return;
    
    // Check if any treatments have data
    const hasData = results.treatments.treatment1.total > 0 || 
                    results.treatments.treatment2.total > 0 || 
                    results.treatments.treatment3.total > 0;
    
    const section = document.getElementById("treatment-comparison-section");
    if (!hasData) {
        if (section) section.style.display = "none";
        return;
    }
    
    if (section) section.style.display = "block";
    
    const container = document.getElementById("treatment-charts-container");
    if (!container) return;
    
    let html = `
        <div class="treatment-chart">
            <h5>Vulnerability Comparison</h5>
            <div class="chart-bars">
    `;
    
    const vulns = results.vulnerability;
    const maxVuln = Math.max(
        Math.abs(vulns.beforeTreatment),
        Math.abs(vulns.treatment1),
        Math.abs(vulns.treatment2),
        Math.abs(vulns.treatment3)
    );
    
    // Before treatment
    html += `
        <div class="chart-bar-container">
            <div class="chart-label" style="min-width: 180px;">Before Treatment</div>
            <div class="chart-bar" style="width: ${Math.abs(vulns.beforeTreatment) / maxVuln * 80}%; background: #dc2626;">
                ${vulns.beforeTreatment.toFixed(1)}
            </div>
        </div>
    `;
    
    // Treatment 1
    if (results.treatments.treatment1.total > 0) {
        const reduction1 = vulns.beforeTreatment - vulns.treatment1;
        html += `
            <div class="chart-bar-container">
                <div class="chart-label" style="min-width: 180px;">Treatment 1</div>
                <div class="chart-bar" style="width: ${Math.abs(vulns.treatment1) / maxVuln * 80}%; background: #16a34a;">
                    ${vulns.treatment1.toFixed(1)} <span style="font-size: 0.85em;">(${reduction1 >= 0 ? '-' : '+'}${Math.abs(reduction1).toFixed(1)})</span>
                </div>
            </div>
        `;
    }
    
    // Treatment 2
    if (results.treatments.treatment2.total > 0) {
        const reduction2 = vulns.beforeTreatment - vulns.treatment2;
        html += `
            <div class="chart-bar-container">
                <div class="chart-label" style="min-width: 180px;">Treatment 2</div>
                <div class="chart-bar" style="width: ${Math.abs(vulns.treatment2) / maxVuln * 80}%; background: #2563eb;">
                    ${vulns.treatment2.toFixed(1)} <span style="font-size: 0.85em;">(${reduction2 >= 0 ? '-' : '+'}${Math.abs(reduction2).toFixed(1)})</span>
                </div>
            </div>
        `;
    }
    
    // Treatment 3
    if (results.treatments.treatment3.total > 0) {
        const reduction3 = vulns.beforeTreatment - vulns.treatment3;
        html += `
            <div class="chart-bar-container">
                <div class="chart-label" style="min-width: 180px;">Treatment 3</div>
                <div class="chart-bar" style="width: ${Math.abs(vulns.treatment3) / maxVuln * 80}%; background: #9333ea;">
                    ${vulns.treatment3.toFixed(1)} <span style="font-size: 0.85em;">(${reduction3 >= 0 ? '-' : '+'}${Math.abs(reduction3).toFixed(1)})</span>
                </div>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
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
    
    const vulnerability = results.finalVulnerability;
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
        recommendations = "Moderate vulnerability suggests monitoring and selective management. Consider preventive treatments and continue regular assessment.";
        findings.push("Moderate vulnerability with manageable risk levels");
        findings.push("Some components show sensitivity to fire-climate interactions");
        findings.push("Continue monitoring and consider preventive measures");
    } else if (vulnerability >= -2) {
        recommendations = "Low vulnerability indicates good resilience. Maintain current management practices and continue monitoring.";
        findings.push("Low vulnerability - system shows resilience");
        findings.push("Most components adapt well to expected changes");
        findings.push("Maintain existing management regime");
    } else {
        recommendations = "Very low vulnerability indicates excellent resilience. System well-adapted to fire-climate interactions.";
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
        fireclimeVersion: "3.2",
        results: results,
        methodology: "Southwest FireCLIME Vulnerability Assessment",
        overallVulnerability: results?.finalVulnerability || 0,
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
