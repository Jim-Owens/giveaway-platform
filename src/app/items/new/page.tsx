'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase';

export default function NewItem() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);

    // 画像選択ハンドラ
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length > 1) {
                setError('画像は1枚だけ選択可能です。');
                return;
            }
            setSelectedImages(files);
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const password = formData.get('editPassword') as string;

        if (!/^\d{4}$/.test(password)) {
            setError('パスワードは4桁の半角数字で入力してください。');
            setLoading(false);
            return;
        }

        try {
            // 画像の圧縮とアップロード
            const uploadedUrls: string[] = [];

            if (selectedImages.length > 0) {
                for (const file of selectedImages) {
                    // 画像の圧縮オプション
                    const options = {
                        maxSizeMB: 1, // 最大1MB
                        maxWidthOrHeight: 1024, // 最大1024px
                        useWebWorker: true,
                    };

                    try {
                        const compressedFile = await imageCompression(file, options);
                        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;

                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('public-images') // 事前に作成したバケット名
                            .upload(`items/${fileName}`, compressedFile);

                        if (uploadError) throw uploadError;

                        // パブリックURLを取得
                        const { data: { publicUrl } } = supabase.storage
                            .from('public-images')
                            .getPublicUrl(`items/${fileName}`);

                        uploadedUrls.push(publicUrl);
                    } catch (imgErr) {
                        console.error('Image upload failed', imgErr);
                        throw new Error('画像のアップロードに失敗しました');
                    }
                }
            }

            const data = {
                title: formData.get('title'),
                description: formData.get('description'),
                minPrice: formData.get('minPrice'),
                deadline: formData.get('deadline'),
                referenceUrl: formData.get('referenceUrl'),
                imageUrls: uploadedUrls,
                creatorName: formData.get('creatorName'),
                editPassword: password,
            };

            const res = await fetch('/api/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || '出品に失敗しました');
            }

            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'エラーが発生しました');
            setLoading(false);
        }
    };

    return (
        <div className="container fade-in">
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>出品する</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    譲り渡したいアイテムの情報を入力してください。
                </p>

                <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
                    {error && (
                        <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <Input
                        label="アイテム名 *"
                        name="title"
                        required
                        placeholder="例: 無印良品のソファ"
                    />

                    <Input
                        label="出品者名（LINEの名前など） *"
                        name="creatorName"
                        required
                        placeholder="例: 田中太郎"
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="最低希望価格 (円) *"
                            name="minPrice"
                            type="number"
                            min="0"
                            required
                            placeholder="例: 1000"
                        />

                        <Input
                            label="期限 *"
                            name="deadline"
                            type="date"
                            required
                        />
                    </div>

                    <Textarea
                        label="説明（任意）"
                        name="description"
                        placeholder="使用年数、状態、引き渡し条件など"
                    />

                    <Input
                        label="商品の参考リンク (Amazon等)（任意）"
                        name="referenceUrl"
                        placeholder="https://..."
                    />

                    <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>
                            画像（1枚、任意）
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{
                                padding: '0.5rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--color-background)',
                                cursor: 'pointer'
                            }}
                        />
                        {selectedImages.length > 0 && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                                1枚の画像が選択されています。アップロード時に自動で圧縮されます。
                            </p>
                        )}
                    </div>

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
                        ※後で投稿内容の編集や譲渡決定をする際に必要になります。
                    </p>

                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? '出品中...' : 'この内容で出品する'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
