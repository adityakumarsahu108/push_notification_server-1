require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
// const fs = require("fs");
// const path = require("path");
console.log(process.env); // Log environment variables

// Initialize Firebase Admin
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};
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
