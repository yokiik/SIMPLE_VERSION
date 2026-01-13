// Простая гостевая книга без базы данных
// Использует localStorage для хранения комментариев

// Ключ для хранения в localStorage
const STORAGE_KEY = 'guestbook_comments';
let captchaResult = 0;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadCaptcha();
    loadComments();
    
    // Обработчик формы
    document.getElementById('commentForm').addEventListener('submit', handleSubmit);
    
    // Обработчик обновления капчи
    document.getElementById('refreshCaptcha').addEventListener('click', loadCaptcha);
});

// Загрузка капчи
function loadCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    if (operation === '+') {
        captchaResult = num1 + num2;
        document.getElementById('captchaQuestion').textContent = `${num1} + ${num2} = ?`;
    } else {
        const maxNum = Math.max(num1, num2);
        const minNum = Math.min(num1, num2);
        captchaResult = maxNum - minNum;
        document.getElementById('captchaQuestion').textContent = `${maxNum} - ${minNum} = ?`;
    }
    
    document.getElementById('captcha').value = '';
}

// Получить все комментарии
function getComments() {
    const comments = localStorage.getItem(STORAGE_KEY);
    return comments ? JSON.parse(comments) : [];
}

// Сохранить комментарии
function saveComments(comments) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}

// Загрузка комментариев
function loadComments() {
    const commentsList = document.getElementById('commentsList');
    const comments = getComments();
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<div class="empty-state">Пока нет комментариев. Будьте первым!</div>';
        return;
    }
    
    // Сортируем по дате (новые сверху)
    comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    commentsList.innerHTML = '';
    
    comments.forEach(comment => {
        commentsList.appendChild(createCommentElement(comment));
    });
}

// Создание элемента комментария
function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    
    const date = new Date(comment.created_at);
    const formattedDate = date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    div.innerHTML = `
        <div class="comment-header">
            <div>
                <span class="comment-author">${escapeHtml(comment.name)}</span>
                <span class="comment-email">(${escapeHtml(comment.email)})</span>
            </div>
            <span class="comment-date">${formattedDate}</span>
        </div>
        <div class="comment-text">${escapeHtml(comment.message)}</div>
    `;
    
    return div;
}

// Обработка отправки формы
function handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const captchaAnswer = parseInt(document.getElementById('captcha').value);
    
    // Валидация
    if (!name || !email || !message) {
        showMessage('Все поля обязательны для заполнения', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Некорректный email адрес', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    // Проверка капчи
    if (captchaAnswer !== captchaResult) {
        showMessage('Неверный ответ на капчу', 'error');
        loadCaptcha();
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    // Сохранение комментария
    const comments = getComments();
    const newComment = {
        id: Date.now(),
        name: name,
        email: email,
        message: message,
        created_at: new Date().toISOString()
    };
    
    comments.push(newComment);
    saveComments(comments);
    
    // Успех
    showMessage('Комментарий успешно добавлен!', 'success');
    form.reset();
    loadCaptcha();
    
    // Перезагружаем комментарии
    setTimeout(() => {
        loadComments();
    }, 500);
    
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
}

// Показать сообщение
function showMessage(message, type) {
    const messageDiv = document.getElementById('formMessage');
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    
    setTimeout(() => {
        messageDiv.className = 'form-message';
        messageDiv.textContent = '';
    }, 5000);
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

