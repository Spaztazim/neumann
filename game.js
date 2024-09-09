// Game state
let state = {
    resources: {
        metal: 0,
        energy: 0,
        rareMinerals: 0,
        data: 0,
        antimatter: 0
    },
    probes: {
        mining: { count: 0, level: 1 },
        energy: { count: 0, level: 1 },
        research: { count: 0, level: 1 },
        combat: { count: 0, level: 1 }
    },
    probeCosts: {
        mining: { metal: 10, energy: 5 },
        energy: { metal: 5, energy: 10 },
        research: { metal: 15, energy: 15 },
        combat: { metal: 20, energy: 20 }
    },
    systems: 0,
    systemResources: [],
    research: {
        points: 0,
        upgrades: {
            fasterGathering: { level: 0, effect: 1.1, cost: 10, description: "Increase manual gathering by 10% per level" },
            efficientMining: { level: 0, effect: 1.1, cost: 20, description: "Increase mining efficiency by 10% per level" },
            advancedEnergy: { level: 0, effect: 1.15, cost: 30, description: "Increase energy production by 15% per level" },
            improvedDataAnalysis: { level: 0, effect: 1.2, cost: 40, description: "Increase data generation by 20% per level" },
            enhancedCombat: { level: 0, effect: 1.25, cost: 50, description: "Increase rare mineral discovery by 25% per level" }
        }
    },
    achievements: {
        probeBuilder: { earned: false, condition: () => getTotalProbes() >= 10 },
        galaxyExplorer: { earned: false, condition: () => state.systems >= 100 },
        resourceMogul: { earned: false, condition: () => state.resources.metal >= 1000000 }
    },
    prestigePoints: 0,
    lastSaveTime: Date.now(),
    language: 'en',
    challenges: {
        speedRun: { active: false, goal: 1000, progress: 0, reward: 'Faster probes' },
        resourceHoarder: { active: false, goal: 1000000, progress: 0, reward: 'Increased storage' }
    },
    automation: {
        autoGather: { unlocked: false, cost: 100 },
        autoBuild: { unlocked: false, cost: 500 }
    }
};

// DOM elements
const resourceCounts = {
    metal: document.getElementById('metal-count'),
    energy: document.getElementById('energy-count'),
    rareMinerals: document.getElementById('rare-minerals-count'),
    data: document.getElementById('data-count'),
    antimatter: document.getElementById('antimatter-count')
};

const probeCounts = {
    mining: document.getElementById('mining-probe-count'),
    energy: document.getElementById('energy-probe-count'),
    research: document.getElementById('research-probe-count'),
    combat: document.getElementById('combat-probe-count')
};

const probeLevels = {
    mining: document.getElementById('mining-probe-level'),
    energy: document.getElementById('energy-probe-level'),
    research: document.getElementById('research-probe-level'),
    combat: document.getElementById('combat-probe-level')
};

const systemsCount = document.getElementById('systems-count');
const researchPoints = document.getElementById('research-points');
const prestigePointsDisplay = document.getElementById('prestige-points');

// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    function setActiveTab(tabId) {
        console.log(`Setting active tab: ${tabId}`);
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        const activeButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        const activePane = document.getElementById(`${tabId}-tab`);
        
        if (activeButton && activePane) {
            activeButton.classList.add('active');
            activePane.classList.add('active');
        } else {
            console.error(`Could not find elements for tab: ${tabId}`);
        }
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log(`Tab button clicked: ${button.dataset.tab}`);
            setActiveTab(button.dataset.tab);
        });
    });

    // Set the initial active tab
    setActiveTab('mining');

    // Add event listeners for manual gather buttons
    ['metal', 'energy', 'research'].forEach(resource => {
        const button = document.getElementById(`gather-${resource}`);
        if (button) {
            button.addEventListener('click', () => {
                console.log(`Gather ${resource} button clicked`);
                gatherResource(resource);
            });
        } else {
            console.error(`Gather ${resource} button not found`);
        }
    });

    // Add event listeners for build probe buttons
    ['mining', 'energy', 'research', 'combat'].forEach(probeType => {
        const button = document.getElementById(`build-${probeType}-probe`);
        if (button) {
            button.addEventListener('click', () => {
                console.log(`Build ${probeType} probe button clicked`);
                buildProbe(probeType);
            });
        } else {
            console.error(`Build ${probeType} probe button not found`);
        }
    });

    // Add event listeners for upgrade probe buttons
    ['mining', 'energy', 'research', 'combat'].forEach(probeType => {
        const button = document.getElementById(`upgrade-${probeType}-probe`);
        if (button) {
            button.addEventListener('click', () => {
                console.log(`Upgrade ${probeType} probe button clicked`);
                upgradeProbe(probeType);
            });
        } else {
            console.error(`Upgrade ${probeType} probe button not found`);
        }
    });

    // Initial display update
    updateDisplay();

    // Load game
    loadGame();

    // Auto-save every minute
    setInterval(saveGame, 60000);

    // Save game when closing the tab or navigating away
    window.addEventListener('beforeunload', saveGame);

    // Add event listener for save game button
    document.getElementById('save-game').addEventListener('click', function() {
        saveGame();
        alert('Game saved!');
    });
});

function gatherResource(type) {
    console.log(`Gathering ${type}`);
    let amount = 1;
    if (type === 'metal' || type === 'energy') {
        amount *= getResearchEffect('fasterGathering');
    }
    if (type === 'research') {
        state.research.points += amount;
    } else {
        state.resources[type] += amount * 10;
    }
    console.log(`New ${type} amount: ${type === 'research' ? state.research.points : state.resources[type]}`);
    updateDisplay();
}

// Probe building function
function buildProbe(type) {
    console.log(`Building ${type} probe`);
    let cost = calculateProbeCost(type, 1);
    if (state.resources.metal >= cost.metal && state.resources.energy >= cost.energy) {
        state.resources.metal -= cost.metal;
        state.resources.energy -= cost.energy;
        state.probes[type].count++;
        console.log(`New ${type} probe count: ${state.probes[type].count}`);
        updateDisplay();
    } else {
        console.log(`Not enough resources to build ${type} probe`);
    }
}

function calculateProbeCost(type, count) {
    let baseCost = state.probeCosts[type];
    let totalCost = { metal: 0, energy: 0 };
    for (let i = 0; i < count; i++) {
        totalCost.metal += Math.ceil(baseCost.metal * Math.pow(1.02, i));
        totalCost.energy += Math.ceil(baseCost.energy * Math.pow(1.02, i));
    }
    return totalCost;
}

function exploreNewSystem() {
    state.systems++;
    state.systemResources.push(generateSystemResources());
    state.research.points += 1; // Gain 1 research point for each new system explored
    if (Math.random() < 0.1) {
        triggerExplorationEvent();
    }
}

function generateSystemResources() {
    return {
        metal: Math.random() * 5 + 1,
        energy: Math.random() * 5 + 1,
        rareMinerals: Math.random() * 2 + 0.1,
        data: Math.random() * 3 + 0.5,
        antimatter: Math.random() * 0.1 + 0.01
    };
}

function triggerExplorationEvent() {
    // Implement random events
    console.log("An exploration event occurred!");
}

function buyResearchUpgrade(upgrade) {
    let upgradeData = state.research.upgrades[upgrade];
    if (state.research.points >= upgradeData.cost) {
        state.research.points -= upgradeData.cost;
        upgradeData.level++;
        upgradeData.cost = Math.ceil(upgradeData.cost * 1.5);
        let newEffect = getResearchEffect(upgrade);
        console.log(`Bought ${upgrade} upgrade. New level: ${upgradeData.level}, New effect: ${newEffect.toFixed(2)}`);
        updateDisplay();
    } else {
        console.log(`Not enough research points to buy ${upgrade} upgrade`);
    }
}

function getResearchEffect(upgrade) {
    if (state.research.upgrades[upgrade] && state.research.upgrades[upgrade].level > 0) {
        let effect = Math.pow(state.research.upgrades[upgrade].effect, state.research.upgrades[upgrade].level);
        console.log(`Research effect for ${upgrade}: ${effect.toFixed(2)} (Level: ${state.research.upgrades[upgrade].level})`);
        return effect;
    }
    return 1; // Default effect if the upgrade doesn't exist or is level 0
}

function checkAchievements() {
    for (let [key, achievement] of Object.entries(state.achievements)) {
        if (!achievement.earned && achievement.condition()) {
            achievement.earned = true;
            displayAchievementNotification(key);
        }
    }
}

function displayAchievementNotification(achievementKey) {
    alert(`Achievement unlocked: ${achievementKey}`);
}

function prestige() {
    let prestigePoints = calculatePrestigePoints();
    if (prestigePoints > 0) {
        let confirmed = confirm(`Are you sure you want to prestige? You will earn ${prestigePoints} prestige points.`);
        if (confirmed) {
            initializeGameState();
            state.prestigePoints += prestigePoints;
            applyPrestigeEffects();
            updateDisplay();
        }
    }
}

function initializeGameState() {
    state = {
        resources: {
            metal: 0,
            energy: 0,
            rareMinerals: 0,
            data: 0,
            antimatter: 0
        },
        probes: {
            mining: { count: 0, level: 1 },
            energy: { count: 0, level: 1 },
            research: { count: 0, level: 1 },
            combat: { count: 0, level: 1 }
        },
        probeCosts: {
            mining: { metal: 10, energy: 5 },
            energy: { metal: 5, energy: 10 },
            research: { metal: 15, energy: 15 },
            combat: { metal: 20, energy: 20 }
        },
        systems: 0,
        systemResources: [],
        research: {
            points: 0,
            upgrades: {
                fasterGathering: { level: 0, effect: 1.1, cost: 10, description: "Increase manual gathering by 10% per level" },
                efficientMining: { level: 0, effect: 1.1, cost: 20, description: "Increase mining efficiency by 10% per level" },
                advancedEnergy: { level: 0, effect: 1.15, cost: 30, description: "Increase energy production by 15% per level" },
                improvedDataAnalysis: { level: 0, effect: 1.2, cost: 40, description: "Increase data generation by 20% per level" },
                enhancedCombat: { level: 0, effect: 1.25, cost: 50, description: "Increase rare mineral discovery by 25% per level" }
            }
        },
        achievements: {
            probeBuilder: { earned: false, condition: () => getTotalProbes() >= 10 },
            galaxyExplorer: { earned: false, condition: () => state.systems >= 100 },
            resourceMogul: { earned: false, condition: () => state.resources.metal >= 1000000 }
        },
        prestigePoints: 0,
        lastSaveTime: Date.now(),
        language: 'en',
        challenges: {
            speedRun: { active: false, goal: 1000, progress: 0, reward: 'Faster probes' },
            resourceHoarder: { active: false, goal: 1000000, progress: 0, reward: 'Increased storage' }
        },
        automation: {
            autoGather: { unlocked: false, cost: 100 },
            autoBuild: { unlocked: false, cost: 500 }
        }
    };
}

function applyPrestigeEffects() {
    // Apply bonuses based on prestige points
    // For example, increase resource gathering rate or probe efficiency
}

function calculatePrestigePoints() {
    // Calculate prestige points based on current game state
    // This could be a complex formula that takes into account various factors
    return Math.floor(state.systems / 10);
}

// Update display function
function updateDisplay() {
    console.log("Updating display");
    // Update resource counts and generation rates
    for (let resource in state.resources) {
        let countElement = document.getElementById(`${resource}-count`);
        let genElement = document.getElementById(`${resource}-gen`);
        if (countElement) {
            countElement.textContent = Math.floor(state.resources[resource]);
        }
        if (genElement) {
            genElement.textContent = calculateGenerationRate(resource).toFixed(4);
        }
    }
    
    // Update research points
    let researchPointsElement = document.getElementById('research-points');
    if (researchPointsElement) {
        researchPointsElement.textContent = Math.floor(state.research.points);
    }

    // Update probe counts, levels, and costs
    for (let probe in state.probes) {
        let countElement = document.getElementById(`${probe}-probe-count`);
        let levelElement = document.getElementById(`${probe}-probe-level`);
        let buildButton = document.getElementById(`build-${probe}-probe`);
        let upgradeButton = document.getElementById(`upgrade-${probe}-probe`);
        
        if (countElement) {
            countElement.textContent = state.probes[probe].count;
        }
        if (levelElement) {
            levelElement.textContent = state.probes[probe].level;
        }
        
        if (buildButton) {
            let buildCost = calculateProbeCost(probe, 1);
            buildButton.textContent = `Build ${probe} Probe (${buildCost.metal} Metal, ${buildCost.energy} Energy)`;
            buildButton.disabled = state.resources.metal < buildCost.metal || state.resources.energy < buildCost.energy;
        }
        
        if (upgradeButton) {
            let upgradeCost = calculateProbeUpgradeCost(probe);
            upgradeButton.textContent = `Upgrade ${probe} Probe (${upgradeCost.metal} Metal, ${upgradeCost.energy} Energy)`;
            upgradeButton.disabled = state.resources.metal < upgradeCost.metal || state.resources.energy < upgradeCost.energy;
        }
    }

    // Update research upgrades
    const upgradeList = document.getElementById('upgrade-list');
    if (upgradeList) {
        upgradeList.innerHTML = '';
        for (let upgrade in state.research.upgrades) {
            let upgradeData = state.research.upgrades[upgrade];
            let upgradeElement = document.createElement('div');
            upgradeElement.className = 'upgrade-item';
            upgradeElement.innerHTML = `
                <span>${upgrade} (Level ${upgradeData.level})</span>
                <span>${upgradeData.description}</span>
                <button onclick="buyResearchUpgrade('${upgrade}')" ${state.research.points < upgradeData.cost ? 'disabled' : ''}>
                    Upgrade (${Math.ceil(upgradeData.cost)} RP)
                </button>
            `;
            upgradeList.appendChild(upgradeElement);
        }
    }

    console.log("Display update complete");
}

function calculateGenerationRate(resource) {
    let rate = 0;
    switch(resource) {
        case 'metal':
            rate = state.probes.mining.count * state.probes.mining.level * getResearchEffect('efficientMining');
            break;
        case 'energy':
            rate = state.probes.energy.count * state.probes.energy.level * getResearchEffect('advancedEnergy');
            break;
        case 'rareMinerals':
            rate = state.probes.combat.count * state.probes.combat.level * 0.1 * getResearchEffect('enhancedCombat');
            break;
        case 'data':
            rate = state.probes.research.count * state.probes.research.level * 0.1 * getResearchEffect('improvedDataAnalysis');
            break;
        case 'antimatter':
            rate = state.systems * 0.001;
            break;
    }
    return rate;
}

// Sound effects
function playSound(id) {
    document.getElementById(id).play();
}

// Add event listeners to update costs when radio buttons are clicked
document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', updateDisplay);
});

// Initial display update
updateDisplay();

// Offline progress
function calculateOfflineProgress() {
    let now = Date.now();
    let offlineTime = now - state.lastSaveTime;
    // Calculate resources gained during offline time
    // This could be a complex formula that takes into account various factors
    let offlineResources = {
        metal: offlineTime * 0.01,
        energy: offlineTime * 0.005,
        rareMinerals: offlineTime * 0.001,
        data: offlineTime * 0.0005,
        antimatter: offlineTime * 0.0001
    };
    for (let resource in offlineResources) {
        state.resources[resource] += offlineResources[resource];
    }
    state.lastSaveTime = now;
    updateDisplay();
}

// Run offline progress calculation when the window is focused
window.addEventListener('focus', calculateOfflineProgress);

// Save/load
function saveGame() {
    localStorage.setItem('neumannSave', JSON.stringify(state));
    console.log('Game saved');
}

function loadGame() {
    let savedState = localStorage.getItem('neumannSave');
    if (savedState) {
        state = JSON.parse(savedState);
        console.log('Game loaded');
        updateDisplay();
    } else {
        console.log('No saved game found');
    }
}

// Automatic saving
setInterval(saveGame, 60000); // Save every minute

// Load game on page load
window.addEventListener('load', loadGame);

// Statistics
function updateStatistics() {
    // Update statistics display
    // This could include various metrics such as total resources gathered, probes built, etc.
}

// Tooltips
// Add tooltips to relevant elements using the tooltip class and tooltiptext span

// Localization
const translations = {
    en: {
        gather: 'Gather',
        build: 'Build',
        // Add more translations
    },
    es: {
        gather: 'Recolectar',
        build: 'Construir',
        // Add more translations
    }
};

function setLanguage(lang) {
    state.language = lang;
    updateDisplay();
}

function getTranslation(key) {
    return translations[state.language][key] || key;
}

// Challenges
function startChallenge(challengeName) {
    if (!state.challenges[challengeName].active) {
        state.challenges[challengeName].active = true;
        state.challenges[challengeName].progress = 0;
        updateDisplay();
    }
}

function updateChallengeProgress() {
    if (state.challenges.speedRun.active) {
        state.challenges.speedRun.progress = state.systems;
        if (state.challenges.speedRun.progress >= state.challenges.speedRun.goal) {
            completeChallenge('speedRun');
        }
    }
    if (state.challenges.resourceHoarder.active) {
        state.challenges.resourceHoarder.progress = state.resources.metal;
        if (state.challenges.resourceHoarder.progress >= state.challenges.resourceHoarder.goal) {
            completeChallenge('resourceHoarder');
        }
    }
}

function completeChallenge(challengeName) {
    state.challenges[challengeName].active = false;
    alert(`Challenge completed: ${challengeName}! Reward: ${state.challenges[challengeName].reward}`);
    // Apply challenge reward
    if (challengeName === 'speedRun') {
        // Implement faster probes
    } else if (challengeName === 'resourceHoarder') {
        // Implement increased storage
    }
    updateDisplay();
}

// Automation upgrades
function unlockAutomation(type) {
    if (state.resources.energy >= state.automation[type].cost) {
        state.resources.energy -= state.automation[type].cost;
        state.automation[type].unlocked = true;
        updateDisplay();
    }
}

function autoGather() {
    if (state.automation.autoGather.unlocked) {
        gatherResource('metal');
        gatherResource('energy');
    }
}

function autoBuild() {
    if (state.automation.autoBuild.unlocked) {
        ['mining', 'energy', 'research', 'combat'].forEach(probeType => {
            if (state.resources.metal >= state.probeCosts[probeType].metal &&
                state.resources.energy >= state.probeCosts[probeType].energy) {
                buildProbe(probeType);
            }
        });
    }
}

// Add this function to calculate resource generation rates
function calculateGenerationRates() {
    let rates = {
        metal: 0,
        energy: 0,
        rareMinerals: 0,
        data: 0,
        antimatter: 0,
        research: 0
    };

    for (let probeType in state.probes) {
        let probeCount = state.probes[probeType].count;
        let probeLevel = state.probes[probeType].level;
        
        switch(probeType) {
            case 'mining':
                rates.metal += probeCount * probeLevel;
                break;
            case 'energy':
                rates.energy += probeCount * probeLevel;
                break;
            case 'research':
                rates.research += probeCount * probeLevel * 0.5;
                rates.data += probeCount * probeLevel * 0.1;
                break;
            case 'combat':
                rates.rareMinerals += probeCount * probeLevel * 0.1;
                break;
        }
    }
    
    rates.antimatter = state.systems * 0.001;
    rates.research += state.systems * 0.1;

    return rates;
}

// Run game loop every second
setInterval(() => {
    generateResources();
    autoGather();
    autoBuild();
    updateChallengeProgress();
}, 1000);

function generateResources() {
    console.log("Generating resources...");
    console.log("Current state:", JSON.stringify(state.probes));

    let generated = {
        metal: 0,
        energy: 0,
        rareMinerals: 0,
        data: 0,
        antimatter: 0,
        research: 0
    };

    for (let probeType in state.probes) {
        let probeCount = state.probes[probeType].count;
        let probeLevel = state.probes[probeType].level;
        
        console.log(`${probeType} probes: ${probeCount}, level: ${probeLevel}`);

        switch(probeType) {
            case 'mining':
                let miningEffect = getResearchEffect('efficientMining');
                let metalGenerated = probeCount * probeLevel * miningEffect;
                generated.metal += metalGenerated;
                console.log(`Generated ${metalGenerated.toFixed(2)} metal (Mining effect: ${miningEffect.toFixed(2)})`);
                break;
            case 'energy':
                let energyEffect = getResearchEffect('advancedEnergy');
                let energyGenerated = probeCount * probeLevel * energyEffect;
                generated.energy += energyGenerated;
                console.log(`Generated ${energyGenerated.toFixed(2)} energy (Energy effect: ${energyEffect.toFixed(2)})`);
                break;
            case 'research':
                generated.research += probeCount * probeLevel * 0.5;
                let dataEffect = getResearchEffect('improvedDataAnalysis');
                let dataGenerated = probeCount * probeLevel * 0.1 * dataEffect;
                generated.data += dataGenerated;
                console.log(`Generated ${dataGenerated.toFixed(2)} data (Data effect: ${dataEffect.toFixed(2)})`);
                break;
            case 'combat':
                let combatEffect = getResearchEffect('enhancedCombat');
                let rareMineralsGenerated = probeCount * probeLevel * 0.1 * combatEffect;
                generated.rareMinerals += rareMineralsGenerated;
                console.log(`Generated ${rareMineralsGenerated.toFixed(2)} rare minerals (Combat effect: ${combatEffect.toFixed(2)})`);
                break;
        }
    }
    
    generated.antimatter += state.systems * 0.001;
    console.log(`Generated antimatter: ${state.systems * 0.001}`);
    
    generated.research += state.systems * 0.1;
    console.log(`Generated additional research points: ${state.systems * 0.1}`);
    
    // Update the state with generated resources
    for (let resource in generated) {
        if (resource === 'research') {
            state.research.points += generated[resource];
        } else {
            state.resources[resource] += generated[resource];
        }
        console.log(`Total ${resource}: ${resource === 'research' ? state.research.points : state.resources[resource]}`);
    }
    
    updateDisplay();
}

function testGeneration() {
    for (let i = 0; i < 10; i++) {
        generateResources();
    }
    console.log("Test generation complete. Check the updated resource counts.");
}

// Add event listeners for new buttons
document.getElementById('upgrade-mining-probe').addEventListener('click', () => upgradeProbe('mining'));
document.getElementById('upgrade-energy-probe').addEventListener('click', () => upgradeProbe('energy'));
document.getElementById('upgrade-research-probe').addEventListener('click', () => upgradeProbe('research'));
document.getElementById('upgrade-combat-probe').addEventListener('click', () => upgradeProbe('combat'));

function upgradeProbe(type) {
    console.log(`Upgrading ${type} probe`);
    let probe = state.probes[type];
    let cost = calculateProbeUpgradeCost(type);
    if (state.resources.metal >= cost.metal && state.resources.energy >= cost.energy) {
        state.resources.metal -= cost.metal;
        state.resources.energy -= cost.energy;
        probe.level++;
        console.log(`New ${type} probe level: ${probe.level}`);
        updateDisplay();
    } else {
        console.log(`Not enough resources to upgrade ${type} probe`);
    }
}

function calculateProbeUpgradeCost(type) {
    let probe = state.probes[type];
    let baseCost = 100;
    let cost = Math.ceil(baseCost * Math.pow(1.5, probe.level));
    return { metal: cost, energy: cost };
}
