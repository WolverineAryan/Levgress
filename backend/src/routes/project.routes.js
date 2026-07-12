const express = require('express');
const projectController = require('../controllers/project.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes here require authentication
router.use(protect);

// Student project CRUD
router.post('/', restrictTo('STUDENT'), projectController.createProject);
router.get('/my-projects', restrictTo('STUDENT'), projectController.getMyProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', restrictTo('STUDENT'), projectController.updateProject);
router.delete('/:id', restrictTo('STUDENT'), projectController.deleteProject);

// Project Comments
router.post('/:id/comments', projectController.addComment);
router.get('/:id/comments', projectController.getComments);

// Fetch all projects across students (Open to all authenticated roles for showcase)
router.get('/', projectController.getAllProjects);

// Like/Unlike project
router.post('/:id/like', projectController.likeProject);

module.exports = router;
