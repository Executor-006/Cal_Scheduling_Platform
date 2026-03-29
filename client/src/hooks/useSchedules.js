import { useState, useEffect, useCallback } from 'react';
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  updateScheduleAvailability,
} from '../lib/api';

export default function useSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSchedules();
      setSchedules(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (name) => {
    const schedule = await createSchedule({ name });
    await fetch();
    return schedule;
  };

  const update = async (id, data) => {
    const schedule = await updateSchedule(id, data);
    await fetch();
    return schedule;
  };

  const remove = async (id) => {
    await deleteSchedule(id);
    await fetch();
  };

  const saveAvailability = async (id, availabilityData) => {
    const schedule = await updateScheduleAvailability(id, availabilityData);
    await fetch();
    return schedule;
  };

  return { schedules, loading, error, fetch, create, update, remove, saveAvailability };
}
