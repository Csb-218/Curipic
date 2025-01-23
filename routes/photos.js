var express = require('express');
var router = express.Router();

const {searchPhotos,savePhoto} = require("../controllers/photosController")

router.post('/',savePhoto);

router.get('/search', searchPhotos)

router.post('/:photoId/tags', searchPhotos)

module.exports = router;