const express = require('express');
const middleware = require('../src/middleware.js');
const admin = require('firebase-admin');
const asyncjs = require('async');
const requestExternalAPI = require('request');
const constant = require('../src/constant.js');
const router = express.Router();

const db = admin.firestore();
const checkIfAuthenticated = middleware.checkIfAuthenticated;
const baseUrlGoogleBooksAPI = constant.baseUrlGoogleBooksAPI;

// get popular books
router.get('/api/bdd/popularBooks', (req, res) => {
    (async () => {
        try {
            let url = `${baseUrlGoogleBooksAPI}volumes?q=harry+potter&filter=partial&maxResults=6`;
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

// get books by id
router.get('/api/bdd/bookDetail/:book_id', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let url = `${baseUrlGoogleBooksAPI}volumes/${req.params.book_id}`;
            requestExternalAPI(url, function (error, response, body) {
                if (error) {
                    console.log('error:', error);
                    return res.status(500).send(error);
                } else {
                    return res.status(200).send(JSON.parse(body));
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get list user books
router.get('/api/bdd/userListBooks/:user_id', checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let url = `${baseUrlGoogleBooksAPI}volumes/`;
            let response = [];
            let query = db.collection('books_users').where("user_id", "==", req.params.user_id).orderBy("timestamp", "desc").limit(5);
            await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs;
                for (let doc of docs) {
                    response.push(doc.data());
                }
            });
            let urls = [];
            for (let i = 0; i < response.length; i++) {
                urls.push(url + response[i].book_id);
            }

            asyncjs.map(urls, function (url, callback) {
                requestExternalAPI(url, function (err, response, body) {
                    callback(err, JSON.parse(body));
                })
            }, function (err, books) {
                if (err) {
                    return res.status(500).send(err);
                }
                return res.status(200).send(books);
            });

        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});


module.exports = router