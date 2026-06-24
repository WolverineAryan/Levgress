const projectService = require('../services/project.service');
const asyncHandler = require('../middleware/asyncHandler');

const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.user._id, req.body);
  res.status(201).json({
    status: 'success',
    data: { project },
  });
});

const getMyProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getStudentProjects(req.user._id);
  res.status(200).json({
    status: 'success',
    results: projects.length,
    data: { projects },
  });
});

const getProjectById = asyncHandler(async (req, res) => {
  const result = await projectService.getProjectById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.user._id, req.body);
  res.status(200).json({
    status: 'success',
    data: { project },
  });
});

const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id, req.user._id);
  res.status(200).json({
    status: 'success',
    message: 'Project successfully deleted',
  });
});

const addComment = asyncHandler(async (req, res) => {
  const comment = await projectService.addComment(req.params.id, req.user._id, req.body.text);
  res.status(201).json({
    status: 'success',
    data: { comment },
  });
});

const getComments = asyncHandler(async (req, res) => {
  const comments = await projectService.getComments(req.params.id);
  res.status(200).json({
    status: 'success',
    results: comments.length,
    data: { comments },
  });
});

// Staff dashboard route: Get all projects
const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getAllProjects(req.query);
  res.status(200).json({
    status: 'success',
    results: projects.length,
    data: { projects },
  });
});

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addComment,
  getComments,
  getAllProjects,
};
