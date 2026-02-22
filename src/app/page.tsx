'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

type Item = {
  id: string;
  title: string;
  minPrice: number;
  imageUrls: string[];
  status: string;
  deadline: string;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load items', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="delay-100">出品アイテム一覧</h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="delay-200">
            いらなくなったものを譲り合いましょう。
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="delay-100 fade-in">
          <Link href="/requests" style={{ display: 'inline-block' }}>
            <Button style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
              リクエスト一覧
            </Button>
          </Link>
          <Link href="/items/new" style={{ display: 'inline-block' }}>
            <Button variant="primary">＋ 新規出品</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
          読み込み中...
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>出品されているアイテムがありません</h3>
          <p style={{ marginBottom: '2rem' }}>最初のアイテムを出品してみましょう！</p>
          <Link href="/items/new">
            <Button>出品する</Button>
          </Link>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item, i) => (
            <Link href={`/items/${item.id}`} key={item.id} className="item-card fade-in" style={{ animationDelay: `${(i % 5 + 1) * 100}ms` }}>
              <div className="item-card-image-wrap">
                {item.imageUrls && item.imageUrls.length > 0 ? (
                  <img src={item.imageUrls[0]} alt={item.title} className="item-card-image" />
                ) : (
                  <div className="item-card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                    画像なし
                  </div>
                )}
              </div>
              <div className="item-card-content">
                <h3 className="item-card-title">{item.title}</h3>
                <div className="item-card-meta">
                  <span className="item-price">¥{item.minPrice.toLocaleString()}〜</span>
                  <span className={`status-badge ${item.status === 'Available' ? 'status-available' : 'status-resolved'}`}>
                    {item.status === 'Available' ? '受付中' : '譲渡決定'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  期限: {new Date(item.deadline).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
