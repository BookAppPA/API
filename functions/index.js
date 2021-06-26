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

const validateFirebaseIdToken = async (req, res, next) => {
  functions.logger.log('Check if request is authorized with Firebase ID token');

  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
      !(req.cookies && req.cookies.__session)) {
    functions.logger.error(
      'No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.'
    );
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    functions.logger.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if(req.cookies) {
    functions.logger.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    functions.logger.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    functions.logger.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
    return;
  }
};

const app = express();
app.use(cors({ origin: true }));

app.use(validateFirebaseIdToken);

/*const middleware = require("./src/middleware.js");
app.use(middleware.checkIfAuthenticated);

app.use(middleware.checkIfAdmin);*/

app.use(require("./routes/user.js"));

app.use(require("./routes/auth.js"));

app.use(require("./routes/book.js")); 

app.use(require("./routes/search.js")); 

app.use(require("./routes/rating.js")); 

app.use(require("./routes/bookseller.js")); 

// Get Date Server
exports.dateServer = functions.region("europe-west3").https.onRequest((request, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({ timestamp: Date.now() }));
});

exports.app = functions.region("europe-west3").https.onRequest(app);