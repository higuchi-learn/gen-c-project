import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { getAllRecords, adddata } from '../utils/test';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const [records, setRecords] = useState<unknown[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const data = await getAllRecords();
      setRecords(data ?? []);
    } catch (e) {
      console.error(e);
      setError('データの取得に失敗しました');
    }
  };

  const handleAdd = async () => {
    try {
      await adddata();
      await fetchRecords();
    } catch (e) {
      console.error(e);
      setError('データの追加に失敗しました');
    }
  };

  return (
    <div>
      <h1>Supabase 接続テスト</h1>
      {error && <p>{error}</p>}
      <button onClick={() => void handleAdd()}>「かきくけこ」を追加</button>
      <ul>
        {records.map((r, i) => (
          <li key={i}>{JSON.stringify(r)}</li>
        ))}
      </ul>
    </div>
  );
}
