const express = require('express');
const middleware = require('../src/middleware.js');
const admin = require('firebase-admin');
const router = express.Router();

const db = admin.firestore();
const checkIfAuthenticated = middleware.checkIfAuthenticated;

// Update user
router.put('/api/auth/updateUser/:user_id', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            const isBookSeller = req.headers.isbookseller == "true";
            if (isBookSeller) {
                const data = req.body;
                if (data["open_hour"] != undefined) {
                    data["open_hour"] = JSON.parse(data["open_hour"]);
                }
                if (data["dateNextAddBookWeek"] != undefined) {
                    data["dateNextAddBookWeek"] = new Date(data["dateNextAddBookWeek"]);
                }
                await db.collection('bookseller').doc(req.params.user_id)
                    .set(data, { merge: true });
            } else {
                await db.collection('users').doc(req.params.user_id)
                    .set(req.body, { merge: true });
            }
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get user by id
router.get('/api/bdd/getUserById/:user_id', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            var doc = await db.collection('users').doc(req.params.user_id).get();
            var map = {
                "type": "user"
            };
            if (doc.data() == undefined) {
                doc = await db.collection('bookseller').doc(req.params.user_id).get();
                map = {
                    "type": "bookseller"
                };
            }
            map["data"] = doc.data();
            return res.status(200).send(map);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Add Book to Gallery of User
router.post('/api/bdd/addBookToGallery', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let data = {
                "book_id": req.body['bookid'],
                "user_id": req.headers.uid,
                "timestamp": admin.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('books_users').doc(`${req.headers.uid}-${req.body['bookid']}`)
                .set(data, { merge: true });
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});


// Delete Book From Gallery of User
router.delete('/api/bdd/deleteBookFromGallery', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            await db.collection('books_users').doc(`${req.headers.uid}-${req.body['bookid']}`)
                .delete();
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Follow User
router.post('/api/bdd/followUser/:user_id_to_follow', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            const userDest = JSON.parse(req.body["userDest"]);
            userDest["timestamp"] = admin.firestore.FieldValue.serverTimestamp();
            await db.collection('users').doc(req.headers.uid).collection("following").doc(req.params.user_id_to_follow)
                .set(userDest, { merge: true });
            const userSrc = JSON.parse(req.body["userSrc"]);
            userSrc["timestamp"] = admin.firestore.FieldValue.serverTimestamp();
            await db.collection('users').doc(req.params.user_id_to_follow).collection("followers").doc(req.headers.uid)
                .set(userSrc, { merge: true });
            await db.collection('users').doc(req.params.user_id_to_follow).set({ "nbFollowers": parseInt(req.body["nbFollowers"]) }, { merge: true });
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get list followers by user ID
router.get('/api/bdd/getListFollowers/:user_id', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let followers = [];
            let snap = await db.collection('users').doc(req.params.user_id).collection("followers").orderBy("timestamp", "desc").limit(5).get();
            let docs = snap.docs;
            for (let doc of docs) {
                followers.push(doc.data());
            }
            return res.status(200).send(followers);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Delete Follow of User
router.delete('/api/bdd/unFollowUser/:user_id_to_unfollow', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            await db.collection('users').doc(req.headers.uid).collection("following").doc(req.params.user_id_to_unfollow)
                .delete();
            await db.collection('users').doc(req.params.user_id_to_unfollow).collection("followers").doc(req.headers.uid)
                .delete();
            await db.collection('users').doc(req.params.user_id_to_unfollow).set({ "nbFollowers": parseInt(req.body["nbFollowers"]) }, { merge: true });
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Check if user is Follow
router.get('/api/bdd/isFollow/:user_id', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            const doc = await db.collection('users').doc(req.headers.uid).collection("following").doc(req.params.user_id)
                .get();
            return res.status(200).send({
                "status": doc.data() != undefined
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});


module.exports = router