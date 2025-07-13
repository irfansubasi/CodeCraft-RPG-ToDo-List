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
                    <span>${quest.timeLimit}</span>
                </div>
                </div>
            `;
            
            questItem.addEventListener('click', (e) => {
                if (!e.target.closest('.settings-quest-btn') && !e.target.closest('.delete-quest-btn')) {
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
    }
    
    // Modal dışına tıklama event listener'ları
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.close();
            questForm.reset();
            isEditMode = false;
            currentEditQuestId = null;
            document.querySelector('#quest-modal h2').textContent = 'Add Quest';
            document.querySelector('#quest-modal .confirm-btn').textContent = 'Add Quest';
        }
    });
    
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.close();
        }
    });
    
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) {
            detailModal.close();
            currentDetailQuestId = null;
        }
    });
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
        
        const remainingQuests = document.querySelectorAll('.quest-item');
        if (remainingQuests.length === 0) {
            const emptyQuests = document.querySelector('.empty-quests');
            if (emptyQuests) {
                emptyQuests.style.display = 'flex';
            }
        }
        
        deleteModal.close();
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
    const reward = document.querySelector('#quest-reward').value;
    const timeLimit = document.querySelector('#quest-time-limit').value;
    const priority = document.querySelector('input[name="quest-priority"]:checked').value;

    if (isEditMode && currentEditQuestId) {
        const updatedQuest = {
            title: title,
            description: description,
            reward: reward,
            timeLimit: timeLimit,
            priority: priority
        };
        
        updateQuestInStorage(currentEditQuestId, updatedQuest);
        
        const questElement = document.querySelector(`[data-quest-id="${currentEditQuestId}"]`);
        if (questElement) {
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
                    <span>${reward}</span>
                </div>
                <div class="time-limit">
                    <img src="./assets/icons/clock.png" alt="clock">
                    <span>${timeLimit}</span>
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
            reward: reward,
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
            <h3>${title}</h3>
            <p>${description}</p>
            <div class="quest-details">
            <span class="priority ${priority}">${priority.toUpperCase()}</span>
            <div class="reward">
                <img src="./assets/icons/coin.svg" alt="gold" />
                <span>${reward}</span>
            </div>
            <div class="time-limit">
                <img src="./assets/icons/clock.png" alt="clock">
                <span>${timeLimit}</span>
            </div>
            </div>
        `;

        questItem.addEventListener('click', (e) => {
            if (!e.target.closest('.settings-quest-btn') && !e.target.closest('.delete-quest-btn')) {
                showQuestDetail(quest.id);
            }
        });

        questList.appendChild(questItem);
        addQuestToStorage(quest);
        
        const emptyQuests = document.querySelector('.empty-quests');
        if (emptyQuests) {
            emptyQuests.style.display = 'none';
        }
        
        const addQuestCard = document.querySelector('.add-quest-card');
        if (addQuestCard) {
            questList.appendChild(addQuestCard);
        }
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
        document.querySelector('#detail-time-limit').textContent = quest.timeLimit;
        
        const prioritySpan = document.querySelector('#detail-priority');
        prioritySpan.textContent = quest.priority.toUpperCase();
        prioritySpan.className = `priority ${quest.priority}`;
        
        detailModal.showModal();
    }
}