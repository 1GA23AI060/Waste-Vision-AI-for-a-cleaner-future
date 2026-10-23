// Dynamic backend URL configuration for Vercel -> Railway deployment
const RAW_BACKEND_URL = import.meta.env.VITE_API_URL || '';
export const BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, '');
export const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

/**
 * Resolves static uploaded image paths to full Railway URLs in production,
 * or local relative paths in development.
 */
export function getReportImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return BACKEND_URL ? `${BACKEND_URL}${cleanPath}` : cleanPath;
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch statistics');
  return res.json();
}

export async function fetchReports(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
  if (filters.search) params.append('search', filters.search);
  if (filters.sort_by) params.append('sort_by', filters.sort_by);

  const res = await fetch(`${API_BASE}/reports?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function fetchReportById(reportId) {
  const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(reportId)}`);
  if (!res.ok) throw new Error(`Report ${reportId} not found`);
  return res.json();
}

export async function submitReport(formData) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    body: formData, // FormData handles multipart/form-data boundary
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit report');
  }
  return res.json();
}

export async function updateReport(reportId, updateData, actor = 'Admin Dispatcher') {
  const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(reportId)}?actor=${encodeURIComponent(actor)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update report');
  }
  return res.json();
}

export async function calculatePriorityPreview(data) {
  const res = await fetch(`${API_BASE}/priority/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to calculate priority preview');
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/demo/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return res.json();
}
