const express = require('express');
const router = express.Router();

const wzCategories = require('../data/wzCategories');

router.get('/', (req, res) => {
  res.json(wzCategories);
});

module.exports = router;
