const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
require('dotenv').config();
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin
const serviceAccountPath = path.resolve(__dirname, "./keys/serviceAccountKey.json");

// Read and parse the file
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
console.log(serviceAccount);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.json());

// Endpoint to send notification
app.post("/send-notification", async (req, res) => {
  const { fcmToken, title, body, imageUrl } = req.body;

  if (!fcmToken || !title || !body) {
    return res.status(400).send({ error: "fcmToken, title, and body are required" });
  }

  const message = {
    notification: {
      title: title,
      body: body,
    },
    android: {
      notification: {
        image: imageUrl || null,
      },
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).send({ success: true, response });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).send({ error: "Failed to send notification" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
