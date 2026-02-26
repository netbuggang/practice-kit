class ChatApp {
    constructor() {
        this.socket = null;
        this.currentUser = null;
        this.currentRoom = 'general';
        this.users = [];
        this.rooms = [];
        this.isSelectingMention = false;
        this.mentionSearchText = '';
        this.selectedSuggestionIndex = -1;
        
        this.initializeApp();
    }
    
    async initializeApp() {
        // 显示用户选择模态框
        this.showUserSelectModal();
        
        // 初始化事件监听器
        this.initEventListeners();
    }
    
    showUserSelectModal() {
        const modal = document.getElementById('user-select-modal');
        modal.classList.add('show');
        
        // 模拟获取用户列表（实际中从服务器获取）
        const userOptions = [
            { id: '1', name: '张三', avatar: '👨' },
            { id: '2', name: '李四', avatar: '👩' },
            { id: '3', name: '王五', avatar: '👨‍💼' },
            { id: '4', name: '赵六', avatar: '👩‍💼' }
        ];
        
        const userOptionsContainer = document.getElementById('user-options');
        userOptionsContainer.innerHTML = '';
        
        userOptions.forEach(user => {
            const option = document.createElement('div');
            option.className = 'user-option';
            option.innerHTML = `
                <div class="avatar">${user.avatar}</div>
                <div>
                    <div class="user-name">${user.name}</div>
                    <div class="user-id">ID: ${user.id}</div>
                </div>
            `;
            
            option.addEventListener('click', () => {
                this.selectUser(user);
                modal.classList.remove('show');
            });
            
            userOptionsContainer.appendChild(option);
        });
        
        // 关闭模态框
        document.querySelector('.close-modal').addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }
    
    selectUser(user) {
        this.currentUser = user;
        
        // 更新UI
        document.getElementById('current-user-avatar').textContent = user.avatar;
        document.getElementById('current-user-name').textContent = user.name;
        
        // 连接WebSocket服务器
        this.connectToServer();
    }
    
    connectToServer() {
        // 连接到Socket.io服务器
        this.socket = io('http://localhost:3001');
        
        this.socket.on('connect', () => {
            console.log('已连接到服务器');
            this.joinRoom('general');
        });
        
        this.socket.on('users_list', (users) => {
            this.users = users;
            this.renderUsersList();
        });
        
        this.socket.on('rooms_list', (rooms) => {
            this.rooms = rooms;
            this.renderRoomsList();
        });
        
        this.socket.on('room_messages', (messages) => {
            this.renderMessages(messages);
        });
        
        this.socket.on('new_message', (message) => {
            this.addMessage(message);
            
            // 如果消息提到当前用户，高亮显示
            if (message.mentions && message.mentions.includes(this.currentUser.id)) {
                this.showMentionNotification(message);
            }
        });
        
        this.socket.on('user_mentioned', (data) => {
            if (data.userId === this.currentUser.id) {
                this.addNotification({
                    title: '有人@了你',
                    message: `${data.senderName} 在聊天中提到了你`,
                    time: new Date(),
                    type: 'mention'
                });
            }
        });
        
        this.socket.on('search_results', (data) => {
            this.renderUserSuggestions(data.users);
        });
    }
    
    initEventListeners() {
        // 发送按钮
        document.getElementById('send-button').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // 输入框键盘事件
        const messageInput = document.getElementById('message-input');
        messageInput.addEventListener('input', (e) => {
            this.handleInput(e);
        });
        
        messageInput.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        messageInput.addEventListener('keyup', (e) => {
            // 处理@功能
            if (e.key === '@') {
                this.startMentionSelection();
            } else if (this.isSelectingMention) {
                this.updateMentionSearch();
            }
        });
        
        // 按Enter发送消息，Ctrl+Enter换行
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }
    
    handleInput(e) {
        // 更新输入框高度
        const input = e.target;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 200) + 'px';
    }
    
    handleKeyDown(e) {
        const suggestions = document.querySelectorAll('.user-suggestion');
        
        if (!this.isSelectingMention || suggestions.length === 0) return;
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.selectedSuggestionIndex = Math.max(0, this.selectedSuggestionIndex - 1);
                this.highlightSelectedSuggestion();
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                this.selectedSuggestionIndex = Math.min(suggestions.length - 1, this.selectedSuggestionIndex + 1);
                this.highlightSelectedSuggestion();
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.selectedSuggestionIndex >= 0) {
                    this.selectMentionedUser(suggestions[this.selectedSuggestionIndex]);
                }
                break;
                
            case 'Escape':
                this.hideUserSuggestions();
                break;
        }
    }
    
    startMentionSelection() {
        this.isSelectingMention = true;
        this.mentionSearchText = '';
        this.selectedSuggestionIndex = -1;
    }
    
    updateMentionSearch() {
        const input = document.getElementById('message-input');
        const text = input.textContent;
        const cursorPos = this.getCursorPosition(input);
        
        // 查找最近的@符号
        const textBeforeCursor = text.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1) {
            this.mentionSearchText = textBeforeCursor.substring(lastAtIndex + 1, cursorPos);
            
            // 搜索用户
            if (this.mentionSearchText.length > 0) {
                this.socket.emit('search_users', {
                    keyword: this.mentionSearchText,
                    roomId: this.currentRoom
                });
            } else {
                // 显示所有用户
                this.renderUserSuggestions(this.users);
            }
        } else {
            this.hideUserSuggestions();
            this.isSelectingMention = false;
        }
    }
    
    getCursorPosition(element) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            return preCaretRange.toString().length;
        }
        return 0;
    }
    
    renderUserSuggestions(users) {
        const suggestionsContainer = document.getElementById('user-suggestions');
        
        if (users.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        suggestionsContainer.innerHTML = '';
        users.forEach((user, index) => {
            const suggestion = document.createElement('div');
            suggestion.className = 'user-suggestion';
            suggestion.dataset.userId = user.id;
            suggestion.innerHTML = `
                <div class="avatar">${user.avatar}</div>
                <div>
                    <div class="user-name">${user.name}</div>
                    <div class="user-id">ID: ${user.id}</div>
                </div>
            `;
            
            suggestion.addEventListener('click', () => {
                this.selectMentionedUser(suggestion);
            });
            
            suggestionsContainer.appendChild(suggestion);
        });
        
        suggestionsContainer.style.display = 'block';
        this.selectedSuggestionIndex = -1;
    }
    
    highlightSelectedSuggestion() {
        const suggestions = document.querySelectorAll('.user-suggestion');
        suggestions.forEach((suggestion, index) => {
            if (index === this.selectedSuggestionIndex) {
                suggestion.classList.add('selected');
                suggestion.scrollIntoView({ block: 'nearest' });
            } else {
                suggestion.classList.remove('selected');
            }
        });
    }
    
    selectMentionedUser(suggestionElement) {
        const userId = suggestionElement.dataset.userId;
        const userName = suggestionElement.querySelector('.user-name').textContent;
        
        // 插入@提到格式
        const input = document.getElementById('message-input');
        const text = input.textContent;
        const cursorPos = this.getCursorPosition(input);
        
        const textBeforeCursor = text.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1) {
            // 替换@搜索文本为完整的@提到格式
            const newText = text.substring(0, lastAtIndex) + `@[${userName}](${userId}) ` + text.substring(cursorPos);
            input.textContent = newText;
            
            // 移动光标到插入位置之后
            this.setCursorPosition(input, lastAtIndex + `@[${userName}](${userId}) `.length);
        }
        
        this.hideUserSuggestions();
        this.isSelectingMention = false;
        this.mentionSearchText = '';
        
        // 聚焦输入框
        input.focus();
    }
    
    setCursorPosition(element, position) {
        const range = document.createRange();
        const selection = window.getSelection();
        
        // 找到文本节点
        let charIndex = 0;
        let nodeStack = [element];
        let node;
        let foundStart = false;
        let stop = false;
        
        while (!stop && (node = nodeStack.pop())) {
            if (node.nodeType === 3) { // 文本节点
                const nextCharIndex = charIndex + node.length;
                if (!foundStart && position >= charIndex && position <= nextCharIndex) {
                    range.setStart(node, position - charIndex);
                    range.setEnd(node, position - charIndex);
                    foundStart = true;
                }
                charIndex = nextCharIndex;
            } else {
                let i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }
        
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    hideUserSuggestions() {
        document.getElementById('user-suggestions').style.display = 'none';
    }
    
    joinRoom(roomId) {
        if (this.socket) {
            this.currentRoom = roomId;
            this.socket.emit('join_room', roomId);
            
            // 更新UI
            const room = this.rooms.find(r => r.id === roomId);
            if (room) {
                document.getElementById('current-room-name').textContent = room.name;
            }
            
            // 清空消息容器
            document.getElementById('messages-container').innerHTML = '';
            
            // 更新房间选中状态
            document.querySelectorAll('#rooms-list li').forEach(li => {
                li.classList.remove('active');
                if (li.dataset.roomId === roomId) {
                    li.classList.add('active');
                }
            });
        }
    }
    
    sendMessage() {
        const input = document.getElementById('message-input');
        const content = input.textContent.trim();
        
        if (!content || !this.currentUser || !this.socket) return;
        
        this.socket.emit('send_message', {
            roomId: this.currentRoom,
            content: content,
            sender: this.currentUser
        });
        
        // 清空输入框
        input.textContent = '';
        input.style.height = '60px';
        
        // 隐藏用户建议
        this.hideUserSuggestions();
        this.isSelectingMention = false;
    }
    
    renderMessages(messages) {
        const container = document.getElementById('messages-container');
        container.innerHTML = '';
        
        messages.forEach(message => {
            this.addMessage(message);
        });
        
        // 滚动到底部
        container.scrollTop = container.scrollHeight;
    }
    
    addMessage(message) {
        const container = document.getElementById('messages-container');
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender.id === this.currentUser.id ? 'sent' : 'received'}`;
        
        // 格式化时间
        const time = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <div class="sender-avatar">${message.sender.avatar || '👤'}</div>
                    <div class="sender-name">${message.sender.name}</div>
                </div>
                <div class="message-text">${message.content}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        container.appendChild(messageElement);
        
        // 滚动到底部
        container.scrollTop = container.scrollHeight;
    }
    
    renderUsersList() {
        const container = document.getElementById('users-list');
        container.innerHTML = '';
        
        this.users.forEach(user => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="user-avatar">${user.avatar}</div>
                <span>${user.name}</span>
            `;
            container.appendChild(li);
        });
        
        document.getElementById('member-count').textContent = `${this.users.length} 成员`;
    }
    
    renderRoomsList() {
        const container = document.getElementById('rooms-list');
        container.innerHTML = '';
        
        this.rooms.forEach(room => {
            const li = document.createElement('li');
            li.dataset.roomId = room.id;
            li.innerHTML = `
                <i class="fas fa-comment"></i>
                <span>${room.name}</span>
            `;
            
            if (room.id === this.currentRoom) {
                li.classList.add('active');
            }
            
            li.addEventListener('click', () => {
                this.joinRoom(room.id);
            });
            
            container.appendChild(li);
        });
    }
    
    showMentionNotification(message) {
        // 高亮显示被@的消息
        const messages = document.querySelectorAll('.message');
        const lastMessage = messages[messages.length - 1];
        
        if (lastMessage) {
            const mentionElements = lastMessage.querySelectorAll('.mention');
            mentionElements.forEach(mention => {
                if (mention.dataset.userId === this.currentUser.id) {
                    mention.classList.add('highlighted');
                    
                    // 5秒后移除高亮
                    setTimeout(() => {
                        mention.classList.remove('highlighted');
                    }, 5000);
                }
            });
        }
    }
    
    addNotification(notification) {
        const container = document.getElementById('notifications-list');
        const emptyNotification = container.querySelector('.empty');
        
        if (emptyNotification) {
            emptyNotification.remove();
        }
        
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${notification.type}`;
        
        const time = notification.time.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        notificationElement.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-time">${time}</div>
            </div>
            <div class="notification-message">${notification.message}</div>
        `;
        
        container.insertBefore(notificationElement, container.firstChild);
        
        // 限制通知数量
        const notifications = container.querySelectorAll('.notification');
        if (notifications.length > 10) {
            notifications[notifications.length - 1].remove();
        }
    }
}

// 启动应用
window.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});
