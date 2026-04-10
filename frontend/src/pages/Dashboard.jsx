import React, { useState, useEffect } from 'react';
import { LogOut, Trash2, CheckCircle, Circle, Plus, Search } from 'lucide-react';
import api from '../api/axiosConfig';

const Dashboard = ({ setAuth }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and Sorts
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'active'
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'oldest'

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Could not fetch tasks');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await api.post('/tasks', { title: newTask });
      setTasks([res.data, ...tasks]);
      setNewTask('');
    } catch (err) {
      console.error(err);
      setError('Error adding task');
    }
  };

  const toggleTask = async (id, currentStatus) => {
    try {
      const res = await api.put(`/tasks/${id}`, { is_completed: !currentStatus });
      setTasks(tasks.map(task => task._id === id ? res.data : task));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Sort Logic
  let displayTasks = tasks.filter(task => {
    if (filter === 'completed') return task.is_completed;
    if (filter === 'active') return !task.is_completed;
    return true; // 'all'
  }).filter(task => 
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  displayTasks = displayTasks.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="container">
      <div className="header-nav">
        <div>
          <h1 className="heading" style={{ margin: 0, textAlign: 'left' }}>Your Tasks</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Stay productive</p>
        </div>
        <button className="btn btn-danger flex-between" onClick={handleLogout} style={{gap: '0.5rem'}}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={addTask} className="flex-between" style={{ gap: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="What needs to be done?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            style={{ margin: 0 }}
          />
          <button type="submit" className="btn btn-primary flex-between" style={{ gap: '0.5rem' }}>
            <Plus size={18} /> Add
          </button>
        </form>
      </div>

      <div className="filter-bar">
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <select 
          className="form-input" 
          style={{ width: 'auto' }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Tasks</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>

        <select 
          className="form-input" 
          style={{ width: 'auto' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="recent">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div className="task-list">
        {loading ? (
          <div className="spinner"></div>
        ) : displayTasks.length === 0 ? (
           <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
             No tasks found.
           </p>
        ) : (
          displayTasks.map(task => (
            <div key={task._id} className={`task-item ${task.is_completed ? 'completed' : ''}`}>
              <div className="task-content" onClick={() => toggleTask(task._id, task.is_completed)}>
                {task.is_completed ? (
                  <CheckCircle className="checkbox" color="var(--success)" />
                ) : (
                  <Circle className="checkbox" color="var(--text-secondary)" />
                )}
                <div>
                  <div className="task-title">{task.title}</div>
                  <div className="task-date">
                    {new Date(task.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-danger" 
                onClick={() => deleteTask(task._id)}
                title="Delete task"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
