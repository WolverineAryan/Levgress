const express = require('express');
const postController = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', postController.createPost);
router.get('/', postController.getAllPosts);
router.post('/:id/like', postController.likePost);
router.post('/:id/comments', postController.addComment);
router.delete('/:id', postController.deletePost);

module.exports = router;
