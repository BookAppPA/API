const express = require('express');
const middleware = require('../src/middleware.js');
const admin = require('firebase-admin');
const firebase = require('firebase');
const requestExternalAPI = require('request');
const constant = require('../src/constant.js');
const router = express.Router();

const adminAuth = admin.auth();
const db = admin.firestore();
const checkIfAuthenticated = middleware.checkIfAuthenticated;
const baseUrlCheckSiret = constant.baseUrlCheckSiret;
const baseUrlCheckSiren = constant.baseUrlCheckSiren;

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
                isBlocked: false,
            }, { merge: true });
            return res.status(200).send(user);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Login user
router.post('/api/auth/login', (req, res) => {
    (async () => {
        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password);
            const user = userCredential.user;
            var doc = await firebase.firestore().collection('users').doc(user.uid).get();
            var map = {
                "type": "user"
            };
            if (doc.data() == undefined) {
                doc = await firebase.firestore().collection('bookseller').doc(user.uid).get();
                map = {
                    "type": "bookseller"
                };
            }
            console.log(doc.data());
            map["data"] = doc.data();
            return res.status(200).send(map);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
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
            return res.status(500).send(error);
        }
    })();
});

// Check SIRET number is valid and return infos
router.get('/api/auth/checkSiret', (req, res) => {
    (async () => {
        try {
            let url = `${baseUrlCheckSiret}${req.headers.siret}`;
            requestExternalAPI(url, function (error, response, body) {
                if (error) {
                    console.log('error:', error);
                    return res.status(500).send(error);
                } else {
                    let bookseller = JSON.parse(body);
                    return res.status(200).send(bookseller.siege_social);
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Check SIREN number is valid and return infos
router.get('/api/auth/checkSiren', (req, res) => {
    (async () => {
        try {
            let url = `${baseUrlCheckSiren}${req.headers.siren}`;
            requestExternalAPI(url, function (error, response, body) {
                if (error) {
                    console.log('error:', error);
                    return res.status(500).send(error);
                } else {
                    let bookseller = JSON.parse(body);
                    return res.status(200).send(bookseller.siege_social);
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Signup bookseller
router.post('/api/auth/signupBookSeller', (req, res) => {
    (async () => {
        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(
                req.body.email,
                req.headers.password,
            );
            const user = userCredential.user;
            const bookseller = {
                id: user.uid,
                email: req.body.email,
                name: req.body.name,
                address: req.body.address,
                siret: req.body.siret,
                coord: {
                    "lat": parseFloat(req.body.lat),
                    "lon": parseFloat(req.body.lon),
                },
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('bookseller').doc(user.uid).set(bookseller, { merge: true });
            return res.status(200).send(bookseller);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

module.exports = router