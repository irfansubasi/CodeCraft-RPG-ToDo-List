const addQuestBtn = document.querySelector('.add-quest-btn');
const modal = document.querySelector('#quest-modal');
const questForm = document.querySelector('#quest-form');
const questList = document.querySelector('.quests');
const deleteModal = document.querySelector('#delete-modal');
const cancelDeleteBtn = document.querySelector('#cancel-delete');
const confirmDeleteBtn = document.querySelector('#confirm-delete');
const modalCloseBtns = document.querySelectorAll('.modal-close-btn');
const detailModal = document.querySelector('#detail-modal');
const editQuestBtn = document.querySelector('#edit-quest-btn');
const deleteQuestBtn = document.querySelector('#delete-quest-btn');
const setupModal = document.querySelector('#setup-modal');
const setupForm = document.querySelector('#setup-form');
let isEditMode = false;
let currentEditQuestId = null;
let currentDetailQuestId = null;

let playerData = {
    name: '',
    class: 'Necromancer',
    level: 1,
    gold: 0,
    maxHealth: 100,
    currentHealth: 100,
    experience: 0,
    maxExperience: 100
};

let enemyData = {
    name: 'Worm',
    maxHealth: 100,
    currentHealth: 100,
    currentEnemyIndex: 0
};

const enemyProgression = [
    { name: 'Worm', health: 100 },
    { name: 'Mage', health: 120 },
    { name: 'Evil Wizard', health: 150 },
    { name: 'Dark King', health: 200 }
];

function updateEnemyHealth() {
    const enemyHealthFill = document.querySelector('.enemy-stats .health-fill');
    if (enemyHealthFill) {
        const healthPercentage = (enemyData.currentHealth / enemyData.maxHealth) * 100;
        enemyHealthFill.style.width = `${healthPercentage}%`;
        enemyHealthFill.textContent = `${enemyData.currentHealth}/${enemyData.maxHealth}`;
    }
}

function damageEnemy(damage) {
    enemyData.currentHealth = Math.max(0, enemyData.currentHealth - damage);
    updateEnemyHealth();
    saveEnemyData();
    
    if (enemyData.currentHealth <= 0) {
        enemyDefeated();
    }
}

function enemyDefeated() {
    addGold(50);
    
    playEnemyAnimation('death');
    
    setTimeout(() => {
        enemyData.currentEnemyIndex++;
        
        if (enemyData.currentEnemyIndex < enemyProgression.length) {
            const nextEnemy = enemyProgression[enemyData.currentEnemyIndex];
            enemyData.name = nextEnemy.name;
            enemyData.maxHealth = nextEnemy.health;
            enemyData.currentHealth = nextEnemy.health;
            
            updateEnemyImage();
            updateEnemyName();
            
            showNotification(`New enemy appeared: ${nextEnemy.name}!`, 'purchase-notification');
        } else {
            enemyData.currentEnemyIndex = 0;
            const firstEnemy = enemyProgression[0];
            enemyData.name = firstEnemy.name;
            enemyData.maxHealth = firstEnemy.health;
            enemyData.currentHealth = firstEnemy.health;
            
            updateEnemyImage();
            updateEnemyName();
            showNotification('All enemies defeated! Starting over...', 'purchase-notification');
        }
        
        updateEnemyHealth();
        saveEnemyData();
    }, 7000);
}

function calculateDamage(priority) {
    const baseDamage = {
        'high': 8,
        'medium': 6,
        'low': 3,
        'default': 5
    };
    
    const levelMultiplier = 1 + (playerData.level - 1) * 0.2;
    return Math.round(baseDamage[priority] || baseDamage.default * levelMultiplier);
}

function calculatePlayerDamage(priority) {
    const baseDamage = {
        'high': 6,
        'medium': 4,
        'low': 2,
        'default': 3
    };
    
    const levelMultiplier = 1 + (playerData.level - 1) * 0.2;
    return Math.round(baseDamage[priority] || baseDamage.default * levelMultiplier);
}

function updatePlayerInfo() {
    const playerInfo = document.querySelector('#player-info');
    const playerNameText = document.querySelector('.player-name-text h1');
    
    if (playerInfo) {
        playerInfo.innerHTML = `${playerData.class} Level ${playerData.level} <img src="./assets/icons/coin.svg" alt="coin" class="player-coin"> ${playerData.gold}`;
    }
    
    if (playerNameText && playerData.name) {
        playerNameText.textContent = playerData.name;
    }
}

function updatePlayerExperience() {
    const experienceFill = document.querySelector('.player-stats .experience-fill');
    if (experienceFill) {
        const experiencePercentage = (playerData.experience / playerData.maxExperience) * 100;
        experienceFill.style.width = `${experiencePercentage}%`;
        experienceFill.textContent = `${playerData.experience}/${playerData.maxExperience}`;
    }
}

function addExperience(amount) {
    playerData.experience += amount;
    
    if (playerData.experience >= playerData.maxExperience && playerData.level < 10) {
        levelUp();
    }
    
    updatePlayerExperience();
    updatePlayerInfo();
    savePlayerData();
}

function levelUp() {
    playerData.level++;
    playerData.experience = 0;
    
    updatePlayerHealth();
    updatePlayerExperience();
    updatePlayerInfo();
    savePlayerData();
}

function updatePlayerHealth() {
    const playerHealthFill = document.querySelector('.player-stats .health-fill');
    if (playerHealthFill && playerData.currentHealth !== undefined && playerData.maxHealth !== undefined) {
        const healthPercentage = (playerData.currentHealth / playerData.maxHealth) * 100;
        playerHealthFill.style.width = `${healthPercentage}%`;
        playerHealthFill.textContent = `${playerData.currentHealth}/${playerData.maxHealth}`;
    }
}

function damagePlayer(damage) {
    playerData.currentHealth = Math.max(0, playerData.currentHealth - damage);
    updatePlayerHealth();
    updatePlayerInfo();
    savePlayerData();
    
    if (playerData.currentHealth <= 0) {
        playerDefeated();
        playDeathAnimation();
    }
}

function playerDefeated() {
    playerData.currentHealth = playerData.maxHealth;
    updatePlayerHealth();
    updatePlayerInfo();
    savePlayerData();
}

function playHeroAnimation(animationType) {
    const heroImg = document.querySelector('.hero img');
    if (heroImg) {
        const currentClass = playerData.class;
        let animationPath = '';
        
        switch(animationType) {
            case 'attack':
                animationPath = `./assets/characters/heroes/${currentClass}/Attack/attack.gif`;
                break;
            case 'death':
                animationPath = `./assets/characters/heroes/${currentClass}/Death/death.gif`;
                break;
            case 'idle':
                animationPath = `./assets/characters/heroes/${currentClass}/Idle/idle.gif`;
                break;
        }
        
        if (animationPath) {
            heroImg.src = animationPath;
        }
    }
}

function playEnemyAnimation(animationType) {
    const enemyImg = document.querySelector('.enemy img');
    if (enemyImg) {
        const enemyName = enemyData.name.toLowerCase().replace(' ', '');
        let animationPath = '';
        
        switch(animationType) {
            case 'attack':
                animationPath = `./assets/characters/enemies/${enemyName}/Attack/attack.gif`;
                break;
            case 'death':
                animationPath = `./assets/characters/enemies/${enemyName}/Death/death.gif`;
                break;
            case 'idle':
                animationPath = `./assets/characters/enemies/${enemyName}/Idle/idle.gif`;
                break;
        }
        
        if (animationPath) {
            enemyImg.src = animationPath;
        }
    }
}

function playAttackAnimation() {
    playHeroAnimation('attack');
    setTimeout(() => {
        playHeroAnimation('idle');
    }, 7000);
}

function playDeathAnimation() {
    playHeroAnimation('death');
    setTimeout(() => {
        playHeroAnimation('idle');
    }, 7000);
}

function playEnemyAttackAnimation() {
    playEnemyAnimation('attack');
    setTimeout(() => {
        playEnemyAnimation('idle');
    }, 7000);
}

function addGold(amount) {
    playerData.gold += amount;
    updatePlayerInfo();
    updatePlayerExperience();
    updateShopButtons();
    savePlayerData();
}

function loadPlayerData() {
    try {
        const savedData = localStorage.getItem('playerData');
        if (savedData) {
            const loadedData = JSON.parse(savedData);
            playerData = {
                name: loadedData.name || '',
                class: loadedData.class || 'Necromancer',
                level: loadedData.level || 1,
                gold: loadedData.gold || 0,
                maxHealth: loadedData.maxHealth || 100,
                currentHealth: loadedData.currentHealth || 100,
                experience: loadedData.experience || 0,
                maxExperience: loadedData.maxExperience || 100
            };
        } else {
            playerData = {
                name: '',
                class: 'Necromancer',
                level: 1,
                gold: 0,
                maxHealth: 100,
                currentHealth: 100,
                experience: 0,
                maxExperience: 100
            };
        }
        updatePlayerInfo();
        updatePlayerHealth();
        updatePlayerExperience();
    } catch (error) {
        console.error('Error loading player data:', error);
        playerData = {
            name: '',
            class: 'Necromancer',
            level: 1,
            gold: 0,
            maxHealth: 100,
            currentHealth: 100,
            experience: 0,
            maxExperience: 100
        };
        updatePlayerInfo();
        updatePlayerHealth();
        updatePlayerExperience();
    }
}

function updateOldQuests() {
    const quests = loadQuestsFromStorage();
    let updated = false;
    
    quests.forEach(quest => {
        if (quest.hasPlayerDamaged === undefined) {
            quest.hasPlayerDamaged = false;
            updated = true;
        }
        if (quest.hasDamaged === undefined) {
            quest.hasDamaged = false;
            updated = true;
        }
        if (quest.hasGivenExp === undefined) {
            quest.hasGivenExp = false;
            updated = true;
        }
        if (quest.hasGivenGold === undefined) {
            quest.hasGivenGold = false;
            updated = true;
        }
    });
    
    if (updated) {
        saveQuestsToStorage(quests);
    }
}

function savePlayerData() {
    try {
        localStorage.setItem('playerData', JSON.stringify(playerData));
    } catch (error) {
        console.error('Error saving player data:', error);
        showNotification('An error occurred while saving player data.', 'insufficient-funds');
    }
}

function loadEnemyData() {
    try {
        const savedData = localStorage.getItem('enemyData');
        if (savedData) {
            enemyData = JSON.parse(savedData);
        } else {
            const firstEnemy = enemyProgression[0];
            enemyData.name = firstEnemy.name;
            enemyData.maxHealth = firstEnemy.health;
            enemyData.currentHealth = firstEnemy.health;
            enemyData.currentEnemyIndex = 0;
        }
        updateEnemyHealth();
        updateEnemyImage();
        updateEnemyName();
    } catch (error) {
        console.error('Error loading enemy data:', error);
        const firstEnemy = enemyProgression[0];
        enemyData.name = firstEnemy.name;
        enemyData.maxHealth = firstEnemy.health;
        enemyData.currentHealth = firstEnemy.health;
        enemyData.currentEnemyIndex = 0;
        updateEnemyHealth();
        updateEnemyImage();
        updateEnemyName();
    }
}

function saveEnemyData() {
    try {
        localStorage.setItem('enemyData', JSON.stringify(enemyData));
    } catch (error) {
        console.error('Error saving enemy data:', error);
        showNotification('An error occurred while saving enemy data.', 'insufficient-funds');
    }
}

function filterAndSortQuests() {
    const statusFilter = document.querySelector('#status-filter').value;
    const sortBy = document.querySelector('#sort-by').value;
    
    const quests = loadQuestsFromStorage();
    let filteredQuests = quests;
    
    if (statusFilter !== 'all') {
        filteredQuests = quests.filter(quest => {
            if (statusFilter === 'active') {
                return !quest.status || quest.status === 'active';
            } else {
                return quest.status === statusFilter;
            }
        });
    }
    
    if (sortBy !== 'none') {
        filteredQuests.sort((a, b) => {
            switch(sortBy) {
                case 'priority':
                    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'time':
                    const timeA = calculateTimeRemaining(a.timeLimit);
                    const timeB = calculateTimeRemaining(b.timeLimit);
                    if (timeA === '' && timeB === '') return 0;
                    if (timeA === '') return 1;
                    if (timeB === '') return -1;
                    return timeA.localeCompare(timeB);
                case 'reward':
                    return b.reward - a.reward;
                default:
                    return 0;
            }
        });
    }
    
    displayQuests(filteredQuests);
}

function displayQuests(quests) {
    const questList = document.querySelector('.quests');
    const addQuestCard = document.querySelector('.add-quest-card');
    
    questList.innerHTML = '';
    
    if (quests.length === 0) {
        const emptyQuests = document.querySelector('.empty-quests');
        if (emptyQuests) {
            emptyQuests.style.display = 'flex';
        }
    } else {
        const emptyQuests = document.querySelector('.empty-quests');
        if (emptyQuests) {
            emptyQuests.style.display = 'none';
        }
        
        quests.forEach(quest => {
            const questItem = document.createElement('div');
            questItem.classList.add('quest-item');
            questItem.dataset.questId = quest.id;
            
            const timeRemaining = calculateTimeRemaining(quest.timeLimit);
            const isExpired = timeRemaining === '';
            
            let statusClass = '';
            if (quest.status === 'completed') {
                statusClass = 'completed';
            } else if (quest.status === 'failed' || isExpired) {
                statusClass = 'failed';
            }
            
            questItem.className = `quest-item ${statusClass}`;
            
            questItem.innerHTML = `
                <button class="settings-quest-btn" onclick="editQuest(${quest.id})">
                    <img src="./assets/icons/settings.png" alt="settings">
                </button>
                <button class="delete-quest-btn" onclick="deleteQuest(${quest.id})">
                    <img src="./assets/icons/close.png" alt="delete">
                </button>
                <h3>${quest.title}</h3>
                <p>${quest.description}</p>
                <div class="quest-details">
                <span class="priority ${quest.priority}">${quest.priority.toUpperCase()}</span>
                <div class="reward">
                    <img src="./assets/icons/coin.svg" alt="gold" />
                    <span>${quest.reward}</span>
                </div>
                <div class="time-limit">
                    <img src="./assets/icons/clock.png" alt="clock">
                    <span>${timeRemaining || 'Time expired!'}</span>
                </div>
                </div>
                <div class="quest-actions">
                    <button class="complete-btn" onclick="markQuestAsCompleted(${quest.id})">
                        Complete
                    </button>
                    <button class="fail-btn" onclick="markQuestAsFailed(${quest.id})">
                        Fail
                    </button>
                </div>
            `;
            
            questItem.addEventListener('click', (e) => {
                if (!e.target.closest('.settings-quest-btn') && !e.target.closest('.delete-quest-btn') && 
                    !e.target.closest('.complete-btn') && !e.target.closest('.fail-btn')) {
                    showQuestDetail(quest.id);
                }
            });
            
            questList.appendChild(questItem);
        });
    }
    
    const existingAddQuestCard = document.querySelector('.add-quest-card');
    if (!existingAddQuestCard) {
        const addQuestCard = document.createElement('div');
        addQuestCard.classList.add('quest-item', 'add-quest-card');
        addQuestCard.innerHTML = `
            <div class="add-quest-content">
                <img src="./assets/quill.gif" alt="add-quest">
                <h3>Add Quest</h3>
            </div>
        `;
        
        addQuestCard.addEventListener('click', () => {
            isEditMode = false;
            currentEditQuestId = null;
            questForm.reset();
            document.querySelector('#quest-modal h2').textContent = 'Add Quest';
            document.querySelector('#quest-modal .confirm-btn').textContent = 'Add Quest';
            modal.showModal();
        });
        
        questList.appendChild(addQuestCard);
    } else {
        questList.appendChild(existingAddQuestCard);
    }
}

function markQuestAsCompleted(questId) {
    try {
        const quests = loadQuestsFromStorage();
        const quest = quests.find(q => q.id === questId);
        
        if (quest) {
            if (quest.status === 'completed') {
                quest.status = 'active';
                saveQuestsToStorage(quests);
                updateQuestCard(questId, quest);
                showNotification('Quest reactivated!', 'purchase-notification');
            } else {
                quest.status = 'completed';
                saveQuestsToStorage(quests);
                
                if (!quest.hasGivenGold) {
                    addGold(quest.reward);
                    quest.hasGivenGold = true;
                    saveQuestsToStorage(quests);
                }
                
                if (!quest.hasGivenExp) {
                    const expReward = calculateReward(quest.priority, quest.timeLimit) / 10;
                    addExperience(expReward);
                    quest.hasGivenExp = true;
                    saveQuestsToStorage(quests);
                }
                
                if (quest.hasGivenDamage === undefined) {
                    quest.hasGivenDamage = false;
                }
                if (!quest.hasGivenDamage) {
                    const damage = calculateDamage(quest.priority);
                    damageEnemy(damage);
                    quest.hasGivenDamage = true;
                    saveQuestsToStorage(quests);
                    
                    playAttackAnimation();
                    showNotification(`Quest completed! +${quest.reward} gold! Enemy damaged!`, 'purchase-notification');
                } else {
                    showNotification(`Quest completed! +${quest.reward} gold!`, 'purchase-notification');
                }
                
                updateQuestCard(questId, quest);
            }
        }
    } catch (error) {
        console.error('Error completing quest:', error);
        showNotification('An error occurred while completing the quest.', 'insufficient-funds');
    }
}

function markQuestAsFailed(questId) {
    try {
        const quests = loadQuestsFromStorage();
        const quest = quests.find(q => q.id === questId);
        
        if (quest) {
            if (quest.status === 'failed') {
                quest.status = 'active';
                saveQuestsToStorage(quests);
                updateQuestCard(questId, quest);
                showNotification('Quest reactivated!', 'purchase-notification');
            } else {
                quest.status = 'failed';
                saveQuestsToStorage(quests);
                
                if (quest.hasPlayerDamaged === undefined) {
                    quest.hasPlayerDamaged = false;
                }
                if (!quest.hasPlayerDamaged) {
                    const damage = calculatePlayerDamage(quest.priority);
                    damagePlayer(damage);
                    quest.hasPlayerDamaged = true;
                    saveQuestsToStorage(quests);
                    
                    playEnemyAttackAnimation();
                    showNotification('Quest failed! You took damage!', 'insufficient-funds');
                } else {
                    showNotification('Quest failed!', 'insufficient-funds');
                }
                
                updateQuestCard(questId, quest);
            }
        }
    } catch (error) {
        console.error('Error failing quest:', error);
        showNotification('An error occurred while failing the quest.', 'insufficient-funds');
    }
}

function updateQuestCard(questId, quest) {
    const questElement = document.querySelector(`[data-quest-id="${questId}"]`);
    if (questElement) {
        const timeRemaining = calculateTimeRemaining(quest.timeLimit);
        const isExpired = timeRemaining === '';
        
        let statusClass = '';
        if (quest.status === 'completed') {
            statusClass = 'completed';
        } else if (quest.status === 'failed' || isExpired) {
            statusClass = 'failed';
        }
        
        questElement.className = `quest-item ${statusClass}`;
        
        const completeBtnText = quest.status === 'completed' ? 'Reactivate' : 'Complete';
        const failBtnText = quest.status === 'failed' ? 'Reactivate' : 'Fail';
        
        questElement.innerHTML = `
            <button class="settings-quest-btn" onclick="editQuest(${quest.id})">
                <img src="./assets/icons/settings.png" alt="settings">
            </button>
            <button class="delete-quest-btn" onclick="deleteQuest(${quest.id})">
                <img src="./assets/icons/close.png" alt="delete">
            </button>
            <h3>${quest.title}</h3>
            <p>${quest.description}</p>
            <div class="quest-details">
            <span class="priority ${quest.priority}">${quest.priority.toUpperCase()}</span>
            <div class="reward">
                <img src="./assets/icons/coin.svg" alt="gold" />
                <span>${quest.reward}</span>
            </div>
            <div class="time-limit">
                <img src="./assets/icons/clock.png" alt="clock">
                <span>${timeRemaining || 'Time expired!'}</span>
            </div>
            </div>
            <div class="quest-actions">
                <button class="complete-btn" onclick="markQuestAsCompleted(${quest.id})">
                    ${completeBtnText}
                </button>
                <button class="fail-btn" onclick="markQuestAsFailed(${quest.id})">
                    ${failBtnText}
                </button>
            </div>
        `;
        
        questElement.addEventListener('click', (e) => {
            if (!e.target.closest('.settings-quest-btn') && !e.target.closest('.delete-quest-btn') && 
                !e.target.closest('.complete-btn') && !e.target.closest('.fail-btn')) {
                showQuestDetail(quest.id);
            }
        });
    }
}

function calculateReward(priority, timeLimit) {
    const now = new Date();
    const limit = new Date(timeLimit);
    const diff = limit - now;
    
    if (diff <= 0) {
        return 0;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const totalMinutes = hours * 60 + minutes;
    
    let baseReward = 0;
    
    switch(priority) {
        case 'high':
            baseReward = 100;
            break;
        case 'medium':
            baseReward = 50;
            break;
        case 'low':
            baseReward = 25;
            break;
        default:
            baseReward = 50;
    }
    
    let timeMultiplier = 1.0;
    
    if (totalMinutes <= 30) {
        timeMultiplier = 0.3;
    } else if (totalMinutes <= 60) {
        timeMultiplier = 0.5;
    } else if (totalMinutes <= 120) {
        timeMultiplier = 1.0;
    } else if (totalMinutes <= 240) {
        timeMultiplier = 1.5;
    } else if (totalMinutes <= 480) {
        timeMultiplier = 2.0;
    } else if (totalMinutes <= 720) {
        timeMultiplier = 2.5;
    } else {
        timeMultiplier = 3.0;
    }
    
    const finalReward = Math.round(baseReward * timeMultiplier);
    
    return finalReward;
}

function calculateTimeRemaining(timeLimit) {
    const now = new Date();
    const limit = new Date(timeLimit);
    const diff = limit - now;
    
    if (diff <= 0) {
        return '';
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

function updateTimeRemaining() {
    const quests = loadQuestsFromStorage();
    let hasChanges = false;
    
    quests.forEach(quest => {
        const timeRemaining = calculateTimeRemaining(quest.timeLimit);
        
        if (timeRemaining === '' && quest.status !== 'failed' && quest.status !== 'completed') {
            quest.status = 'failed';
            if (!quest.hasPlayerDamaged) {
                const damage = calculatePlayerDamage(quest.priority);
                damagePlayer(damage);
                quest.hasPlayerDamaged = true;
            }
            hasChanges = true;
        }
    });
    
    if (hasChanges) {
        saveQuestsToStorage(quests);
        filterAndSortQuests();
        savePlayerData();
    }
    
    const questItems = document.querySelectorAll('.quest-item:not(.add-quest-card)');
    questItems.forEach(item => {
        const timeLimitElement = item.querySelector('.time-limit span');
        if (timeLimitElement) {
            const questId = parseInt(item.dataset.questId);
            const quest = quests.find(q => q.id === questId);
            
            if (quest) {
                const timeRemaining = calculateTimeRemaining(quest.timeLimit);
                timeLimitElement.textContent = timeRemaining;
            }
        }
    });
}

function updateEnemyImage() {
    const enemyImg = document.querySelector('.enemy img');
    if (enemyImg) {
        const enemyName = enemyData.name.toLowerCase().replace(' ', '');
        enemyImg.src = `./assets/characters/enemies/${enemyName}/Idle/idle.gif`;
    }
}

function updateEnemyName() {
    const enemyNameElement = document.querySelector('#enemy-name');
    if (enemyNameElement) {
        enemyNameElement.textContent = enemyData.name;
    }
}

let isSoundMuted = false;
let backgroundMusic;

function initBackgroundMusic() {
    backgroundMusic = new Audio('./assets/theme.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
}

function toggleSound() {
    const soundBtn = document.querySelector('.sound-btn');
    
    if (isSoundMuted) {
        isSoundMuted = false;
        backgroundMusic.play();
        soundBtn.textContent = '🔊';
        soundBtn.classList.remove('muted');
        showNotification('Sound enabled!', 'purchase-notification');
    } else {
        isSoundMuted = true;
        backgroundMusic.pause();
        soundBtn.textContent = '🔇';
        soundBtn.classList.add('muted');
        showNotification('Sound disabled!', 'purchase-notification');
    }
}

function startBackgroundMusic() {
    if (!isSoundMuted && backgroundMusic) {
        backgroundMusic.play().catch(e => {
            console.log('Audio autoplay blocked by browser');
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadPlayerData();
    loadEnemyData();
    updateOldQuests();
    
    const quests = loadQuestsFromStorage();
    
    if (quests.length > 0) {
        const emptyQuests = document.querySelector('.empty-quests');
        if (emptyQuests) {
            emptyQuests.style.display = 'none';
        }
        
        quests.forEach(quest => {
            const questItem = document.createElement('div');
            questItem.classList.add('quest-item');
            questItem.dataset.questId = quest.id;
            
            const timeRemaining = calculateTimeRemaining(quest.timeLimit);
            const isExpired = timeRemaining === '';
            
            let statusClass = '';
            if (quest.status === 'completed') {
                statusClass = 'completed';
            } else if (quest.status === 'failed' || isExpired) {
                statusClass = 'failed';
            }
            
            questItem.className = `quest-item ${statusClass}`;
            
            questItem.innerHTML = `
                <button class="settings-quest-btn" onclick="editQuest(${quest.id})">
                    <img src="./assets/icons/settings.png" alt="settings">
                </button>
                <button class="delete-quest-btn" onclick="deleteQuest(${quest.id})">
                    <img src="./assets/icons/close.png" alt="delete">
                </button>
                <h3>${quest.title}</h3>
                <p>${quest.description}</p>
                <div class="quest-details">
                <span class="priority ${quest.priority}">${quest.priority.toUpperCase()}</span>
                <div class="reward">
                    <img src="./assets/icons/coin.svg" alt="gold" />
                    <span>${quest.reward}</span>
                </div>
                <div class="time-limit">
                    <img src="./assets/icons/clock.png" alt="clock">
                    <span>${timeRemaining || 'Time expired!'}</span>
                </div>
                </div>
                <div class="quest-actions">
                    <button class="complete-btn" onclick="markQuestAsCompleted(${quest.id})">
                        Complete
                    </button>
                    <button class="fail-btn" onclick="markQuestAsFailed(${quest.id})">
                        Fail
                    </button>
                </div>
            `;
            
            questItem.addEventListener('click', (e) => {
                if (!e.target.closest('.settings-quest-btn') && !e.target.closest('.delete-quest-btn') && 
                    !e.target.closest('.complete-btn') && !e.target.closest('.fail-btn')) {
                    showQuestDetail(quest.id);
                }
            });
            
            questList.appendChild(questItem);
        });
        
        const addQuestCard = document.createElement('div');
        addQuestCard.classList.add('quest-item', 'add-quest-card');
        addQuestCard.innerHTML = `
            <div class="add-quest-content">
                <img src="./assets/quill.gif" alt="add-quest">
                <h3>Add Quest</h3>
            </div>
        `;
        
        addQuestCard.addEventListener('click', () => {
            isEditMode = false;
            currentEditQuestId = null;
            questForm.reset();
            document.querySelector('#quest-modal h2').textContent = 'Add Quest';
            document.querySelector('#quest-modal .confirm-btn').textContent = 'Add Quest';
            modal.showModal();
        });
        
        questList.appendChild(addQuestCard);
        
        updateTimeRemaining();
    }
    
    setInterval(updateTimeRemaining, 10000);
    
    questForm.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    document.querySelector('.delete-modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    document.querySelector('.detail-modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    document.querySelector('#status-filter').addEventListener('change', filterAndSortQuests);
    document.querySelector('#sort-by').addEventListener('change', filterAndSortQuests);
    
    filterAndSortQuests();
});

addQuestBtn.addEventListener('click', () => {
    isEditMode = false;
    currentEditQuestId = null;
    questForm.reset();
    document.querySelector('#quest-modal h2').textContent = 'Add Quest';
    document.querySelector('#quest-modal .confirm-btn').textContent = 'Add Quest';
    modal.showModal();
});

modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.closest('#quest-modal')) {
            modal.close();
            questForm.reset();
            isEditMode = false;
            currentEditQuestId = null;
            document.querySelector('#quest-modal h2').textContent = 'Add Quest';
            document.querySelector('#quest-modal .confirm-btn').textContent = 'Add Quest';
        } else if (btn.closest('#delete-modal')) {
            deleteModal.close();
        } else if (btn.closest('#detail-modal')) {
            detailModal.close();
            currentDetailQuestId = null;
        }
    });
});


cancelDeleteBtn.addEventListener('click', () => {
    deleteModal.close();
});

confirmDeleteBtn.addEventListener('click', () => {
    try {
        const questId = parseInt(deleteModal.dataset.questId);
        
        if (questId) {
            deleteQuestFromStorage(questId);
            
            const questElements = document.querySelectorAll('.quest-item');
            questElements.forEach(element => {
                if (parseInt(element.dataset.questId) === questId) {
                    element.remove();
                }
            });
            
            const remainingQuests = document.querySelectorAll('.quest-item:not(.add-quest-card)');
            if (remainingQuests.length === 0) {
                const addQuestCard = document.querySelector('.add-quest-card');
                if (addQuestCard) {
                    addQuestCard.remove();
                }
                
                const emptyQuests = document.querySelector('.empty-quests');
                if (emptyQuests) {
                    emptyQuests.style.display = 'flex';
                }
            }
            
            deleteModal.close();
            filterAndSortQuests();
            showNotification('Quest deleted successfully!', 'purchase-notification');
        }
    } catch (error) {
        console.error('Error deleting quest:', error);
        showNotification('An error occurred while deleting the quest.', 'insufficient-funds');
    }
});

editQuestBtn.addEventListener('click', () => {
    if (currentDetailQuestId) {
        detailModal.close();
        editQuest(currentDetailQuestId);
    }
});

deleteQuestBtn.addEventListener('click', () => {
    if (currentDetailQuestId) {
        detailModal.close();
        deleteQuest(currentDetailQuestId);
    }
});

questForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    try {
        const title = document.querySelector('#quest-title').value.trim();
        const description = document.querySelector('#quest-description').value.trim();
        const rewardInput = document.querySelector('#quest-reward').value.trim();
        const timeLimit = document.querySelector('#quest-time-limit').value;
        const priorityElement = document.querySelector('input[name="quest-priority"]:checked');
        
        if (!title) {
            showNotification('Quest title is required!', 'insufficient-funds');
            return;
        }
        
        if (!priorityElement) {
            showNotification('Please select a priority level!', 'insufficient-funds');
            return;
        }
        
        const priority = priorityElement.value;
        const calculatedReward = calculateReward(priority, timeLimit);
        const finalReward = rewardInput ? parseInt(rewardInput) : calculatedReward;

        if (isEditMode && currentEditQuestId) {
            const updatedQuest = {
                title: title,
                description: description,
                reward: finalReward,
                timeLimit: timeLimit,
                priority: priority
            };
            
            updateQuestInStorage(currentEditQuestId, updatedQuest);
            
            const questElement = document.querySelector(`[data-quest-id="${currentEditQuestId}"]`);
            if (questElement) {
                const timeRemaining = calculateTimeRemaining(timeLimit);
                const isExpired = timeRemaining === '';
                
                let statusClass = '';
                if (updatedQuest.status === 'completed') {
                    statusClass = 'completed';
                } else if (updatedQuest.status === 'failed' || isExpired) {
                    statusClass = 'failed';
                }
                
                questElement.className = `quest-item ${statusClass}`;
                
                questElement.innerHTML = `
                    <button class="settings-quest-btn" onclick="editQuest(${currentEditQuestId})">
                        <img src="./assets/icons/settings.png" alt="settings">
                    </button>
                    <button class="delete-quest-btn" onclick="deleteQuest(${currentEditQuestId})">
                        <img src="./assets/icons/close.png" alt="delete">
                    </button>
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <div class="quest-details">
                    <span class="priority ${priority}">${priority.toUpperCase()}</span>
                    <div class="reward">
                        <img src="./assets/icons/coin.svg" alt="gold" />
                        <span>${finalReward}</span>
                    </div>
                    <div class="time-limit">
                        <img src="./assets/icons/clock.png" alt="clock">
                        <span>${timeRemaining || 'Time expired!'}</span>
                    </div>
                    </div>
                    <div class="quest-actions">
                        <button class="complete-btn" onclick="markQuestAsCompleted(${currentEditQuestId})">
                            Complete
                        </button>
                        <button class="fail-btn" onclick="markQuestAsFailed(${currentEditQuestId})">
                            Fail
                        </button>
                    </div>
                `;
                
                questElement.addEventListener('click', (e) => {
                    if (!e.target.closest('.settings-quest-btn') && !e.target.closest('.delete-quest-btn') && 
                        !e.target.closest('.complete-btn') && !e.target.closest('.fail-btn')) {
                        showQuestDetail(currentEditQuestId);
                    }
                });
            }
            
            isEditMode = false;
            currentEditQuestId = null;
            document.querySelector('#quest-modal h2').textContent = 'Add Quest';
            document.querySelector('#quest-modal .confirm-btn').textContent = 'Add Quest';
            
            showNotification('Quest updated successfully!', 'purchase-notification');
        } else {
            const quest = {
                id: Date.now(),
                title: title,
                description: description,
                reward: finalReward,
                timeLimit: timeLimit,
                priority: priority,
                hasDamaged: false,
                hasPlayerDamaged: false,
                hasGivenExp: false,
                hasGivenDamage: false,
                hasGivenGold: false
            };

            const questItem = document.createElement('div');
            questItem.classList.add('quest-item');
            questItem.dataset.questId = quest.id;
            questItem.innerHTML = `
                <button class="settings-quest-btn" onclick="editQuest(${quest.id})">
                    <img src="./assets/icons/settings.png" alt="settings">
                </button>
                <button class="delete-quest-btn" onclick="deleteQuest(${quest.id})">
                    <img src="./assets/icons/close.png" alt="delete">
                </button>
                <h3>${title}</h3>
                <p>${description}</p>
                <div class="quest-details">
                <span class="priority ${priority}">${priority.toUpperCase()}</span>
                <div class="reward">
                    <img src="./assets/icons/coin.svg" alt="gold" />
                    <span>${finalReward}</span>
                </div>
                <div class="time-limit">
                    <img src="./assets/icons/clock.png" alt="clock">
                    <span>${calculateTimeRemaining(timeLimit)}</span>
                </div>
                </div>
                <div class="quest-actions">
                    <button class="complete-btn" onclick="markQuestAsCompleted(${quest.id})">
                        Complete
                    </button>
                    <button class="fail-btn" onclick="markQuestAsFailed(${quest.id})">
                        Fail
                    </button>
                </div>
            `;

            questItem.addEventListener('click', (e) => {
                if (!e.target.closest('.settings-quest-btn') && !e.target.closest('.delete-quest-btn') && 
                    !e.target.closest('.complete-btn') && !e.target.closest('.fail-btn')) {
                    showQuestDetail(quest.id);
                }
            });

            questList.appendChild(questItem);
            addQuestToStorage(quest);
            
            const emptyQuests = document.querySelector('.empty-quests');
            if (emptyQuests) {
                emptyQuests.style.display = 'none';
            }
            
            const existingAddQuestCard = document.querySelector('.add-quest-card');
            if (!existingAddQuestCard) {
                const addQuestCard = document.createElement('div');
                addQuestCard.classList.add('quest-item', 'add-quest-card');
                addQuestCard.innerHTML = `
                    <div class="add-quest-content">
                        <img src="./assets/quill.gif" alt="add-quest">
                        <h3>Add Quest</h3>
                    </div>
                `;
                
                addQuestCard.addEventListener('click', () => {
                    isEditMode = false;
                    currentEditQuestId = null;
                    questForm.reset();
                    document.querySelector('#quest-modal h2').textContent = 'Add Quest';
                    document.querySelector('#quest-modal .confirm-btn').textContent = 'Add Quest';
                    modal.showModal();
                });
                
                questList.appendChild(addQuestCard);
            } else {
                questList.appendChild(existingAddQuestCard);
            }
            
            filterAndSortQuests();
            showNotification('Quest added successfully!', 'purchase-notification');
        }
        
        questForm.reset();
        modal.close();
        
    } catch (error) {
        console.error('Error processing quest form:', error);
        showNotification('An error occurred while processing the quest. Please try again.', 'insufficient-funds');
    }
});

function deleteQuest(questId) {
    try {
        deleteModal.dataset.questId = questId;
        deleteModal.showModal();
    } catch (error) {
        console.error('Error opening delete modal:', error);
        showNotification('An error occurred while opening delete modal.', 'insufficient-funds');
    }
}

function editQuest(questId) {
    try {
        const quests = loadQuestsFromStorage();
        const quest = quests.find(q => q.id === questId);
        
        if (quest) {
            isEditMode = true;
            currentEditQuestId = questId;
            
            document.querySelector('#quest-modal h2').textContent = 'Edit Quest';
            document.querySelector('#quest-modal .confirm-btn').textContent = 'Update Quest';
            
            document.querySelector('#quest-title').value = quest.title;
            document.querySelector('#quest-description').value = quest.description || '';
            document.querySelector('#quest-reward').value = quest.reward || '';
            document.querySelector('#quest-time-limit').value = quest.timeLimit;
            
            const priorityRadio = document.querySelector(`input[name="quest-priority"][value="${quest.priority}"]`);
            if (priorityRadio) {
                priorityRadio.checked = true;
            }
            
            modal.showModal();
        }
    } catch (error) {
        console.error('Error editing quest:', error);
        showNotification('An error occurred while editing the quest.', 'insufficient-funds');
    }
}

function showQuestDetail(questId) {
    const quests = loadQuestsFromStorage();
    const quest = quests.find(q => q.id === questId);
    
    if (quest) {
        currentDetailQuestId = questId;
        
        document.querySelector('#detail-title').textContent = quest.title;
        document.querySelector('#detail-description').textContent = quest.description || 'No description provided';
        document.querySelector('#detail-reward').textContent = quest.reward;
        
        const timeLimitText = `${quest.timeLimit} (${calculateTimeRemaining(quest.timeLimit)})`;
        document.querySelector('#detail-time-limit').textContent = timeLimitText;
        
        const prioritySpan = document.querySelector('#detail-priority');
        prioritySpan.textContent = quest.priority.toUpperCase();
        prioritySpan.className = `priority ${quest.priority}`;
        
        detailModal.showModal();
    }
}

function resetAllData() {
    if (confirm('Are you sure you want to reset all data? This will delete all your progress, quests, and character information.')) {
        localStorage.clear();
        alert('All data has been reset! The page will reload...');
        location.reload();
    }
}


function updateShopButtons() {
    const buyBtns = document.querySelectorAll('.buy-btn');
    buyBtns.forEach(btn => {
        const price = parseInt(btn.dataset.price);
        const itemName = btn.dataset.item;
        const itemType = btn.dataset.type;
        
        if (itemType === 'character' && itemName === playerData.class) {
            btn.disabled = true;
            btn.style.opacity = '0.3';
            btn.textContent = 'Owned';
        } else if (playerData.gold < price) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.textContent = 'Buy';
        } else {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.textContent = 'Buy';
        }
    });
    
    const shopItems = document.querySelectorAll('.shop-item');
    shopItems.forEach(item => {
        const itemTitle = item.querySelector('h3');
        if (itemTitle && itemTitle.textContent === playerData.class) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
}

function initializeShop() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const categoryItems = document.querySelectorAll('.category-items');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            
            categoryBtns.forEach(b => b.classList.remove('active'));
            categoryItems.forEach(item => item.classList.remove('active'));
            
            btn.classList.add('active');
            document.querySelector(`.category-items.${category}`).classList.add('active');
        });
    });
    
    const buyBtns = document.querySelectorAll('.buy-btn');
    buyBtns.forEach(btn => {
        btn.addEventListener('click', handlePurchase);
    });
    
    updateShopButtons();
}

function handlePurchase(event) {
    try {
        const button = event.target.closest('.shop-item button');
        if (!button) return;
        
        const itemType = button.dataset.type;
        const itemName = button.dataset.item;
        
        if (itemType === 'character') {
            purchaseCharacter(itemName);
        } else if (itemType === 'potion') {
            const healAmount = button.dataset.heal;
            purchasePotion(healAmount);
        } else if (itemType === 'boost') {
            const xpAmount = button.dataset.xp;
            purchaseBoost(xpAmount);
        }
    } catch (error) {
        console.error('Error processing purchase:', error);
        showNotification('An error occurred while processing the purchase.', 'insufficient-funds');
    }
}

function purchaseCharacter(characterName) {
    try {
        const characterPrices = {
            'Necromancer': 1200,
            'Knight': 1200,
            'Archer': 1200,
            'Paladin': 1200,
            'King': 1200
        };
        
        const price = characterPrices[characterName];
        if (price === undefined) {
            showNotification('Character not found!', 'insufficient-funds');
            return;
        }
        
        if (playerData.gold < price) {
            showNotification('Insufficient gold!', 'insufficient-funds');
            return;
        }
        
        if (playerData.class === characterName) {
            showNotification('You already own this character!', 'insufficient-funds');
            return;
        }
        
        playerData.gold -= price;
        playerData.class = characterName;
        playerData.currentHealth = 100;
        playerData.maxHealth = 100;
        
        const heroImg = document.querySelector('.hero img');
        if (heroImg) {
            heroImg.src = `./assets/characters/heroes/${characterName}/Idle/idle.gif`;
        }
        
        updatePlayerInfo();
        updateShopButtons();
        savePlayerData();
        
        showNotification(`${characterName} purchased!`, 'purchase-notification');
    } catch (error) {
        console.error('Error purchasing character:', error);
        showNotification('An error occurred while purchasing the character.', 'insufficient-funds');
    }
}

function purchasePotion(healAmount) {
    try {
        const healValue = healAmount === 'full' ? 'full' : parseInt(healAmount);
        
        const potionPrices = {
            25: 300,
            50: 500,
            75: 700,
            'full': 1000
        };
        
        const potionPrice = potionPrices[healValue];
        if (potionPrice === undefined) {
            showNotification('Potion not found!', 'insufficient-funds');
            return;
        }
        
        if (playerData.gold < potionPrice) {
            showNotification('Insufficient gold!', 'insufficient-funds');
            return;
        }
        
        playerData.gold -= potionPrice;
        
        if (healValue === 'full') {
            playerData.currentHealth = playerData.maxHealth;
        } else {
            playerData.currentHealth = Math.min(playerData.maxHealth, playerData.currentHealth + healValue);
        }
        
        updatePlayerInfo();
        updatePlayerHealth();
        updateShopButtons();
        savePlayerData();
        
        showNotification(`Health potion used! +${healValue === 'full' ? 'Full Health' : healValue} HP`, 'purchase-notification');
    } catch (error) {
        console.error('Error purchasing potion:', error);
        showNotification('An error occurred while purchasing the potion.', 'insufficient-funds');
    }
}

function purchaseBoost(xpAmount) {
    try {
        const xpValue = xpAmount === 'level' ? 'level' : parseInt(xpAmount);
        
        const boostPrices = {
            25: 200,
            50: 350,
            75: 450,
            'level': 800
        };
        
        const boostPrice = boostPrices[xpValue];
        if (boostPrice === undefined) {
            showNotification('Boost not found!', 'insufficient-funds');
            return;
        }
        
        if (playerData.gold < boostPrice) {
            showNotification('Insufficient gold!', 'insufficient-funds');
            return;
        }
        
        playerData.gold -= boostPrice;
        
        if (xpValue === 'level') {
            const remainingExp = playerData.maxExperience - playerData.experience;
            addExperience(remainingExp);
            showNotification('Level up boost used!', 'purchase-notification');
        } else {
            addExperience(xpValue);
            showNotification(`XP boost used! +${xpValue} XP`, 'purchase-notification');
        }
        
        updatePlayerInfo();
        updateShopButtons();
        savePlayerData();
    } catch (error) {
        console.error('Error purchasing boost:', error);
        showNotification('An error occurred while purchasing the boost.', 'insufficient-funds');
    }
}

function showNotification(message, className) {
    const existingNotifications = document.querySelectorAll('.purchase-notification, .insufficient-funds');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = className;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

function checkFirstTimeSetup() {
    const savedData = localStorage.getItem('playerData');
    if (!savedData || !JSON.parse(savedData).name) {
        setupModal.showModal();
        return true;
    }
    return false;
}

function handleSetupForm(event) {
    try {
        event.preventDefault();
        
        const playerName = document.querySelector('#player-name').value.trim();
        const selectedCharacter = document.querySelector('input[name="character-class"]:checked');
        
        if (!playerName) {
            showNotification('Please enter your name!', 'insufficient-funds');
            return;
        }
        
        if (!selectedCharacter) {
            showNotification('Please select a character!', 'insufficient-funds');
            return;
        }
        
        playerData.name = playerName;
        playerData.class = selectedCharacter.value;
        playerData.currentHealth = 100;
        playerData.maxHealth = 100;
        playerData.level = 1;
        playerData.experience = 0;
        playerData.gold = 0;
        
        savePlayerData();
        updatePlayerInfo();
        updatePlayerHealth();
        
        const setupModal = document.querySelector('#setup-modal');
        if (setupModal) {
            setupModal.close();
        }
        
        const heroImg = document.querySelector('.hero img');
        if (heroImg) {
            heroImg.src = `./assets/characters/heroes/${playerData.class}/Idle/idle.gif`;
        }
        
        updateShopButtons();
        
        const helpModal = document.querySelector('#help-modal');
        if (helpModal) {
            helpModal.style.display = 'flex';
            helpModal.showModal();
        }
        
        window.scrollTo(0, 0);
        
        showNotification('Welcome to the adventure!', 'purchase-notification');
        
    } catch (error) {
        console.error('Error processing setup form:', error);
        showNotification('An error occurred while setting up your character.', 'insufficient-funds');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadPlayerData();
    loadEnemyData();
    updateOldQuests();
    filterAndSortQuests();
    updateTimeRemaining();
    
    initBackgroundMusic();
    
    if (!checkFirstTimeSetup()) {
        const heroImg = document.querySelector('.hero img');
        if (heroImg) {
            heroImg.src = `./assets/characters/heroes/${playerData.class}/Idle/idle.gif`;
        }
    }
    
    initializeShop();
    updateShopButtons();
    
    const shopItems = document.querySelectorAll('.shop-item');
    shopItems.forEach(item => {
        const itemTitle = item.querySelector('h3');
        if (itemTitle && itemTitle.textContent === playerData.class) {
            item.classList.add('selected');
        }
    });
    
    setupForm.addEventListener('submit', handleSetupForm);
    
    startBackgroundMusic();
});

function showHelpModal() {
    const helpModal = document.querySelector('#help-modal');
    if (helpModal) {
        helpModal.style.display = 'flex';
        helpModal.showModal();
    }
}

function closeHelpModal() {
    const helpModal = document.querySelector('#help-modal');
    if (helpModal) {
        helpModal.close();
        helpModal.style.display = 'none';
    }
}

function addQuestToStorage(quest) {
    try {
        const quests = loadQuestsFromStorage();
        quests.push(quest);
        localStorage.setItem('quests', JSON.stringify(quests));
    } catch (error) {
        console.error('Error adding quest to storage:', error);
        showNotification('An error occurred while saving the quest.', 'insufficient-funds');
    }
}

function loadQuestsFromStorage() {
    try {
        const quests = localStorage.getItem('quests');
        return quests ? JSON.parse(quests) : [];
    } catch (error) {
        console.error('Error loading quests from storage:', error);
        return [];
    }
}

function saveQuestsToStorage(quests) {
    try {
        localStorage.setItem('quests', JSON.stringify(quests));
    } catch (error) {
        console.error('Error saving quests to storage:', error);
        showNotification('An error occurred while saving quests.', 'insufficient-funds');
    }
}

function updateQuestInStorage(questId, updatedQuest) {
    try {
        const quests = loadQuestsFromStorage();
        const index = quests.findIndex(q => q.id === questId);
        
        if (index !== -1) {
            quests[index] = { ...quests[index], ...updatedQuest };
            saveQuestsToStorage(quests);
        }
    } catch (error) {
        console.error('Error updating quest in storage:', error);
        showNotification('An error occurred while updating the quest.', 'insufficient-funds');
    }
}

function deleteQuestFromStorage(questId) {
    try {
        const quests = loadQuestsFromStorage();
        const filteredQuests = quests.filter(q => q.id !== questId);
        saveQuestsToStorage(filteredQuests);
    } catch (error) {
        console.error('Error deleting quest from storage:', error);
        showNotification('An error occurred while deleting the quest from storage.', 'insufficient-funds');
    }
}