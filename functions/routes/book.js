const express = require("express");
const middleware = require("../src/middleware.js");
const admin = require("firebase-admin");
const asyncjs = require("async");
const requestExternalAPI = require("request");
const constant = require("../src/constant.js");
const router = express.Router();

const db = admin.firestore();
const checkIfAuthenticated = middleware.validateFirebaseIdToken;
const baseUrlGoogleBooksAPI = constant.baseUrlGoogleBooksAPI;

// get popular books
router.get("/book/popularBooks", (req, res) => {
    (async () => {
        try {
            var listID = [];
            var snap = await db.collection("ratings").orderBy("note", "desc").limit(6).get();
            let docs = snap.docs;
            for (let doc of docs) {
                listID.push(doc.data()["id"]);
            }
            if (listID.length == 0) {
                return res.status(200).send(listID);
            }
            let base = `${baseUrlGoogleBooksAPI}volumes/`;
            let urls = [];
            for (let i = 0; i < listID.length; i++) {
                urls.push(base + listID[i]);
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

// get books by id
router.get("/book/bookDetail/:book_id", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let url = `${baseUrlGoogleBooksAPI}volumes/${req.params.book_id}`;
            requestExternalAPI(url, function (error, response, body) {
                if (error) {
                    console.log("error:", error);
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
router.get("/book/userListBooks/:user_id", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let url = `${baseUrlGoogleBooksAPI}volumes/`;
            let response = [];
            let query = db.collection("books_users").where("user_id", "==", req.params.user_id).orderBy("timestamp", "desc").limit(5);
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