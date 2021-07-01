const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firebase = require("firebase");
const express = require("express");
const cors = require("cors");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const APP_NAME = "BookWorm";

var serviceAccount = require("./permission.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://book-app-7f51e..firebaseio.com"
});

const config = {
  apiKey: "AIzaSyDkIM4fkJauoBuipNT7qk_rBFbyDxSLeiI",
  authDomain: "book-app-7f51e.firebaseapp.com",
  projectId: "book-app-7f51e",
  storageBucket: "book-app-7f51e.appspot.com",
  messagingSenderId: "276286363904",
  appId: "1:276286363904:web:4527a6dfb3756c9fdcbbe5",
  measurementId: "G-GY017BZWTV"
}

firebase.initializeApp(config);

const app = express();
app.use(cors({ origin: true }));

const db = admin.firestore();

app.use(require("./routes/user.js"));

app.use(require("./routes/auth.js"));

app.use(require("./routes/book.js"));

app.use(require("./routes/search.js"));

app.use(require("./routes/rating.js"));

app.use(require("./routes/feed.js"));

app.use(require("./routes/bookseller.js"));

// Get Date Server
exports.dateServer = functions.region("europe-west3").https.onRequest((request, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({ timestamp: Date.now() }));
});

const biQuery = require('./biqQuery/get_data_from_analytics');

exports.app = functions.region("europe-west3").https.onRequest(app);


// Populate Feed
exports.populateFeed = functions.region('europe-west3').firestore
  .document('/ratings/{bookId}/comments/{userId}')
  .onCreate(async (snapshot, context) => {
    const rating = snapshot.data()
    const meId = context.params.userId.toString();
    const followersSnap = await db.collection("users").doc(meId).collection('followers').get();
    let followersDocs = followersSnap.docs;
    for (let follower of followersDocs) {
      await db.collection("users").doc(follower.data()["id"]).collection("feed").add(rating);
    }
  });