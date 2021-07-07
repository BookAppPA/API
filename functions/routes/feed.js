const functions = require("firebase-functions");
const express = require("express");
const middleware = require("../src/middleware.js");
const admin = require("firebase-admin");
const router = express.Router();

const db = admin.firestore();
const checkIfAuthenticated = middleware.validateFirebaseIdToken;

//get all users in app
router.get("/feed/getFeed/:user_id", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            const ratings = [];
            const snap = await db.collection("users").doc(req.params.user_id).collection("feed").orderBy("timestamp", "desc").get();
            let docs = snap.docs;
            for (let doc of docs) {
                ratings.push(doc.data());
            }
            return res.status(200).send(ratings);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error.toJSON());
        }
    })();
});

module.exports = router
