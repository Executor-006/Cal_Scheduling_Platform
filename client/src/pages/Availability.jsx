import { useState } from 'react';
import { Plus, Star, Trash2, Pencil } from 'lucide-react';
import Shell from '../components/layout/Shell';
import TopBar from '../components/layout/TopBar';
import AvailabilityForm from '../components/availability/AvailabilityForm';
import DateOverrideList from '../components/availability/DateOverrideList';
import DateOverrideForm from '../components/availability/DateOverrideForm';
import Button from '../components/ui/Button';
import useSchedules from '../hooks/useSchedules';
import useDateOverrides from '../hooks/useDateOverrides';

export default function Availability() {
  const { schedules, loading, create, update, remove, saveAvailability } = useSchedules();
  const { overrides, loading: overridesLoading, create: createOverride, update: updateOverride, remove: removeOverride } = useDateOverrides();
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [editingOverride, setEditingOverride] = useState(null);
  const [creatingSchedule, setCreatingSchedule] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Auto-select the first schedule once loaded
  const activeSchedule = schedules.find(s => s.id === selectedScheduleId) || schedules[0];
  const activeScheduleId = activeSchedule?.id;

  const handleCreateSchedule = async () => {
    if (!newScheduleName.trim()) return;
    try {
      const created = await create(newScheduleName.trim());
      setSelectedScheduleId(created.id);
      setNewScheduleName('');
      setCreatingSchedule(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create schedule');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete this schedule? Event types using it will fall back to the default schedule.')) return;
    try {
      await remove(id);
      setSelectedScheduleId(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete schedule');
    }
  };

  const handleSetDefault = async (id) => {
    const schedule = schedules.find(s => s.id === id);
    if (!schedule || schedule.is_default) return;
    try {
      await update(id, { name: schedule.name, is_default: true });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update schedule');
    }
  };

  const handleRename = async (id) => {
    if (!renameValue.trim()) return;
    const schedule = schedules.find(s => s.id === id);
    try {
      await update(id, { name: renameValue.trim(), is_default: schedule.is_default });
      setRenamingId(null);
      setRenameValue('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to rename schedule');
    }
  };

  const handleSaveAvailability = async (availabilityData) => {
    if (!activeScheduleId) return;
    await saveAvailability(activeScheduleId, availabilityData);
  };

  const handleOverrideSave = async (data) => {
    if (editingOverride) {
      await updateOverride(editingOverride.id, data);
    } else {
      await createOverride(data);
    }
  };

  const handleOverrideDelete = async (id) => {
    if (!window.confirm('Remove this date override?')) return;
    await removeOverride(id);
  };

  return (
    <Shell>
      <TopBar title="Availability" subtitle="Configure times when you are available for bookings." />

      {/* Schedule Tabs */}
      {!loading && schedules.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center">
                {renamingId === schedule.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename(schedule.id)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 w-32 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      autoFocus
                    />
                    <button onClick={() => handleRename(schedule.id)} className="text-xs text-gray-900 font-medium px-1">Save</button>
                    <button onClick={() => setRenamingId(null)} className="text-xs text-gray-400 px-1">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedScheduleId(schedule.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      activeScheduleId === schedule.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {schedule.is_default && <Star size={12} className={activeScheduleId === schedule.id ? 'text-yellow-300' : 'text-yellow-500'} />}
                    {schedule.name}
                  </button>
                )}
              </div>
            ))}

            {creatingSchedule ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newScheduleName}
                  onChange={(e) => setNewScheduleName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateSchedule()}
                  placeholder="Schedule name"
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 w-36 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  autoFocus
                />
                <button onClick={handleCreateSchedule} className="text-xs text-gray-900 font-medium px-1">Add</button>
                <button onClick={() => { setCreatingSchedule(false); setNewScheduleName(''); }} className="text-xs text-gray-400 px-1">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setCreatingSchedule(true)}
                className="px-2.5 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 border border-dashed border-gray-300 flex items-center gap-1"
              >
                <Plus size={14} /> New
              </button>
            )}
          </div>

          {/* Schedule actions */}
          {activeSchedule && (
            <div className="flex items-center gap-3 mt-2 text-xs">
              {!activeSchedule.is_default && (
                <button
                  onClick={() => handleSetDefault(activeScheduleId)}
                  className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <Star size={12} /> Set as default
                </button>
              )}
              <button
                onClick={() => { setRenamingId(activeScheduleId); setRenameValue(activeSchedule.name); }}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <Pencil size={12} /> Rename
              </button>
              {!activeSchedule.is_default && (
                <button
                  onClick={() => handleDeleteSchedule(activeScheduleId)}
                  className="text-gray-500 hover:text-red-500 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Weekly Availability Form */}
      {activeSchedule && (
        <AvailabilityForm
          key={activeScheduleId}
          availability={activeSchedule.availability || []}
          onSave={handleSaveAvailability}
          loading={loading}
        />
      )}

      {loading && !schedules.length && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Date Overrides Section */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Date Overrides</h3>
            <p className="text-xs text-gray-500 mt-0.5">Block specific dates or set custom hours that override your weekly schedule.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setEditingOverride(null); setShowOverrideForm(true); }}
          >
            <Plus size={14} className="mr-1" /> Add Override
          </Button>
        </div>

        {overridesLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : overrides.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No date overrides configured.</p>
        ) : (
          <DateOverrideList
            overrides={overrides}
            onEdit={(o) => { setEditingOverride(o); setShowOverrideForm(true); }}
            onDelete={handleOverrideDelete}
          />
        )}
      </div>

      {/* Date Override Modal */}
      {showOverrideForm && (
        <DateOverrideForm
          override={editingOverride}
          onSave={handleOverrideSave}
          onClose={() => { setShowOverrideForm(false); setEditingOverride(null); }}
        />
      )}
    </Shell>
  );
}
