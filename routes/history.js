var express = require('express');
var router = express.Router();

const {getSearchHistory} = require("../controllers/searchHistoryController")


router.get('/', getSearchHistory);

module.exports = router;