const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');


router.use(authMiddleware);


router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.userId }).sort({ createdAt: -1 });

    // Attach task count to each project
    const projectsWithCount = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ projectId: project._id });
        return {
          ...project.toObject(),
          taskCount,
        };
      })
    );

    res.json(projectsWithCount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});


router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const project = new Project({
        name: req.body.name,
        description: req.body.description || '',
        owner: req.user.userId,
      });

      await project.save();
      res.status(201).json({ ...project.toObject(), taskCount: 0 });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error creating project' });
    }
  }
);


router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ projectId: project._id }).sort({ createdAt: -1 });
    res.json({ ...project.toObject(), tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching project' });
  }
});


router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
    body('description').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const project = await Project.findOneAndUpdate(
        { _id: req.params.id, owner: req.user.userId },
        { $set: { name: req.body.name, description: req.body.description } },
        { new: true }
      );

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.json(project);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating project' });
    }
  }
);


router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Also delete all tasks for this project
    await Task.deleteMany({ projectId: req.params.id });

    res.json({ message: 'Project and its tasks deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting project' });
  }
});


router.post(
  '/:id/tasks',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('description').optional().trim(),
    body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
    body('assignedTo').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const project = await Project.findOne({ _id: req.params.id, owner: req.user.userId });
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const task = new Task({
        projectId: req.params.id,
        title: req.body.title,
        description: req.body.description || '',
        status: req.body.status || 'todo',
        assignedTo: req.body.assignedTo || '',
      });

      await task.save();
      res.status(201).json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error creating task' });
    }
  }
);

module.exports = router;
