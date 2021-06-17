const express = require('express');
const middleware = require('../src/middleware.js');
const admin = require('firebase-admin');
const router = express.Router();

const db = admin.firestore();
const checkIfAuthenticated = middleware.checkIfAuthenticated;

// get list ratings by book ID
router.get('/api/bdd/ratingByBook/:book_id', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let map = {};
            let ratings = [];
            let doc = await db.collection('ratings').doc(req.params.book_id).get();
            let result = doc.data();
            if (result != null && result != undefined) {
                map["nbRatings"] = result["nbRatings"];
                map["note"] = result["note"];
                let snap = await db.collection('ratings').doc(req.params.book_id).collection("comments").orderBy("timestamp", "desc").limit(5).get();
                let docs = snap.docs;
                for (let doc of docs) {
                    ratings.push(doc.data());
                }
                map["ratings"] = ratings;
            }
            return res.status(200).send(map);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});


// get list last user ratings
router.get('/api/bdd/userListRatings', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let ratings = [];
            let booksId = req.headers.listbooks.split("/");
            for (let id of booksId) {
                let query = db.collection('ratings').doc(id).collection("comments").where("user_id", "==", req.headers.uid).limit(1);
                let res = await query.get();
                if (res.docs.length == 1) {
                    let map = res.docs[0].data();
                    ratings.push(map);
                }
            }
            return res.status(200).send(ratings);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});


module.exports = router