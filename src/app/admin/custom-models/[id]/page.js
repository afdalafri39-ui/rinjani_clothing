'use client';

import { useState, useEffect, use } from 'react';
import CustomModelForm from '@/components/admin/CustomModelForm';

export default function EditCustomModelPage({ params }) {
  const { id } = use(params);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/custom-models/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setModel(data.model || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data model custom...</div>;
  }

  if (!model) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#C53030' }}>Model custom tidak ditemukan.</div>;
  }

  return <CustomModelForm initialData={model} isEdit={true} />;
}
