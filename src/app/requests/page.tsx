'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

type RequestItem = {
    id: string;
    title: string;
    description: string | null;
    creatorName: string;
    status: string;
    createdAt: string;
};

export default function RequestsPage() {
    const [items, setItems] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/items?type=WANTED')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setItems(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load requested items', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="container fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="delay-100">リクエスト一覧</h1>
                    <p style={{ color: 'var(--color-text-muted)' }} className="delay-200">
                        みんなの「欲しいもの」リスト。あなたが譲れるものがあるかもしれません。
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="delay-100 fade-in">
                    <Link href="/" style={{ display: 'inline-block' }}>
                        <Button style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                            出品一覧に戻る
                        </Button>
                    </Link>
                    <Link href="/requests/new" style={{ display: 'inline-block' }}>
                        <Button variant="primary">＋ 新規リクエスト</Button>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
                    読み込み中...
                </div>
            ) : items.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <h3 style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>リクエストされているアイテムがありません</h3>
                    <p style={{ marginBottom: '2rem' }}>最初の「欲しいもの」をリクエストしてみましょう！</p>
                    <Link href="/requests/new">
                        <Button>リクエストする</Button>
                    </Link>
                </div>
            ) : (
                <div className="items-grid">
                    {items.map((item, i) => (
                        <Link href={`/items/${item.id}`} key={item.id} className="item-card fade-in" style={{ animationDelay: `${(i % 5 + 1) * 100}ms` }}>
                            <div className="item-card-image-wrap">
                                <div className="item-card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: 'white', fontWeight: 'bold' }}>
                                    WANTED
                                </div>
                            </div>
                            <div className="item-card-content">
                                <h3 className="item-card-title">{item.title}</h3>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {item.description}
                                </div>
                                <div className="item-card-meta">
                                    <span className="item-price" style={{ fontSize: '0.8rem' }}>希望者: {item.creatorName}</span>
                                    <span className={`status-badge ${item.status === 'Available' ? 'status-available' : 'status-resolved'}`}>
                                        {item.status === 'Available' ? '受付中' : '譲渡決定'}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
