const addQuestBtn = document.querySelector('.add-quest-btn');
const modal = document.querySelector('#quest-modal');
const questForm = document.querySelector('#quest-form');
const questList = document.querySelector('.quests');
const deleteModal = document.querySelector('#delete-modal');
const cancelDeleteBtn = document.querySelector('#cancel-delete');
const confirmDeleteBtn = document.querySelector('#confirm-delete');


document.addEventListener('DOMContentLoaded', () => {
    loadQuestsFromStorage().forEach(quest => {
        const questItem = document.createElement('div');
        questItem.classList.add('quest-item');
        questItem.dataset.questId = quest.id;
        questItem.innerHTML = `
            <button class="settings-quest-btn">
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
        
        questList.appendChild(questItem);
    });
});

addQuestBtn.addEventListener('click', () => {
    modal.showModal();
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
        
        deleteModal.close();
    }
});

questForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.querySelector('#quest-title').value;
    const description = document.querySelector('#quest-description').value;
    const reward = document.querySelector('#quest-reward').value;
    const timeLimit = document.querySelector('#quest-time-limit').value;
    const priority = document.querySelector('input[name="quest-priority"]:checked').value;

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
        <button class="settings-quest-btn">
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

    questList.appendChild(questItem);
    
    addQuestToStorage(quest);
    
    questForm.reset();
    modal.close();
});

function deleteQuest(questId) {
    deleteModal.dataset.questId = questId;
    
    deleteModal.showModal();
}
