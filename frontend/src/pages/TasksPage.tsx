import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { taskService, Task } from '../services/tasks';
import { Plus, Edit2, Trash2, Archive, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TasksPage() {
  const { tasks, setTasks, addTask, updateTask, removeTask } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    color: '#3B82F6',
  });
  const [includeInactive, setIncludeInactive] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [includeInactive]);

  const loadTasks = async () => {
    try {
      const data = await taskService.getTasks(includeInactive);
      setTasks(data);
    } catch (error) {
      toast.error('Failed to load tasks');
    }
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        name: task.name,
        category: task.category || '',
        color: task.color,
      });
    } else {
      setEditingTask(null);
      setFormData({ name: '', category: '', color: '#3B82F6' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({ name: '', category: '', color: '#3B82F6' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTask) {
        const updated = await taskService.updateTask(editingTask.id, formData);
        updateTask(editingTask.id, updated);
        toast.success('Task updated successfully');
      } else {
        const created = await taskService.createTask(formData);
        addTask(created);
        toast.success('Task created successfully');
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save task');
    }
  };

  const handleToggleActive = async (task: Task) => {
    try {
      const updated = await taskService.updateTask(task.id, {
        is_active: !task.is_active,
      });
      updateTask(task.id, updated);
      toast.success(updated.is_active ? 'Task activated' : 'Task archived');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Are you sure you want to delete "${task.name}"?`)) {
      return;
    }

    try {
      await taskService.deleteTask(task.id);
      removeTask(task.id);
      toast.success('Task deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete task');
    }
  };

  const activeTasks = tasks.filter((t) => t.is_active);
  const inactiveTasks = tasks.filter((t) => !t.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Show archived</span>
          </label>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            New Task
          </button>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle className="text-green-500" />
          Active Tasks ({activeTasks.length})
        </h2>

        {activeTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No active tasks. Create one to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all border-l-4"
                style={{ borderLeftColor: task.color }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: task.color }}
                    />
                    <h3 className="font-semibold">{task.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenModal(task)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(task)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      title="Archive"
                    >
                      <Archive size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(task)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {task.category && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.category}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Archived Tasks */}
      {includeInactive && inactiveTasks.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Archive className="text-gray-500" />
            Archived Tasks ({inactiveTasks.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-60 hover:opacity-100 transition-all border-l-4"
                style={{ borderLeftColor: task.color }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: task.color }}
                    />
                    <h3 className="font-semibold">{task.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleActive(task)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      title="Restore"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(task)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {task.category && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.category}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingTask ? 'Edit Task' : 'New Task'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Task Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Write blog post"
                  required
                />
              </div>

              <div>
                <label className="label">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  placeholder="e.g., Work, Personal, Study"
                />
              </div>

              <div>
                <label className="label">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="input flex-1"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingTask ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

