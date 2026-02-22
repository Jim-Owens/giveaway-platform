'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

type Comment = {
    id: string;
    text: string;
    commenterName: string;
    createdAt: string;
};

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
    createdAt: string;
    comments: Comment[];
};

export default function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;

    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            const res = await fetch(`/api/items/${id}`);
            if (res.ok) {
                setItem(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        const pin = prompt('譲渡決定済みに変更しますか？\n（決定後は直接LINE等でやり取りを進めてください）\n\n出品時に設定した4桁のパスワードを入力してください:');
        if (!pin) return;

        try {
            const res = await fetch(`/api/items/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Resolved', editPassword: pin })
            });

            if (res.ok) {
                fetchItem();
            } else {
                const errData = await res.json();
                alert(errData.error || 'ステータス更新に失敗しました');
            }
        } catch (err) {
            console.error(err);
            alert('エラーが発生しました');
        }
    };

    const handleDelete = async () => {
        const adminPin = prompt('【管理者専用】商品を完全に削除しますか？\n削除する場合は、管理者パスワードを入力してください:');
        if (!adminPin) return;

        try {
            const res = await fetch(`/api/items/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminPassword: adminPin })
            });

            if (res.ok) {
                alert('商品を削除しました。');
                router.push('/');
            } else {
                const errData = await res.json();
                alert(errData.error || '削除に失敗しました');
            }
        } catch (err) {
            console.error(err);
            alert('エラーが発生しました');
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const commenterName = formData.get('commenterName');
        const text = formData.get('text');

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, commenterName, text })
            });

            if (res.ok) {
                (e.target as HTMLFormElement).reset();
                fetchItem(); // 最新のコメントを取得
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container text-center py-10" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>読み込み中...</div>;
    if (!item) return <div className="container text-center py-10">アイテムが見つかりません。</div>;

    const isResolved = item.status === 'Resolved';

    return (
        <div className="container fade-in">
            {/* 戻るボタン */}
            <Button variant="secondary" onClick={() => router.push('/')} style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
                ← 一覧に戻る
            </Button>

            <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem', padding: '2rem', overflow: 'hidden' }}>
                {/* アイテム情報 */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h1 style={{ fontSize: '2rem', wordBreak: 'break-word', flex: 1, marginRight: '1rem' }}>{item.title}</h1>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                            <Link href={`/items/${id}/edit`}>
                                <Button variant="secondary" style={{ padding: '0.35rem 1rem', fontSize: '0.875rem' }}>
                                    編集
                                </Button>
                            </Link>
                            <span className={`status-badge ${!isResolved ? 'status-available' : 'status-resolved'}`} style={{ fontSize: '0.875rem', padding: '0.35rem 1rem' }}>
                                {!isResolved ? '受付中' : '譲渡決定'}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                        <span>出品者: <strong>{item.creatorName}</strong></span>
                        <span>期限: {new Date(item.deadline).toLocaleDateString()}</span>
                        <span>投稿日: {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>

                    {item.imageUrls && item.imageUrls.length > 0 && (
                        <div style={{ width: '100%', maxHeight: '400px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem', backgroundColor: 'var(--color-border)' }}>
                            <img src={item.imageUrls[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '400px' }} />
                        </div>
                    )}

                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
                        希望価格: ¥{item.minPrice.toLocaleString()}〜
                    </div>

                    <div style={{ marginBottom: '2rem', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                        {item.description || "説明はありません。"}
                    </div>

                    {item.referenceUrl && (
                        <div style={{ padding: '1rem', background: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span role="img" aria-label="link">🔗</span> 参考リンク (Amazon等)
                            </h3>
                            <a href={item.referenceUrl.startsWith('http') ? item.referenceUrl : `https://${item.referenceUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', wordBreak: 'break-all', fontSize: '0.875rem' }}>
                                {item.referenceUrl}
                            </a>
                        </div>
                    )}

                    {!isResolved && (
                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                もし譲渡相手が決まった場合は、以下のボタンを押して募集を終了してください。<br />
                                ※譲渡後は直接LINE等でやり取りやお引渡しについてご相談ください。
                            </p>
                            <Button onClick={handleStatusUpdate} variant="secondary" style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)' }}>
                                ✓ 譲渡決定済みにする
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* 管理者用削除ボタン */}
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                <button
                    onClick={handleDelete}
                    style={{ background: 'none', border: 'none', color: '#ef4444', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                    【管理者用】この商品を削除する
                </button>
            </div>

            {/* コメントセクション */}
            <div className="chat-container delay-100 fade-in">
                <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>メッセージ・交渉</h3>

                {item.comments.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>まだコメントはありません。質問や希望価格を伝えてみましょう！</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {item.comments.map((comment) => (
                            <div key={comment.id} className="chat-bubble flex flex-col">
                                <div className="chat-bubble-header">
                                    <span className="chat-bubble-author">{comment.commenterName}</span>
                                    <span>{new Date(comment.createdAt).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div style={{ whiteSpace: 'pre-wrap' }}>{comment.text}</div>
                            </div>
                        ))}
                    </div>
                )}

                {!isResolved && (
                    <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1rem' }}>📝 コメントする</h4>
                        <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Input
                                name="commenterName"
                                placeholder="あなたのお名前（LINE名など）"
                                required
                            />
                            <Textarea
                                name="text"
                                placeholder="質問や「〇〇円で譲ってください！」などのメッセージを入力"
                                required
                                style={{ minHeight: '80px' }}
                            />
                            <div style={{ textAlign: 'right' }}>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? '送信中...' : '送信する'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
