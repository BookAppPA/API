const express = require("express");
const middleware = require("../src/middleware.js");
const admin = require("firebase-admin");
const router = express.Router();

const db = admin.firestore();
const checkIfAuthenticated = middleware.validateFirebaseIdToken;

// get user by id
router.get("/bookseller/getBookSellerById/:bookseller_id", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            doc = await db.collection("bookseller").doc(req.params.bookseller_id).get();
            return res.status(200).send(doc.data());
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get init list booksellers
router.get("/bookseller/getInitListBookSeller", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let booksSellers = [];
            let snap = await db.collection("bookseller").orderBy("timestamp", "desc").limit(5).get();
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
router.get("/bookseller/getListBooksWeek/:bookseller_id", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let booksWeek = [];
            let snap = await db.collection("bookweek").doc(req.params.bookseller_id).collection("books").orderBy("timestamp", "desc").limit(5).get();
            let docs = snap.docs;
            for (let doc of docs) {
                booksWeek.push(doc.data());
            }
            return res.status(200).send(booksWeek);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Add Book to Gallery of User
router.post("/bookseller/addBookWeek", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let data = req.body;
            data["timestamp"] = admin.firestore.FieldValue.serverTimestamp();
            await db.collection("bookweek").doc(req.headers.uid).collection("books").doc(req.body["id"])
                .set(data, { merge: true });
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});


module.exports = router