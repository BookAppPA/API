const express = require("express");
const middleware = require("../src/middleware.js");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const router = express.Router();

const db = admin.firestore();
const checkIfAuthenticated = middleware.validateFirebaseIdToken;

// get list ratings by book ID
router.get("/rating/ratingByBook/:book_id", (req, res) => {
    (async () => {
        try {
            let map = {};
            let ratings = [];
            let doc = await db.collection("ratings").doc(req.params.book_id).get();
            let result = doc.data();
            if (result != null && result != undefined) {
                map["id"] = result["id"]
                map["nbRatings"] = result["nbRatings"];
                map["note"] = result["note"];
                map["book_title"] = result["book_title"];
                map["book_pic"] = result["book_pic"];
                let snap = await db.collection("ratings").doc(req.params.book_id).collection("comments").orderBy("timestamp", "desc").get();
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
router.get("/rating/userListRatings", (req, res) => {
    (async () => {
        try {
            let ratings = [];
            let booksId = req.headers.listbooks.split("/");
            for (let id of booksId) {
                let snap = await db.collection("ratings").doc(id).collection("comments").doc(req.headers.uid).get();
                if (snap.data() != undefined) {
                    ratings.push(snap.data());
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
            data["rating"] = JSON.parse(data["rating"]);
            data["rating"]["timestamp"] = admin.firestore.FieldValue.serverTimestamp();
            data["user_nbRatings"] = parseInt(data["user_nbRatings"]);
            data["rating"]["note"] = parseFloat(data["rating"]["note"]);
            await db.collection("ratings").doc(req.params.book_id).collection("comments").doc(req.headers.uid).set(data["rating"]);
            const doc = await db.collection("ratings").doc(req.params.book_id).get();
            var nbRatings = 0;
            var noteGlobal = 0;
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
            const data = req.body;
            const rating = JSON.parse(data["rating"]);
            data["previous_note"] = parseFloat(data["previous_note"]);
            functions.logger.log(data["previous_note"].toString());
            rating["note"] = parseFloat(rating["note"]);
            functions.logger.log(rating["note"].toString());
            await db.collection("ratings").doc(req.params.book_id).collection("comments").doc(req.headers.uid).set(rating, {merge: true});
            const doc = await db.collection("ratings").doc(req.params.book_id).get();
            functions.logger.log(doc.data());
            if (doc.data() != undefined) {
                var nbRatings = doc.data()["nbRatings"];
                const noteGlobal = doc.data()["note"];
                var noteFinal = ((noteGlobal * nbRatings) - data["previous_note"]) / (nbRatings - 1);
                noteFinal = Math.round(noteFinal * 2) / 2;
                if (isNaN(noteFinal)) {
                    noteFinal = 0;
                    nbRatings = 0;
                } else {
                    nbRatings -= 1;
                }
                functions.logger.log(noteFinal);

                noteFinal = ((noteFinal * nbRatings) + rating["note"]) / (nbRatings + 1);
                functions.logger.log(noteFinal);
                noteFinal = Math.round(noteFinal * 2) / 2;
                functions.logger.log(noteFinal);
                await db.collection("ratings").doc(req.params.book_id).set({"note": parseFloat(noteFinal.toString())}, {merge: true});
            }
            return res.status(200).send();
        } catch (error) {
            functions.logger.error(error);
            return res.status(500).send(error);
        }
    })();
})


// Delete Rating by userID
router.post("/rating/deleteRating/:book_id", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let data = req.body;
            await db.collection("ratings").doc(req.params.book_id).collection("comments").doc(req.headers.uid).delete();
            const noteRating = parseFloat(data["note"]);
            const doc = await db.collection("ratings").doc(req.params.book_id).get();
            if (doc.data() != undefined) {
                var nbRatings = doc.data()["nbRatings"];
                const noteGlobal = doc.data()["note"];
                var noteFinal = ((noteGlobal * nbRatings) - noteRating) / (nbRatings - 1);
                noteFinal = Math.round(noteFinal * 2) / 2;
                if (isNaN(noteFinal)) {
                    await db.collection("ratings").doc(req.params.book_id).delete();
                } else {
                    nbRatings -= 1;
                    await db.collection("ratings").doc(req.params.book_id).set({"nbRatings": nbRatings, "note": parseFloat(noteFinal.toString())}, {merge: true});
                }
            }
            await db.collection("users").doc(req.headers.uid).set({"nbRatings": parseInt(data["user_nbRatings"]) - 1}, {merge: true});
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

module.exports = router