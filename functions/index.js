const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
const express = require('express');
const cors = require('cors');

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

const auth = require('./routes/auth.js');
app.use(auth);

const user = require('./routes/user.js');
app.use(user); 

const book = require('./routes/book.js');
app.use(book); 

const search = require('./routes/search.js');
app.use(search); 

const rating = require('./routes/rating.js');
app.use(rating); 

const bookseller = require('./routes/bookseller.js');
app.use(bookseller); 


exports.app = functions.https.onRequest(app);