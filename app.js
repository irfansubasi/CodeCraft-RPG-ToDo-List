const addQuestBtn = document.querySelector('.add-quest-btn');
const modal = document.querySelector('#quest-modal');
const questForm = document.querySelector('#quest-form');
const questList = document.querySelector('.quests');

addQuestBtn.addEventListener('click', () => {
    modal.showModal();
});

questForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.querySelector('#quest-title').value;
    const description = document.querySelector('#quest-description').value;
    const reward = document.querySelector('#quest-reward').value;
    const timeLimit = document.querySelector('#quest-time-limit').value;
    const priority = document.querySelector('input[name="quest-priority"]:checked').value;

    const questItem = document.createElement('div');
    questItem.classList.add('quest-item');
    questItem.innerHTML = `
        
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
    questForm.reset();
    modal.close();
});
