const express = require('express');
const middleware = require('../src/middleware.js');
const admin = require('firebase-admin');
const constant = require('../src/constant.js');
const requestExternalAPI = require('request');
const router = express.Router();

const db = admin.firestore();
const checkIfAuthenticated = middleware.checkIfAuthenticated;
const baseUrlGoogleBooksAPI = constant.baseUrlGoogleBooksAPI;

// get books by search
router.get('/api/bdd/searchBook', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let search = req.headers.search.replace(" ", "+");
            let url = `${baseUrlGoogleBooksAPI}volumes?q=${search}&filter=partial&maxResults=2`;
            requestExternalAPI(url, function (error, response, body) {
                if (error) {
                    console.log('error:', error);
                    return res.status(500).send(error);
                } else {
                    let books = JSON.parse(body);
                    return res.status(200).send(books.items);
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get search books by author
router.get('/api/bdd/searchBooksByAuthor', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let search = req.headers.search.replace(" ", "+");
            let url = `${baseUrlGoogleBooksAPI}volumes?q=inauthor:${search}&filter=partial&maxResults=2`;
            requestExternalAPI(url, function (error, response, body) {
                if (error) {
                    console.log('error:', error);
                    return res.status(500).send(error);
                } else {
                    let books = JSON.parse(body);
                    return res.status(200).send(books.items);
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get search users
router.get('/api/bdd/searchUsers', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let users = [];
            let snap = await db.collection('users').where("pseudo", "==", req.headers.search).where("isBlocked", "==", false).get();
            let docs = snap.docs;
            for (let doc of docs) {
                users.push(doc.data());
            }
            return res.status(200).send(users);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get search bookSeller
router.get('/api/bdd/searchBookSeller', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let booksellers = [];
            let snap = await db.collection('bookseller').where("name", "==", req.headers.search).get();
            let docs = snap.docs;
            for (let doc of docs) {
                booksellers.push(doc.data());
            }
            return res.status(200).send(booksellers);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

module.exports = router