import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';

export default function DateOverrideForm({ override, onSave, onClose }) {
  const [date, setDate] = useState(override?.override_date?.split('T')[0] || '');
  const [isBlocked, setIsBlocked] = useState(override?.is_blocked ?? true);
  const [startTime, setStartTime] = useState(override?.start_time?.slice(0, 5) || '09:00');
  const [endTime, setEndTime] = useState(override?.end_time?.slice(0, 5) || '17:00');
  const [label, setLabel] = useState(override?.label || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) { setError('Please select a date'); return; }

    setSaving(true);
    setError('');
    try {
      await onSave({
        override_date: date,
        is_blocked: isBlocked,
        start_time: isBlocked ? null : startTime,
        end_time: isBlocked ? null : endTime,
        label: label.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save override');
    } finally {
      setSaving(false);
    }
  };

  // Get today's date string for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl max-h-[85vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            {override ? 'Edit Date Override' : 'Add Date Override'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              disabled={!!override}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label (optional)</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Holiday, Vacation, Doctor appointment"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Override Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Override Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsBlocked(true)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  isBlocked
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Block entire day
              </button>
              <button
                type="button"
                onClick={() => setIsBlocked(false)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  !isBlocked
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Custom hours
              </button>
            </div>
          </div>

          {/* Custom Hours */}
          {!isBlocked && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : override ? 'Update' : 'Add Override'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
