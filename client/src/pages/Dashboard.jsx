import { useState } from 'react';
import { Plus } from 'lucide-react';
import Shell from '../components/layout/Shell';
import TopBar from '../components/layout/TopBar';
import EventTypeList from '../components/event-types/EventTypeList';
import EventTypeForm from '../components/event-types/EventTypeForm';
import Button from '../components/ui/Button';
import useEventTypes from '../hooks/useEventTypes';
import useSchedules from '../hooks/useSchedules';

export default function Dashboard() {
  const { eventTypes, loading, create, update, toggle, remove } = useEventTypes();
  const { schedules } = useSchedules();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleEdit = (eventType) => {
    setEditing(eventType);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (data) => {
    if (editing) {
      await update(editing.id, { ...data, is_active: editing.is_active });
    } else {
      await create(data);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event type?')) {
      await remove(id);
    }
  };

  return (
    <Shell>
      <TopBar
        title="Event Types"
        subtitle="Create and manage event types for people to book."
      >
        <Button onClick={() => setFormOpen(true)} size="md">
          <Plus size={16} className="mr-1.5" />
          New
        </Button>
      </TopBar>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-md border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-40 mb-2" />
              <div className="h-3 bg-gray-50 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <EventTypeList
          eventTypes={eventTypes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={toggle}
        />
      )}

      <EventTypeForm
        isOpen={formOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        editingEvent={editing}
        schedules={schedules}
      />
    </Shell>
  );
}
