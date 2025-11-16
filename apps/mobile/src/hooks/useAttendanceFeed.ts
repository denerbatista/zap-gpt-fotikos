import { useCallback, useEffect, useState } from 'react';
import { AttendanceRecord, fetchAttendanceFeed } from '@/services/api';

export function useAttendanceFeed(pollInterval = 10000) {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const records = await fetchAttendanceFeed();
      setData(records);
      setError(null);
    } catch (err) {
      setError('Não foi possível sincronizar o painel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, pollInterval);
    return () => clearInterval(id);
  }, [load, pollInterval]);

  return { data, loading, error, reload: load };
}
