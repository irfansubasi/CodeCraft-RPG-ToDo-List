const STORAGE_KEY = 'rpg-quests';


function loadQuestsFromStorage() {
    const storedQuests = localStorage.getItem(STORAGE_KEY);
    if (storedQuests) {
        return JSON.parse(storedQuests);
    }
    return [];
}


function saveQuestsToStorage(quests) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
}


function addQuestToStorage(quest) {
    const quests = loadQuestsFromStorage();
    quests.push(quest);
    saveQuestsToStorage(quests);
}


function deleteQuestFromStorage(questId) {
    const quests = loadQuestsFromStorage();
    const updatedQuests = quests.filter(quest => Number(quest.id) !== Number(questId));
    saveQuestsToStorage(updatedQuests);
}


function updateQuestInStorage(questId, updatedQuest) {
    const quests = loadQuestsFromStorage();
    const index = quests.findIndex(quest => quest.id === questId);
    if (index !== -1) {
        quests[index] = { ...quests[index], ...updatedQuest };
        saveQuestsToStorage(quests);
    }
} 