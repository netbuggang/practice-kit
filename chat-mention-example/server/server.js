app.use(express.static('../client'));
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// 模拟用户数据库
const users = [
  { id: '1', name: '张三', avatar: '👨' },
  { id: '2', name: '李四', avatar: '👩' },
  { id: '3', name: '王五', avatar: '👨‍💼' },
  { id: '4', name: '赵六', avatar: '👩‍💼' }
];

// 模拟聊天室
const rooms = [
  { id: 'general', name: '综合聊天室' },
  { id: 'tech', name: '技术讨论' }
];

// 存储消息历史
const messages = {
  general: [],
  tech: []
};

// 解析消息中的@提到
function parseMentions(content) {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      name: match[1],
      userId: match[2],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }

  return mentions;
}

// 处理消息内容，转换@提到为HTML
function formatMessage(content) {
  let formatted = content;
  const mentions = parseMentions(content);

  mentions.forEach(mention => {
    const user = users.find(u => u.id === mention.userId);
    if (user) {
      const mentionHtml = `<span class="mention" data-user-id="${user.id}">@${user.name}</span>`;
      formatted = formatted.replace(
        `@[${mention.name}](${mention.userId})`,
        mentionHtml
      );
    }
  });

  return formatted;
}

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log('新用户连接:', socket.id);

  // 发送用户列表
  socket.emit('users_list', users);

  // 发送房间列表
  socket.emit('rooms_list', rooms);

  // 加入房间
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} 加入了房间 ${roomId}`);

    // 发送该房间的历史消息
    if (messages[roomId]) {
      socket.emit('room_messages', messages[roomId]);
    }
  });

  // 发送消息
  socket.on('send_message', (data) => {
    const { roomId, content, sender } = data;

    // 解析消息中的@提到
    const mentions = parseMentions(content);
    const mentionedUsers = mentions.map(m => m.userId);

    // 创建消息对象
    const message = {
      id: Date.now().toString(),
      roomId,
      sender,
      content: formatMessage(content),
      rawContent: content,
      mentions: mentionedUsers,
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // 存储消息
    if (messages[roomId]) {
      messages[roomId].push(message);

      // 限制历史消息数量
      if (messages[roomId].length > 100) {
        messages[roomId].shift();
      }
    }

    // 发送消息到房间
    io.to(roomId).emit('new_message', message);

    // 单独通知被@的用户
    mentionedUsers.forEach(userId => {
      const mentionedUser = users.find(u => u.id === userId);
      if (mentionedUser) {
        // 查找用户的socket（在实际应用中需要通过用户ID查找socket）
        // 这里简化处理，发送给所有客户端
        io.emit('user_mentioned', {
          userId,
          messageId: message.id,
          roomId,
          senderName: sender.name,
          preview: content.substring(0, 50)
        });
      }
    });
  });

  // 搜索用户
  socket.on('search_users', (data) => {
    const { keyword, roomId } = data;
    const filteredUsers = users.filter(user =>
      user.name.toLowerCase().includes(keyword.toLowerCase()) ||
      user.id.toLowerCase().includes(keyword.toLowerCase())
    );

    socket.emit('search_results', {
      keyword,
      users: filteredUsers
    });
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
  });
});

// REST API 端点
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

app.get('/api/messages/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  res.json(messages[roomId] || []);
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`WebSocket 运行在 ws://localhost:${PORT}`);
});
