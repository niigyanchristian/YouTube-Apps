const express = require('express');
const { Expo } = require('expo-server-sdk');

const app = express();
const expo = new Expo();

app.use(express.json());

// Store push tokens (in production, use a database)
let pushTokens = [];

// Register push token
app.post('/api/register-token', (req, res) => {
  const { token } = req.body;
  if (Expo.isExpoPushToken(token) && !pushTokens.includes(token)) {
    pushTokens.push(token);
  }
  res.json({ success: true });
});

// Send notification to all users
app.post('/api/send-notification', async (req, res) => {
  const { title, body } = req.body;
  
  let messages = pushTokens
    .filter(token => Expo.isExpoPushToken(token))
    .map(token => ({
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: { timestamp: Date.now() },
      priority: 'high',
    }));

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }

  res.json({ success: true, tickets });
});

// News API endpoints
let newsItems = [];

app.get('/api/news', (req, res) => {
  res.json(newsItems);
});

app.get('/api/tokens', (req, res) => {
  res.json(pushTokens);
});

app.post('/api/news', async (req, res) => {
  const { title, content, author } = req.body;
  
  const newsItem = {
    id: Date.now().toString(),
    title,
    content,
    author: author || 'Admin',
    timestamp: Date.now()
  };
  
  newsItems.unshift(newsItem);
  
  // Send push notification
  await sendNotificationToAll('New Article Published', title);
  
  res.json(newsItem);
});

async function sendNotificationToAll(title, body) {
  let messages = pushTokens
    .filter(token => Expo.isExpoPushToken(token))
    .map(token => ({
      to: token,
      sound: 'default',
      title: title,
      body: body,
      priority: 'high',
    }));

    console.log("messages:",messages)
    
    let chunks = expo.chunkPushNotifications(messages);

    console.log("chunks:",chunks)
  
  // for (let chunk of chunks) {
  //   try {
  //     await expo.sendPushNotificationsAsync(chunk);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
  for (let chunk of chunks) {
  try {
    let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    console.log("TICKET:", ticketChunk);
  } catch (e) {
    console.log("PUSH ERROR:", e);
  }
}

}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});