const express = require("express");
const admin = require("firebase-admin");
const asyncjs = require("async");
const requestExternalAPI = require("request");
const constant = require("../src/constant.js");
const router = express.Router();
const removeTags = require('../src/functions.js');

const db = admin.firestore();
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
                    var parser = JSON.parse(body);
                    parser["volumeInfo"]["description"] = removeTags(parser["volumeInfo"]["description"])
                    callback(err, parser);
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
router.get("/book/bookDetail/:book_id", (req, res) => {
    (async () => {
        try {
            let url = `${baseUrlGoogleBooksAPI}volumes/${req.params.book_id}`;
            requestExternalAPI(url, function (error, response, body) {
                if (error) {
                    console.log("error:", error);
                    return res.status(500).send(error);
                } else {
                    var parser = JSON.parse(body);
                    parser["volumeInfo"]["description"] = removeTags(parser["volumeInfo"]["description"])
                    return res.status(200).send(parser);
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get list user books
router.get("/book/userListBooks/:user_id", (req, res) => {
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
                    var parser = JSON.parse(body);
                    parser["volumeInfo"]["description"] = removeTags(parser["volumeInfo"]["description"])
                    callback(err, parser);
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

//get all books in app
router.get("/book/getAllBooks", (req, res) => {
    (async () => {
        try {
            const booksId = [];
            const doc = await db.collection("books_users").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    booksId.push(doc.data().book_id);
                })
            })
            return res.status(200).send(booksId);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error.toJSON());
        }
    })();
});


module.exports = router