const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);


router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Task title cannot be empty'),
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
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      // Verify the task belongs to a project owned by this user
      const project = await Project.findOne({ _id: task.projectId, owner: req.user.userId });
      if (!project) return res.status(403).json({ message: 'Not authorized' });

      const updated = await Task.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            title: req.body.title ?? task.title,
            description: req.body.description ?? task.description,
            status: req.body.status ?? task.status,
            assignedTo: req.body.assignedTo ?? task.assignedTo,
          },
        },
        { new: true }
      );

      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating task' });
    }
  }
);


router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findOne({ _id: task.projectId, owner: req.user.userId });
    if (!project) return res.status(403).json({ message: 'Not authorized' });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

module.exports = router;
