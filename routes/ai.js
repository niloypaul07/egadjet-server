const express = require('express');
const { chatWithAssistant, chatWithAssistantStream } = require('../controllers/aiController');

const router = express.Router();

router.post('/chat', chatWithAssistant);
router.post('/chat/stream', chatWithAssistantStream);

module.exports = router;
