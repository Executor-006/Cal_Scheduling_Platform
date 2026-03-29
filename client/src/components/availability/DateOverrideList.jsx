import { CalendarOff, Clock, Pencil, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';

export default function DateOverrideList({ overrides, onEdit, onDelete }) {
  if (!overrides.length) return null;

  // Filter out past overrides for display
  const today = dayjs().format('YYYY-MM-DD');
  const futureOverrides = overrides.filter(o => {
    const d = o.override_date.split('T')[0];
    return d >= today;
  });

  if (!futureOverrides.length) return null;

  return (
    <div className="space-y-2">
      {futureOverrides.map((override) => {
        const dateStr = dayjs(override.override_date).format('ddd, MMM D, YYYY');
        return (
          <div
            key={override.id}
            className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                override.is_blocked ? 'bg-red-50' : 'bg-blue-50'
              }`}>
                {override.is_blocked
                  ? <CalendarOff size={16} className="text-red-500" />
                  : <Clock size={16} className="text-blue-500" />
                }
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {dateStr}
                  {override.label && (
                    <span className="ml-2 text-gray-500 font-normal">— {override.label}</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {override.is_blocked
                    ? 'Blocked — No bookings'
                    : `Custom hours: ${override.start_time?.slice(0, 5)} – ${override.end_time?.slice(0, 5)}`
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <button
                onClick={() => onEdit(override)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(override.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
