import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { DURATIONS, BUFFER_TIMES, QUESTION_TYPES } from '../../lib/constants';

export default function EventTypeForm({ isOpen, onClose, onSubmit, editingEvent, schedules = [] }) {
  const [form, setForm] = useState({
    title: '', slug: '', description: '', duration: 30,
    buffer_time: 0, custom_questions: [], schedule_id: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingEvent) {
      setForm({
        title: editingEvent.title,
        slug: editingEvent.slug,
        description: editingEvent.description || '',
        duration: editingEvent.duration,
        buffer_time: editingEvent.buffer_time || 0,
        custom_questions: editingEvent.custom_questions || [],
        schedule_id: editingEvent.schedule_id || '',
      });
    } else {
      setForm({ title: '', slug: '', description: '', duration: 30, buffer_time: 0, custom_questions: [], schedule_id: '' });
    }
    setError('');
  }, [editingEvent, isOpen]);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm(prev => ({
      ...prev,
      title,
      slug: editingEvent ? prev.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  const addQuestion = () => {
    setForm(prev => ({
      ...prev,
      custom_questions: [...prev.custom_questions, { label: '', type: 'text', required: false }],
    }));
  };

  const updateQuestion = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      custom_questions: prev.custom_questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const removeQuestion = (index) => {
    setForm(prev => ({
      ...prev,
      custom_questions: prev.custom_questions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.join(', ') || 'Something went wrong');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingEvent ? 'Edit Event Type' : 'New Event Type'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        <Input
          label="Title"
          value={form.title}
          onChange={handleTitleChange}
          placeholder="30 Minute Meeting"
          required
        />
        <Input
          label="Slug"
          value={form.slug}
          onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
          placeholder="30min-meeting"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            rows={2}
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="A short description of this event type"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, duration: d }))}
                className={`px-3 py-1.5 text-sm rounded-md border ${
                  form.duration === d
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        {/* Buffer Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Buffer Time (between bookings)</label>
          <div className="flex flex-wrap gap-2">
            {BUFFER_TIMES.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, buffer_time: b }))}
                className={`px-3 py-1.5 text-sm rounded-md border ${
                  form.buffer_time === b
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {b === 0 ? 'None' : `${b}m`}
              </button>
            ))}
          </div>
        </div>

        {/* Availability Schedule */}
        {schedules.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability Schedule</label>
            <select
              value={form.schedule_id}
              onChange={(e) => setForm(prev => ({ ...prev, schedule_id: e.target.value ? Number(e.target.value) : '' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Default schedule</option>
              {schedules.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.is_default ? ' (default)' : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Choose which availability schedule to use for this event type.</p>
          </div>
        )}

        {/* Custom Questions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Custom Questions</label>
          <div className="space-y-3">
            {form.custom_questions.map((q, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 p-3 bg-gray-50 rounded-md">
                <input
                  type="text"
                  value={q.label}
                  onChange={(e) => updateQuestion(i, 'label', e.target.value)}
                  placeholder="Question text..."
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(i, 'type', e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {QUESTION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQuestion(i, 'required', e.target.checked)}
                      className="rounded"
                    />
                    Required
                  </label>
                  <button type="button" onClick={() => removeQuestion(i)} className="p-1 text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addQuestion}
            className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={14} /> Add question
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{editingEvent ? 'Save Changes' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}
