const express = require('express');
const router = express.Router();
const { analyze, execute, chatWithDiagram } = require('../controllers/assistantController');


router.post('/analyze', analyze);
router.post('/execute', execute);
router.post('/chat/:diagramId', chatWithDiagram);

module.exports = router;