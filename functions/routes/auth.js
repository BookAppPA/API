const express = require('express');
const middleware = require('../src/middleware.js');
const admin = require('firebase-admin');
const firebase = require('firebase');
const router = express.Router();

const adminAuth = admin.auth();
const db = admin.firestore();
const checkIfAuthenticated = middleware.checkIfAuthenticated;

// Signup user
router.post('/api/auth/signup', (req, res) => {
    (async () => {
        try {
            const user = await adminAuth.createUser({
                email: req.body.email,
                password: req.body.password,
                displayName: req.body.pseudo,
            });
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: req.body.email,
                pseudo: req.body.pseudo,
            }, { merge: true });
            return res.status(200).send(user.toJSON());
        } catch (error) {
            console.log(error);
            return res.status(500).send(error.toJSON());
        }
    })();
});

// Login user
router.post('/api/auth/login', (req, res) => {
    (async () => {
        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password);
            const user = userCredential.user;
            const doc = await firebase.firestore().collection('users').doc(user.uid).get();
            return res.status(200).send(doc.data());
        } catch (error) {
            console.log(error);
            return res.status(500).send(error.toJSON());
        }
    })();
});

// Logout user
router.post('/api/auth/logout', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            await firebase.auth().signOut();
            return res.status(200).send("logout");
        } catch (error) {
            console.log(error);
            return res.status(500).send(error.toJSON());
        }
    })();
});

module.exports = router