'use client';

import { useState, useEffect, use } from 'react';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data produk...</div>;
  }

  if (!product) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#C53030' }}>Produk tidak ditemukan.</div>;
  }

  return <ProductForm initialData={product} isEdit={true} />;
}
