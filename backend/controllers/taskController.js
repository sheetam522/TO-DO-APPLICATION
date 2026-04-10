const Task = require('../models/Task');

// @route   GET /api/tasks
// @desc    Get all tasks for logged in user
const getTasks = async (req, res) => {
  try {
    // Sort tasks by created_at descending
    const tasks = await Task.find({ userId: req.user.id }).sort({ created_at: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   POST /api/tasks
// @desc    Create a new task
const createTask = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const newTask = new Task({
      title,
      userId: req.user.id
    });

    const task = await newTask.save();
    res.status(201).json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   PUT /api/tasks/:id
// @desc    Update task
const updateTask = async (req, res) => {
  try {
    const { title, is_completed } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Make sure user owns task
    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedTaskFields = {};
    if (title !== undefined) updatedTaskFields.title = title;
    if (is_completed !== undefined) updatedTaskFields.is_completed = is_completed;

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updatedTaskFields },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Make sure user owns task
    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
