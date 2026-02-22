'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export default function NewRequest() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        // 4桁のパスワードの簡易バリデーション
        const password = formData.get('editPassword') as string;
        if (!/^\d{4}$/.test(password)) {
            setError('パスワードは4桁の半角数字で入力してください。');
            setLoading(false);
            return;
        }

        const description = formData.get('description') as string;
        const generatedTitle = description.length > 20 ? description.substring(0, 20) + '...' : description;
        // 30日後の日付を自動設定
        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + 30);

        const data = {
            type: 'WANTED',
            title: generatedTitle || '欲しいものリクエスト',
            description: description,
            minPrice: 0,
            deadline: deadlineDate.toISOString().split('T')[0],
            creatorName: formData.get('creatorName'),
            editPassword: password,
            imageUrls: [] // リクエストの場合は画像をサポートしない
        };

        try {
            const res = await fetch('/api/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'リクエストに失敗しました');
            }

            router.push('/requests');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'エラーが発生しました');
            setLoading(false);
        }
    };

    return (
        <div className="container fade-in">
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>欲しいものをリクエストする</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    誰かに譲ってもらいたいものをリクエストできます。
                </p>

                <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
                    {error && (
                        <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <Textarea
                        label="どんなものが欲しいですか？ *"
                        name="description"
                        required
                        placeholder="例: このくらいのサイズのソファが欲しい、不要になったフライパンがあれば譲ってください、など自由にご記入ください。"
                        style={{ minHeight: '150px' }}
                    />

                    <Input
                        label="希望者名（LINEの名前など） *"
                        name="creatorName"
                        required
                        placeholder="例: 田中太郎"
                    />

                    <Input
                        label="編集・削除用パスワード (4桁の数字) *"
                        name="editPassword"
                        type="password"
                        required
                        maxLength={4}
                        pattern="\d{4}"
                        placeholder="例: 1234"
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                        ※後でリクエストの編集・取り消しをする際に必要になります。
                    </p>

                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? '送信中...' : 'リクエストする'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
