// Хранилище записей: массив объектов { date: 'YYYY-MM-DD', text: '...' }
let entries = [];

// Получение сегодняшней даты в формате YYYY-MM-DD
function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Форматирование даты для отображения
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

// Загрузка данных из localStorage
function loadEntries() {
    const stored = localStorage.getItem('dailyEntries');
    if (stored) {
        try {
            entries = JSON.parse(stored);
            // Сортировка по дате (сначала новые)
            entries.sort((a, b) => b.date.localeCompare(a.date));
        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
            entries = [];
        }
    }
}

// Сохранение данных в localStorage
function saveEntries() {
    localStorage.setItem('dailyEntries', JSON.stringify(entries));
}

// Вычисление текущей серии (streak)
function calculateStreak() {
    if (entries.length === 0) return 0;
    
    // Создаем Set дат для быстрого поиска
    const dateSet = new Set(entries.map(entry => entry.date));
    
    let streak = 0;
    const today = new Date();
    
    // Проверяем сегодняшний день, вчерашний и т.д.
    while (true) {
        const dateStr = today.toISOString().split('T')[0];
        if (dateSet.has(dateStr)) {
            streak++;
            // Переходим к предыдущему дню
            today.setDate(today.getDate() - 1);
        } else {
            // Если сегодня нет записи, но вчера есть — серия начинается со вчерашнего дня
            if (streak === 0) {
                today.setDate(today.getDate() - 1);
                const yesterdayStr = today.toISOString().split('T')[0];
                if (dateSet.has(yesterdayStr)) {
                    // Продолжаем проверять, но уже со вчерашнего дня
                    const checkDate = new Date(today);
                    while (dateSet.has(checkDate.toISOString().split('T')[0])) {
                        streak++;
                        checkDate.setDate(checkDate.getDate() - 1);
                    }
                }
            }
            break;
        }
    }
    
    return streak;
}

// Обновление UI
function renderEntries() {
    const entriesList = document.getElementById('entriesList');
    const emptyState = document.getElementById('emptyState');
    const streakCount = document.getElementById('streakCount');
    
    // Обновляем счетчик серии
    streakCount.textContent = calculateStreak();
    
    // Очищаем список
    entriesList.innerHTML = '';
    
    if (entries.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Создаем элементы для каждой записи
    entries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'entry-item';
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'entry-date';
        dateSpan.textContent = formatDate(entry.date);
        
        const textSpan = document.createElement('span');
        textSpan.className = 'entry-text';
        textSpan.textContent = entry.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Удалить запись';
        deleteBtn.addEventListener('click', () => deleteEntry(entry.date));
        
        item.appendChild(dateSpan);
        item.appendChild(textSpan);
        item.appendChild(deleteBtn);
        
        entriesList.appendChild(item);
    });
}

// Добавление новой записи
function addEntry(text) {
    const today = getTodayString();
    
    // Проверяем, есть ли уже запись за сегодня
    const existingIndex = entries.findIndex(entry => entry.date === today);
    
    if (existingIndex !== -1) {
        // Заменяем текст
        entries[existingIndex].text = text;
    } else {
        // Добавляем новую запись
        entries.push({ date: today, text: text });
        // Сортируем по дате (сначала новые)
        entries.sort((a, b) => b.date.localeCompare(a.date));
    }
    
    saveEntries();
    renderEntries();
}

// Удаление записи по дате
function deleteEntry(date) {
    entries = entries.filter(entry => entry.date !== date);
    saveEntries();
    renderEntries();
}

// Обработка отправки формы
document.getElementById('entryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const textInput = document.getElementById('entryText');
    const text = textInput.value.trim();
    
    if (!text) {
        showMessage('Пожалуйста, напишите что-нибудь.');
        return;
    }
    
    addEntry(text);
    textInput.value = '';
    showMessage('Запись сохранена!');
    
    // Скрываем сообщение через 3 секунды
    setTimeout(() => {
        hideMessage();
    }, 3000);
});

// Вспомогательные функции для сообщений
function showMessage(msg) {
    const messageEl = document.getElementById('formMessage');
    messageEl.textContent = msg;
    messageEl.style.display = 'block';
}

function hideMessage() {
    const messageEl = document.getElementById('formMessage');
    messageEl.textContent = '';
    messageEl.style.display = 'none';
}

// Инициализация приложения
function init() {
    loadEntries();
    renderEntries();
    hideMessage();
}

init();
