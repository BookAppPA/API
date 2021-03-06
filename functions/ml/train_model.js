const express = require("express");
const constant = require("../src/constant.js");
const router = express.Router();
const tf = require('@tensorflow/tfjs-node')
const requestExternalAPI = require("request");
const asyncjs = require("async");
const { Storage } = require('@google-cloud/storage');
const os = require('os') //Firebase ne gère que un seul dossier en ecriture, le reste est en read-only;
const baseUrlGoogleBooksAPI = constant.baseUrlGoogleBooksAPI;


const storage = new Storage();
const bucketName = "gs://book-app-7f51e.appspot.com";
const fileModelJSON = "/model.json"
const fileDataset = "/web_book_data.json";
const fileBin = "/group1-shard1of1.bin"

var books;

var model;

async function downloadFile() {
    const optionsModel = {
        destination: os.tmpdir() + fileModelJSON,
    };
    const optionDataset = {
        destination: os.tmpdir() + fileDataset,
    }
    const optionBin = {
        destination: os.tmpdir() + fileBin,
    }
    await storage.bucket(bucketName).file('ml_data/model_js/model.json').download(optionsModel)
    await storage.bucket(bucketName).file("ml_data/model_js/web_book_data.json").download(optionDataset)
    await storage.bucket(bucketName).file("ml_data/model_js/group1-shard1of1.bin").download(optionBin)
    console.log('end download --- osDir', os.tmpdir());
    books = require(os.tmpdir() + fileDataset);
}


async function loadModel() {
    await downloadFile();
    // home_ = process.cwd()
    model_path = "file://"+ os.tmpdir() + "/model.json"
    console.log('FILENAME', model_path);
    // functions.logger.log(modelpath);
    model = await tf.loadLayersModel(model_path, false);
    model.summary()
}

function shuffle(array) {
    var currentIndex = array.length, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

async function recommend(userId) {
    await loadModel()
    const book_arr = tf.range(0, books.length)
    const book_len = books.length
    let user = tf.fill([book_len], Number(userId))
    pred_tensor = await model.predict([book_arr, user]).reshape([10000])
    pred = pred_tensor.arraySync()

    let recommendations = []
    for (let i = 0; i < 24; i++) {
        max = pred_tensor.argMax().arraySync()
        recommendations.push(books[max])
        pred.splice(max, 1)    //drop from array
        pred_tensor = tf.tensor(pred) //create a new tensor
    }
    return shuffle(recommendations)
}

router.get("/recommendation/:userId", (req, res) => {
    (async () => {
        try {
            let userId = req.params.userId
            if (Number(userId) > 53424 || Number(userId) < 0) {
                res.status(500).send("UserId does not exist")
            } else {
                searchResults = []
                recs = recommend(userId)
                    .then(async (recs) => {
                        let url = `${baseUrlGoogleBooksAPI}volumes?q=`;
                        let urls = [];
                        for (let i = 0; i < recs.length; i++) {
                            let title = recs[i].title.replace(" ", "+").replace('#', '+').replace('.', '').replace('/', '');
                            console.log('recst title space', recs[i].title);
                            urls.push(url + encodeURI(title) + '&langRestrict=en&maxResults=1');
                        }
                        asyncjs.map(urls, function (url, callback) {
                            requestExternalAPI(url, function (err, response, body) {
                                body = JSON.parse(body)
                                if (body.totalItems != 0) {
                                    callback(err, body.items[0]);
                                } else {
                                    callback(err, {})
                                }
                            })
                        }, function (err, books) {
                            if (err) {
                                return err;
                            }
                            res.send({ books })
                        });
                    })
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

module.exports = router