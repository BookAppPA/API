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

const authR = require("./routes/auth.js");
const auth = app.use(authR);

const userR = require("./routes/user.js");
const user = app.use(userR); 

const bookR = require("./routes/book.js");
const book = app.use(bookR); 

const searchR = require("./routes/search.js");
const search = app.use(searchR); 

const ratingR = require("./routes/rating.js");
const rating = app.use(ratingR); 

const booksellerR = require("./routes/bookseller.js");
const bookseller = app.use(booksellerR); 

// Get Date Server
exports.dateServer = functions.region("europe-west3").https.onRequest((request, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({ timestamp: Date.now() }));
});

exports.auth = functions.region("europe-west3").https.onRequest(auth);
exports.book = functions.region("europe-west3").https.onRequest(book);
exports.user = functions.region("europe-west3").https.onRequest(user);
exports.search = functions.region("europe-west3").https.onRequest(search);
exports.rating = functions.region("europe-west3").https.onRequest(rating);
exports.bookseller = functions.region("europe-west3").https.onRequest(bookseller);