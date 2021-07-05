const express = require("express");
const middleware = require("../src/middleware.js");
const admin = require("firebase-admin");
const router = express.Router();

const db = admin.firestore();
const checkIfAuthenticated = middleware.validateFirebaseIdToken;

// Update user
router.put("/user/updateUser/:user_id", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            const isBookSeller = req.headers.isbookseller == "true";
            const data = req.body;
            if (isBookSeller) {
                if (data["open_hour"] != undefined) {
                    data["open_hour"] = JSON.parse(data["open_hour"]);
                }
                if (data["dateNextAddBookWeek"] != undefined) {
                    data["dateNextAddBookWeek"] = new Date(data["dateNextAddBookWeek"]);
                }
                await db.collection("bookseller").doc(req.params.user_id)
                    .set(data, { merge: true });
            } else {
                if (data["listCategories"] != undefined) {
                    data["listCategories"] = JSON.parse(data["listCategories"].replace(/'/g, '"'));
                }
                console.log(data);
                await db.collection("users").doc(req.params.user_id)
                    .set(data, { merge: true });
            }
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get user by id
router.get("/user/getUserById/:user_id", (req, res) => {
    (async () => {
        try {
            var doc = await db.collection("users").doc(req.params.user_id).get();
            var map = {
                "type": "user"
            };
            if (doc.data() == undefined) {
                doc = await db.collection("bookseller").doc(req.params.user_id).get();
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

//get all users in app
router.get("/user/getAllUsers", (req, res) => {
    (async () => {
        try {
            const users = [];
            const doc = await db.collection("users").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    users.push(doc.data());
                })
            })
            return res.status(200).send(users);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error.toJSON());
        }
    })();
});

// Add Book to Gallery of User
router.post("/user/addBookToGallery", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            let data = {
                "book_id": req.body["bookid"],
                "user_id": req.headers.uid,
                "timestamp": admin.firestore.FieldValue.serverTimestamp()
            };
            await db.collection("books_users").doc(`${req.headers.uid}-${req.body["bookid"]}`)
                .set(data, { merge: true });
            var nbBooks = parseInt(req.body["nbBook"]) + 1;
            if (nbBooks < 0) {
                nbBooks = 0;
            }
            await db.collection("users").doc(req.headers.uid).set({ "nbBooks": nbBooks }, { merge: true });
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});


// Delete Book From Gallery of User
router.post("/user/deleteBookFromGallery", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            await db.collection("books_users").doc(`${req.headers.uid}-${req.body["bookid"]}`)
                .delete();
            var nbBooks = parseInt(req.body["nbBook"]) - 1;
            if (nbBooks < 0) {
                nbBooks = 0;
            }
            await db.collection("users").doc(req.headers.uid).set({ "nbBooks": nbBooks }, { merge: true });
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Follow User
router.post("/user/followUser/:user_id_to_follow", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            const userDest = JSON.parse(req.body["userDest"]);
            userDest["timestamp"] = admin.firestore.FieldValue.serverTimestamp();
            await db.collection("users").doc(req.headers.uid).collection("following").doc(req.params.user_id_to_follow)
                .set(userDest, { merge: true });
            console.log(userDest["isBookSeller"]);
            if (!userDest["isBookSeller"]) {
                const userSrc = JSON.parse(req.body["userSrc"]);
                userSrc["timestamp"] = admin.firestore.FieldValue.serverTimestamp();
                await db.collection("users").doc(req.params.user_id_to_follow).collection("followers").doc(req.headers.uid)
                    .set(userSrc, { merge: true });
            }
            await db.collection(userDest["isBookSeller"] ? "bookseller" : "users").doc(req.params.user_id_to_follow).set({ "nbFollowers": parseInt(req.body["nbFollowers"]) }, { merge: true });
            await db.collection("users").doc(req.headers.uid).set({ "nbFollowing": parseInt(req.body["nbFollowing"]) }, { merge: true });
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Delete Follow of User
router.post("/user/unFollowUser/:user_id_to_unfollow", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            await db.collection("users").doc(req.headers.uid).collection("following").doc(req.params.user_id_to_unfollow)
                .delete();
            if (req.body["isBookSeller"] == "false") {
                await db.collection("users").doc(req.params.user_id_to_unfollow).collection("followers").doc(req.headers.uid)
                    .delete();
            }
            console.log(req.body["nbFollowers"]);
            console.log(req.body["nbFollowing"]);
            await db.collection(req.body["isBookSeller"] ? "bookseller" : "users").doc(req.params.user_id_to_unfollow).set({ "nbFollowers": parseInt(req.body["nbFollowers"]) }, { merge: true });
            await db.collection("users").doc(req.headers.uid).set({ "nbFollowing": parseInt(req.body["nbFollowing"]) }, { merge: true });
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Check if user is Follow
router.get("/user/isFollow/:user_id", checkIfAuthenticated, (req, res) => {
    (async () => {
        try {
            const doc = await db.collection("users").doc(req.headers.uid).collection("following").doc(req.params.user_id)
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

// get list followers by user ID
router.get("/user/getListFollowers/:user_id", (req, res) => {
    (async () => {
        try {
            let followers = [];
            let snap = await db.collection("users").doc(req.params.user_id).collection("followers").orderBy("timestamp", "desc").limit(5).get();
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

// get list following by user ID
router.get("/user/getListFollowing/:user_id", (req, res) => {
    (async () => {
        try {
            let following = [];
            let snap = await db.collection("users").doc(req.params.user_id).collection("following").orderBy("timestamp", "desc").limit(5).get();
            let docs = snap.docs;
            for (let doc of docs) {
                following.push(doc.data());
            }
            return res.status(200).send(following);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

module.exports = router