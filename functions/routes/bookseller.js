const express = require('express');
const middleware = require('../src/middleware.js');
const admin = require('firebase-admin');
const router = express.Router();

const db = admin.firestore();
const checkIfAuthenticated = middleware.checkIfAuthenticated;

// get init list booksellers
router.get('/api/bdd/getInitListBookSeller', checkIfAuthenticated, (req, res) => {
    (async () => {
      try {
        let booksSellers = [];
        let snap = await db.collection('bookseller').orderBy("timestamp", "desc").limit(5).get();
        let docs = snap.docs;
          for (let doc of docs) {
            booksSellers.push(doc.data());
          }
        return res.status(200).send(booksSellers);
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    })();
  });
  
  
  // get list books week by bookSeller ID
  router.get('/api/bdd/getListBooksWeek/:bookseller_id', checkIfAuthenticated, (req, res) => {
    (async () => {
      try {
        let booksWeek = [];
        let snap = await db.collection('bookweek').doc(req.params.bookseller_id).collection("books").orderBy("timestamp", "desc").limit(5).get();
        let docs = snap.docs;
        for (let doc of docs) {
          booksWeek.push(doc.data());
        }
        return res.status(200).send(booksWeek);
      } catch (error) {
        console.log(error);
        return res.status(500).send(error.toJSON());
      }
    })();
  });
  

module.exports = router