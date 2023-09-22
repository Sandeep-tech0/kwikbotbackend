const express = require('express');
const router = express.Router();
const path = require("path");
var multer = require('multer');

const auth = require('../middlewares/auth');
const ApiError = require('../middlewares/apiError');
const Response = require('../middlewares/response');

require('dotenv').config();
const FILE_BASE_URL = process.env.FILE_BASE_URL;

function getRandomInt() {
    var min = 0;
    var max = 25;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rand() {
    var alphs = "abcdefghijklmnopqrstuvwxyz"
    var random = ""
    for (let i = 0; i < 6; i++) {
        random += alphs[getRandomInt()]
    }
    return random;
}

var fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, getPath(req.query.for));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + rand() + path.extname(file.originalname)) //Appending file extention like .jpg
    }
});


var documents = multer({
    storage: fileStorage,
    fileFilter: function (req, file, cb) {
        var ext = path.extname(file.originalname);
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.pdf'
            && ext !== '.doc' && ext !== '.docx' && ext !== '.xls' && ext !== '.xlsx'
            && ext !== '.ppt' && ext !== '.pptx') {
            return cb(ApiError.badRequest('Only JPG, PNG, PDF, Doc, Excel & PPT files are allowed'));
        }
        cb(null, true)
    }
}).single('files');

//Controller with route
router.post('/', function (req, res) {
    try {
        documents(req, res, function (err) {
            if (err) {
                return Response.error(res, err);
            }

            const file = req.file;

            if (!file || file === undefined)
                return Response.error(res, ApiError.badRequest('File is required'));

            //try {
            var filePath = file.filename;
            var [filename, extension] = filePath.split('.').reduce((acc, val, i, arr) =>
                (i == arr.length - 1) ? [acc[0].substring(1), val] : [[acc[0], val].join('.')], []);

            const fileNameWithPath = `${getPath(req.query.for)
                .replace(/.*(?=uploads)/i, "/")
                .replace("uploads", "resources")
                .replace(/\\/g, "/")}${filePath}`;

            var result = {
                filePath: fileNameWithPath,
                original_url: (FILE_BASE_URL + fileNameWithPath),
                fileType: extension,
                fileSize: file.size
            }
            return Response.success(res, 'File successfully Uploaded', result);
        });
    } catch (err) {
        if (err instanceof ApiError)
            return Response.error(res, err);

        return Response.error(res, ApiError.internal(err));
    }
})

function getPath(storageType) {

    if (storageType === 'profile')
        return path.join(__dirname, "../../../../uploads/profile/");

}

module.exports = router;