const express = require("express");
const middleware = require("../src/middleware.js");
const admin = require("firebase-admin");
const router = express.Router();

const db = admin.firestore();
const checkIfAuthenticated = middleware.validateFirebaseIdToken;

// get list ratings by book ID
router.get("/rating/ratingByBook/:book_id", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let map = {};
            let ratings = [];
            let doc = await db.collection("ratings").doc(req.params.book_id).get();
            let result = doc.data();
            if (result != null && result != undefined) {
                map["nbRatings"] = result["nbRatings"];
                map["note"] = result["note"];
                map["book_title"] = result["book_title"];
                map["book_pic"] = result["book_pic"];
                let snap = await db.collection("ratings").doc(req.params.book_id).collection("comments").orderBy("timestamp", "desc").limit(5).get();
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
router.get("/rating/userListRatings", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let ratings = [];
            let booksId = req.headers.listbooks.split("/");
            for (let id of booksId) {
                let query = db.collection("ratings").doc(id).collection("comments").doc(req.headers.uid);
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

// Add Rating by userID
router.post("/rating/addRating/:book_id", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let data = req.body;
            data["rating"]["timestamp"] = admin.firestore.FieldValue.serverTimestamp();
            await db.collection("ratings").doc(req.params.book_id).collection("comments").doc(req.headers.uid).set(data["rating"]);
            const doc = await db.collection("ratings").doc(req.params.book_id).get();
            const nbRatings = 0;
            const noteGlobal = 0;
            if (doc.data() == undefined) {
                await db.collection("ratings").doc(req.params.book_id).set({
                    "book_pic": data["rating"]["book_pic"],
                    "book_title": data["rating"]["book_title"],
                    "id": req.params.book_id,
                    "nbRatings": 0,
                    "note": 0,
                });
            } else {
                nbRatings = doc.data()["nbRatings"];
                noteGlobal = doc.data()["note"];
            }
            var noteFinal = ((noteGlobal * nbRatings) + data["rating"]["note"]) / (nbRatings + 1);
            noteFinal = Math.round(noteFinal * 2) / 2;
            await db.collection("ratings").doc(req.params.book_id).set({"nbRatings": nbRatings + 1, "note": parseFloat(noteFinal.toString())}, {merge: true});
            await db.collection("users").doc(req.headers.uid).set({"nbRatings": data["user_nbRatings"] + 1}, {merge: true});
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Modify Rating by user
router.put("/rating/modifyRating/:book_id", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            await db.collection("ratings").doc(req.params.book_id).collection("comments").doc(req.headers.uid).set(req.body, {merge: true});
            return res.status(200).send();
        } catch (error) {
            return res.status(500).send(error);
        }
    })();
})


// Delete Rating by userID
router.delete("/rating/deleteRating/:book_id", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let data = req.body;
            await db.collection("ratings").doc(req.params.book_id).collection("comments").doc(req.headers.uid).delete();
            const noteRating = data["note"];
            const doc = await db.collection("ratings").doc(req.params.book_id).get();
            if (doc.data() != undefined) {
                const nbRatings = doc.data()["nbRatings"];
                const noteGlobal = doc.data()["note"];
                var noteFinal = ((noteGlobal * nbRatings) - noteRating) / (nbRatings - 1);
                noteFinal = Math.round(noteFinal * 2) / 2;
                await db.collection("ratings").doc(req.params.book_id).set({"nbRatings": nbRatings - 1, "note": parseFloat(noteFinal.toString())}, {merge: true});
            }
            await db.collection("users").doc(req.headers.uid).set({"nbRatings": data["user_nbRatings"] - 1}, {merge: true});
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

module.exports = router