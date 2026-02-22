'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';

type Item = {
    id: string;
    title: string;
    description: string | null;
    minPrice: number;
    deadline: string;
    imageUrls: string[];
    referenceUrl: string | null;
    creatorName: string;
    status: string;
    type: string;
};

export default function EditItem({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;

    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        fetch(`/api/items/${id}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                setItem(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

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
        setSaving(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const pin = formData.get('editPassword') as string;

        if (!/^\d{4}$/.test(pin)) {
            setError('パスワードは4桁の半角数字で入力してください。');
            setSaving(false);
            return;
        }

        let finalImageUrls = item?.imageUrls || [];

        // 新しい画像が選択されている場合はアップロードして上書きする
        if (selectedImages.length > 0) {
            setUploadingImage(true);
            try {
                const file = selectedImages[0];
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('public-images')
                    .upload(`items/${fileName}`, compressedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('public-images')
                    .getPublicUrl(`items/${fileName}`);

                finalImageUrls = [publicUrl]; // 古い画像を上書きして新しい画像のURLにする
            } catch (imgErr) {
                console.error('Image upload failed', imgErr);
                setError('画像のアップロードに失敗しました。');
                setSaving(false);
                setUploadingImage(false);
                return;
            }
        }

        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            minPrice: formData.get('minPrice'),
            deadline: formData.get('deadline'),
            referenceUrl: formData.get('referenceUrl'),
            imageUrls: finalImageUrls,
            editPassword: pin,
        };

        try {
            const res = await fetch(`/api/items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || '更新に失敗しました');
            }

            // 成功した場合は詳細ページに戻る
            router.push(`/items/${id}`);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'エラーが発生しました');
            setSaving(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>読み込み中...</div>;
    if (!item) return <div style={{ textAlign: 'center', padding: '4rem 0' }}>アイテムが見つかりません。</div>;

    // YYYY-MM-DD形式に変換 (datetimeの場合の考慮を含む)
    const formattedDate = item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '';
    const isWanted = item.type === 'WANTED';

    return (
        <div className="container fade-in">
            <Button variant="secondary" onClick={() => router.push(`/items/${id}`)} style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
                ← キャンセルして戻る
            </Button>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>内容を編集する</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    投稿時のパスワード（4桁の数字）を入力して更新してください。
                </p>

                <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
                    {error && (
                        <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <Input
                        label={isWanted ? "欲しいアイテム名 *" : "アイテム名 *"}
                        name="title"
                        required
                        defaultValue={item.title}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label={isWanted ? "予算上限 (円) *" : "最低希望価格 (円) *"}
                            name="minPrice"
                            type="number"
                            min="0"
                            required
                            defaultValue={item.minPrice.toString()}
                        />

                        <Input
                            label="期限 *"
                            name="deadline"
                            type="date"
                            required
                            defaultValue={formattedDate}
                        />
                    </div>

                    <Textarea
                        label="説明（任意）"
                        name="description"
                        defaultValue={item.description || ''}
                    />

                    <Input
                        label="商品の参考リンク (Amazon等)（任意）"
                        name="referenceUrl"
                        placeholder="https://..."
                        defaultValue={item.referenceUrl || ''}
                    />

                    {!isWanted && (
                        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>
                                画像を変更する（1枚、任意）
                            </label>

                            {item.imageUrls && item.imageUrls.length > 0 && selectedImages.length === 0 && (
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <img src={item.imageUrls[0]} alt="Current" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>現在の画像</span>
                                </div>
                            )}

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
                                    新しい画像が選択されています。保存時に現在の画像を上書きします。
                                </p>
                            )}
                        </div>
                    )}

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
                        ※投稿時に設定した4桁のパスワードを入力してください。
                    </p>

                    <Button type="submit" fullWidth disabled={saving || uploadingImage}>
                        {uploadingImage ? '画像をアップロード中...' : saving ? '保存中...' : '変更を保存する'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
