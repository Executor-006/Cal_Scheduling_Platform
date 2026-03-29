import { useState, useEffect, useCallback } from 'react';
import { getDateOverrides, createDateOverride, updateDateOverride, deleteDateOverride } from '../lib/api';

export default function useDateOverrides() {
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDateOverrides();
      setOverrides(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load date overrides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (data) => {
    const override = await createDateOverride(data);
    await fetch();
    return override;
  };

  const update = async (id, data) => {
    const override = await updateDateOverride(id, data);
    await fetch();
    return override;
  };

  const remove = async (id) => {
    await deleteDateOverride(id);
    await fetch();
  };

  return { overrides, loading, error, fetch, create, update, remove };
}
