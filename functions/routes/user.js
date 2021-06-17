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
            await db.collection('users').doc(req.params.user_id)
                .set(req.body, { merge: true });
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error.toJSON());
        }
    })();
});

// get user by id
router.get('/api/bdd/getUserById/:user_id', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            const doc = await db.collection('users').doc(req.params.user_id).get();
            return res.status(200).send(doc.data());
        } catch (error) {
            console.log(error);
            return res.status(500).send(error.toJSON());
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
            return res.status(500).send(error.toJSON());
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
            return res.status(500).send(error.toJSON());
        }
    })();
});

module.exports = router