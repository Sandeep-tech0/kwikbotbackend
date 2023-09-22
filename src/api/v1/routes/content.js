const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const ContentController = require('../controllers/contentController');

router.get('/', auth, ContentController.getContentByUserId);
router.get('/:id', auth, ContentController.getContentById);
router.post('/', auth, ContentController.addContent);
router.put('/:id', auth, ContentController.updateContent);
router.delete('/:id', auth, ContentController.deleteContent);
router.get('/client/:id', auth, ContentController.AllContentByClientId);

module.exports = router;