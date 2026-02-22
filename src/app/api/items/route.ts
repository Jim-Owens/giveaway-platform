import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/items - 登録されているアイテム一覧を取得
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'GIVEAWAY'; // default to GIVEAWAY

        const items = await prisma.item.findMany({
            where: { type },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }
}

// POST /api/items - 新しいアイテム（またはリクエスト）を出品
export async function POST(request: Request) {
    try {
        const data = await request.json();

        // 簡易バリデーション
        if (!data.title || !data.creatorName || !data.deadline || !data.editPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const item = await prisma.item.create({
            data: {
                type: data.type || 'GIVEAWAY',
                title: data.title,
                description: data.description || null,
                minPrice: parseInt(data.minPrice) || 0,
                deadline: new Date(data.deadline),
                referenceUrl: data.referenceUrl || null,
                imageUrls: data.imageUrls || [],
                creatorName: data.creatorName,
                editPassword: data.editPassword, // 保存されるPIN
            }
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error('Error creating item:', error);
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    }
}
