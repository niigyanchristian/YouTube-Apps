const express = require("express");
const { Expo } = require("expo-server-sdk") ;

const app = express();
const PORT = 8000;

const expo = new Expo();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Expo Notification Backend");
});

app.post("/api/push-notification", async (req, res) => {
  const { token, title, body, metadata } = req.body;
  if (!Expo.isExpoPushToken(token)) {
    throw new Error("Invalid push token", 400);
  }

  const message = {
    to: token,
    sound: "default",
    title: title,
    body: body,
    data: metadata || {},
  };

  const tickets = await expo.sendPushNotificationsAsync([message]);

  return res.status(200).json(tickets);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
