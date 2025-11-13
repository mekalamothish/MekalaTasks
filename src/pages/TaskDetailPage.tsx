import { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Trash2, CheckCircle2, Circle, Clock, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { tasksAPI, commentsAPI, Task, Comment } from '../lib/api';

interface TaskDetailPageProps {
  taskId: string;
  onBack: () => void;
  onEdit: (taskId: string) => void;
}

const statusConfig = {
  todo: { icon: Circle, label: 'To Do', color: 'text-slate-500', bg: 'bg-slate-100' },
  in_progress: { icon: Clock, label: 'In Progress', color: 'text-blue-500', bg: 'bg-blue-100' },
  completed: { icon: CheckCircle2, label: 'Completed', color: 'text-green-500', bg: 'bg-green-100' },
};

export default function TaskDetailPage({ taskId, onBack, onEdit }: TaskDetailPageProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTask();
    loadComments();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const data = await tasksAPI.getById(taskId);
      setTask(data);
    } catch (error) {
      console.error('Error loading task:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await commentsAPI.getByTaskId(taskId);
      setComments(data.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await commentsAPI.create({ task_id: taskId, content: newComment.trim() });
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsAPI.delete(taskId, commentId);
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleStatusChange = async (newStatus: Task['status']) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      loadTask();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRevisionToggle = async () => {
    if (!task) return;
    try {
      await tasksAPI.update(taskId, { requires_revision: !task.requires_revision });
      loadTask();
    } catch (error) {
      console.error('Error updating revision status:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await tasksAPI.delete(taskId);
      onBack();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading task...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-900 text-xl mb-2">Task not found</div>
          <button onClick={onBack} className="text-blue-500 hover:text-blue-600">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[task.status].icon;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to tasks
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{task.title}</h1>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                {task.due_date && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      Due {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(taskId)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-slate-700 mb-6 whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <div className="flex gap-2">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(key as Task['status'])}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all ${
                      task.status === key
                        ? `${config.color} ${config.bg} border-current font-medium`
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <config.icon className="w-4 h-4" />
                    <span className="text-sm">{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Revision Required</label>
              <button
                onClick={handleRevisionToggle}
                className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 transition-all ${
                  task.requires_revision
                    ? 'bg-amber-100 border-amber-500 text-amber-700 font-medium'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  {task.requires_revision ? 'Needs Revision' : 'No Revision Needed'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Comments</h2>

          <div className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment about what you did for this task..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Comment
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No comments yet. Add the first comment to track your progress.
              </div>
            ) : (
              comments.map(comment => (
                <div
                  key={comment.id}
                  className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
