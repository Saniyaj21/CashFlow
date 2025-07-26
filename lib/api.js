// API utility functions for frontend
const API_BASE = '/api';

// Helper function to handle API responses
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Something went wrong');
  }
  return response.json();
}

// Entries API
export const entriesAPI = {
  // Get all entries
  getAll: async () => {
    const response = await fetch(`${API_BASE}/entries`);
    return handleResponse(response);
  },

  // Create new entry
  create: async (entryData) => {
    const response = await fetch(`${API_BASE}/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entryData),
    });
    return handleResponse(response);
  },

  // Update entry
  update: async (id, entryData) => {
    const response = await fetch(`${API_BASE}/entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entryData),
    });
    return handleResponse(response);
  },

  // Delete entry
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/entries/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Get single entry
  getById: async (id) => {
    const response = await fetch(`${API_BASE}/entries/${id}`);
    return handleResponse(response);
  },
};

// Categories API
export const categoriesAPI = {
  // Get all categories
  getAll: async () => {
    const response = await fetch(`${API_BASE}/categories`);
    return handleResponse(response);
  },

  // Create new category
  create: async (categoryData) => {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
  },
}; 