import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { Task } from '../lib/api';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const statusConfig = {
  todo: { icon: Circle, label: 'To Do', color: 'text-slate-500' },
  in_progress: { icon: Clock, label: 'In Progress', color: 'text-blue-500' },
  completed: { icon: CheckCircle2, label: 'Completed', color: 'text-green-500' },
};

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const StatusIcon = statusConfig[task.status].icon;
  const statusColor = statusConfig[task.status].color;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 cursor-pointer border border-slate-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <StatusIcon className={`w-5 h-5 ${statusColor} flex-shrink-0`} />
            <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
              {task.title}
            </h3>
          </div>
          {task.description && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className={`px-2 py-1 rounded-full ${statusColor} bg-slate-50 font-medium`}>
              {statusConfig[task.status].label}
            </span>
            {task.due_date && (
              <span className="flex items-center gap-1">
                📅 {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        {task.requires_revision && (
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}
