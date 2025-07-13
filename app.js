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
let isEditMode = false;
let currentEditQuestId = null;
let currentDetailQuestId = null;

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
                <button class="complete-btn" onclick="markQuestAsCompleted(${quest.id})">
                    Complete
                </button>
                <button class="fail-btn" onclick="markQuestAsFailed(${quest.id})">
                    Fail
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
    const quests = loadQuestsFromStorage();
    const quest = quests.find(q => q.id === questId);
    if (quest) {
        if (quest.status === 'completed') {
            quest.status = 'active';
        } else {
            quest.status = 'completed';
        }
        updateQuestInStorage(questId, quest);
        updateQuestCard(questId, quest);
        filterAndSortQuests();
    }
}

function markQuestAsFailed(questId) {
    const quests = loadQuestsFromStorage();
    const quest = quests.find(q => q.id === questId);
    if (quest) {
        if (quest.status === 'failed') {
            const timeRemaining = calculateTimeRemaining(quest.timeLimit);
            if (timeRemaining !== '') {
                quest.status = 'active';
            }
        } else {
            quest.status = 'failed';
        }
        updateQuestInStorage(questId, quest);
        updateQuestCard(questId, quest);
        filterAndSortQuests();
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
        
        questElement.innerHTML = `
            <button class="settings-quest-btn" onclick="editQuest(${quest.id})">
                <img src="./assets/icons/settings.png" alt="settings">
            </button>
            <button class="delete-quest-btn" onclick="deleteQuest(${quest.id})">
                <img src="./assets/icons/close.png" alt="delete">
            </button>
            <button class="complete-btn" onclick="markQuestAsCompleted(${quest.id})">
                Complete
            </button>
            <button class="fail-btn" onclick="markQuestAsFailed(${quest.id})">
                Fail
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
    const questItems = document.querySelectorAll('.quest-item:not(.add-quest-card)');
    
    questItems.forEach(item => {
        const timeLimitElement = item.querySelector('.time-limit span');
        if (timeLimitElement) {
            const questId = parseInt(item.dataset.questId);
            const quests = loadQuestsFromStorage();
            const quest = quests.find(q => q.id === questId);
            
            if (quest) {
                const timeRemaining = calculateTimeRemaining(quest.timeLimit);
                timeLimitElement.textContent = timeRemaining;
            }
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
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
                <button class="complete-btn" onclick="markQuestAsCompleted(${quest.id})">
                    Complete
                </button>
                <button class="fail-btn" onclick="markQuestAsFailed(${quest.id})">
                    Fail
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
        setInterval(updateTimeRemaining, 60000);
    }
    
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
    
    const title = document.querySelector('#quest-title').value;
    const description = document.querySelector('#quest-description').value;
    const rewardInput = document.querySelector('#quest-reward').value;
    const timeLimit = document.querySelector('#quest-time-limit').value;
    const priority = document.querySelector('input[name="quest-priority"]:checked').value;

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
                <button class="complete-btn" onclick="markQuestAsCompleted(${currentEditQuestId})">
                    Complete
                </button>
                <button class="fail-btn" onclick="markQuestAsFailed(${currentEditQuestId})">
                    Fail
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
            `;
        }
        
        isEditMode = false;
        currentEditQuestId = null;
        document.querySelector('#quest-modal h2').textContent = 'Add Quest';
        document.querySelector('#quest-modal .confirm-btn').textContent = 'Add Quest';
    } else {
        const quest = {
            id: Date.now(),
            title: title,
            description: description,
            reward: finalReward,
            timeLimit: timeLimit,
            priority: priority
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
            <button class="complete-btn" onclick="markQuestAsCompleted(${quest.id})">
                Complete
            </button>
            <button class="fail-btn" onclick="markQuestAsFailed(${quest.id})">
                Fail
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
    }
    
    questForm.reset();
    modal.close();
});

function deleteQuest(questId) {
    deleteModal.dataset.questId = questId;
    
    deleteModal.showModal();
}

function editQuest(questId) {
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