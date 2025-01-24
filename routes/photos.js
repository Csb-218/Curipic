var express = require('express');
var router = express.Router();

const {searchPhotos,savePhoto,changePhotoTags,searchByTag} = require("../controllers/photosController")

router.post('/',savePhoto);

router.get('/search', searchPhotos)

router.post('/:photoId/tags', changePhotoTags)

router.get('/tag/search',searchByTag)

module.exports = router;