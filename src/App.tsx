import { useState } from 'react';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TaskFormPage from './pages/TaskFormPage';

type View =
  | { type: 'list' }
  | { type: 'detail'; taskId: string }
  | { type: 'create' }
  | { type: 'edit'; taskId: string };

function App() {
  const [currentView, setCurrentView] = useState<View>({ type: 'list' });

  return (
    <>
      {currentView.type === 'list' && (
        <TasksPage
          onTaskClick={(taskId) => setCurrentView({ type: 'detail', taskId })}
          onCreateClick={() => setCurrentView({ type: 'create' })}
        />
      )}
      {currentView.type === 'detail' && (
        <TaskDetailPage
          taskId={currentView.taskId}
          onBack={() => setCurrentView({ type: 'list' })}
          onEdit={(taskId) => setCurrentView({ type: 'edit', taskId })}
        />
      )}
      {currentView.type === 'create' && (
        <TaskFormPage
          onBack={() => setCurrentView({ type: 'list' })}
        />
      )}
      {currentView.type === 'edit' && (
        <TaskFormPage
          taskId={currentView.taskId}
          onBack={() => setCurrentView({ type: 'detail', taskId: currentView.taskId })}
        />
      )}
    </>
  );
}

export default App;
