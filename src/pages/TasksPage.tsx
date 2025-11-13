import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { tasksAPI, Task } from '../lib/api';
import TaskCard from '../components/TaskCard';
import Calendar from '../components/Calendar';

interface TasksPageProps {
  onTaskClick: (taskId: string) => void;
  onCreateClick: () => void;
}

export default function TasksPage({ onTaskClick, onCreateClick }: TasksPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, selectedDate, searchQuery, statusFilter]);

  const loadTasks = async () => {
    try {
      const data = await tasksAPI.getAll();
      setTasks(data.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(task => task.due_date === dateStr);
    }

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    setFilteredTasks(filtered);
  };

  const taskDates = tasks
    .filter(task => task.due_date)
    .map(task => task.due_date as string);

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    needsRevision: tasks.filter(t => t.requires_revision).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Task Manager</h1>
            <p className="text-slate-600 mt-1">Organize and track your work</p>
          </div>
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total Tasks</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-500">{stats.todo}</div>
            <div className="text-sm text-slate-600">To Do</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
            <div className="text-sm text-slate-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <div className="text-sm text-slate-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="text-2xl font-bold text-amber-500">{stats.needsRevision}</div>
            <div className="text-sm text-slate-600">Needs Revision</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              taskDates={taskDates}
            />

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Filter by Status</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Tasks' },
                  { value: 'todo', label: 'To Do' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      statusFilter === option.value
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg mb-2">No tasks found</div>
                <p className="text-slate-500 text-sm">
                  {selectedDate || searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first task to get started'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
