// Connect to Socket.IO server
const socket = io();

// DOM Elements
const joinScreen = document.getElementById('join-screen');
const chatScreen = document.getElementById('chat-screen');
const nicknameInput = document.getElementById('nickname-input');
const joinButton = document.getElementById('join-button');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');
const usersList = document.getElementById('users-list');

let nickname = '';

// Join Chat Handler
joinButton.addEventListener('click', () => {
    nickname = nicknameInput.value.trim();
    if (nickname) {
        socket.emit('join', { nickname });
        joinScreen.style.display = 'none';
        chatScreen.style.display = 'block';
        messageInput.focus();
    } else {
        alert('Please enter a nickname');
    }
});

// Send Message Handler
function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('message', { nickname, message });
        messageInput.value = '';
    }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Socket Event Handlers
socket.on('user_joined', (data) => {
    addMessage(`${data.nickname} has joined the chat`, 'system', data.timestamp);
});

socket.on('user_left', (data) => {
    addMessage('A user has left the chat', 'system', data.timestamp);
});

socket.on('new_message', (data) => {
    addMessage(`${data.nickname}: ${data.message}`, 'user', data.timestamp);
});

socket.on('update_users', (data) => {
    updateUsersList(data.users);
});

// Helper Functions
function addMessage(text, type, timestamp) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'timestamp';
    timeSpan.textContent = `[${timestamp}]`;
    
    messageDiv.appendChild(timeSpan);
    messageDiv.appendChild(document.createTextNode(` ${text}`));
    
    chatMessages.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateUsersList(users) {
    usersList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        usersList.appendChild(li);
    });
}

// Enter key handler for join screen
nicknameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinButton.click();
    }
});
