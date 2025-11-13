const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://unshippable-edith-centrolecithal.ngrok-free.dev/api';

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  requires_revision: boolean | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
};

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export const tasksAPI = {
  async getAll(): Promise<Task[]> {
    return fetchAPI('/tasks');
  },

  async getById(id: string): Promise<Task> {
    return fetchAPI(`/tasks/${id}`);
  },

  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    return fetchAPI('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  async update(id: string, task: Partial<Task>): Promise<Task> {
    return fetchAPI(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },

  async delete(id: string): Promise<void> {
    await fetchAPI(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

export const commentsAPI = {
  async getByTaskId(taskId: string): Promise<Comment[]> {
    return fetchAPI(`/tasks/${taskId}/comments`);
  },

  async create(comment: { task_id: string; content: string }): Promise<Comment> {
    return fetchAPI(`/tasks/${comment.task_id}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  },

  async delete(taskId: string, commentId: string): Promise<void> {
    await fetchAPI(`/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};
