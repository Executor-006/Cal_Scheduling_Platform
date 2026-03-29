import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Current user
export const getCurrentUser = () => api.get('/me').then(r => r.data);

// Event Types
export const getEventTypes = () => api.get('/event-types').then(r => r.data);
export const createEventType = (data) => api.post('/event-types', data).then(r => r.data);
export const updateEventType = (id, data) => api.put(`/event-types/${id}`, data).then(r => r.data);
export const toggleEventType = (id, is_active) => api.patch(`/event-types/${id}/toggle`, { is_active }).then(r => r.data);
export const deleteEventType = (id) => api.delete(`/event-types/${id}`).then(r => r.data);

// Availability
export const getAvailability = () => api.get('/availability').then(r => r.data);
export const updateAvailability = (schedules) => api.put('/availability', { schedules }).then(r => r.data);

// Bookings
export const getBookings = (status) => api.get(`/bookings?status=${status}`).then(r => r.data);
export const getBookingById = (id) => api.get(`/bookings/${id}`).then(r => r.data);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`).then(r => r.data);
export const rescheduleBooking = (id, data) => api.post(`/bookings/${id}/reschedule`, data).then(r => r.data);

// Schedules
export const getSchedules = () => api.get('/schedules').then(r => r.data);
export const createSchedule = (data) => api.post('/schedules', data).then(r => r.data);
export const updateSchedule = (id, data) => api.put(`/schedules/${id}`, data).then(r => r.data);
export const deleteSchedule = (id) => api.delete(`/schedules/${id}`).then(r => r.data);
export const updateScheduleAvailability = (id, schedules) =>
  api.put(`/schedules/${id}/availability`, { schedules }).then(r => r.data);

// Date Overrides
export const getDateOverrides = () => api.get('/date-overrides').then(r => r.data);
export const createDateOverride = (data) => api.post('/date-overrides', data).then(r => r.data);
export const updateDateOverride = (id, data) => api.put(`/date-overrides/${id}`, data).then(r => r.data);
export const deleteDateOverride = (id) => api.delete(`/date-overrides/${id}`).then(r => r.data);

// Public
export const getPublicEventInfo = (username, slug) => api.get(`/public/${username}/${slug}`).then(r => r.data);
export const getPublicSlots = (username, slug, date, timezone) =>
  api.get(`/public/${username}/${slug}/slots?date=${date}&timezone=${timezone}`).then(r => r.data);
export const createPublicBooking = (username, slug, data) =>
  api.post(`/public/${username}/${slug}/book`, data).then(r => r.data);

export default api;
