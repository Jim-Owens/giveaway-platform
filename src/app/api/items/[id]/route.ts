import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Since Next.js 15, params is a Promise
) {
    try {
        const { id } = await params;
        const item = await prisma.item.findUnique({
            where: { id },
            include: {
                comments: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json(item);
    } catch (error) {
        console.error('Error fetching item:', error);
        return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();

        if (!data.status || !data.editPassword) {
            return NextResponse.json({ error: 'Status and editPassword are required' }, { status: 400 });
        }

        const existingItem = await prisma.item.findUnique({ where: { id } });
        if (!existingItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        if (existingItem.editPassword !== data.editPassword) {
            return NextResponse.json({ error: 'パスワードが間違っています' }, { status: 403 });
        }

        const item = await prisma.item.update({
            where: { id },
            data: { status: data.status }
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error('Error updating item status:', error);
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();

        if (!data.editPassword) {
            return NextResponse.json({ error: 'editPassword is required' }, { status: 400 });
        }

        const existingItem = await prisma.item.findUnique({ where: { id } });
        if (!existingItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        if (existingItem.editPassword !== data.editPassword) {
            return NextResponse.json({ error: 'パスワードが間違っています' }, { status: 403 });
        }

        // 基本的なバリデーション
        if (!data.title || !data.deadline) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const item = await prisma.item.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description || null,
                minPrice: parseInt(data.minPrice) || 0,
                deadline: new Date(data.deadline),
                referenceUrl: data.referenceUrl || null,
                imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
            }
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error('Error editing item:', error);
        return NextResponse.json({ error: 'Failed to edit item' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();

        if (!data.adminPassword) {
            return NextResponse.json({ error: 'adminPassword is required' }, { status: 400 });
        }

        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword || data.adminPassword !== adminPassword) {
            return NextResponse.json({ error: '管理者パスワードが間違っています' }, { status: 403 });
        }

        const existingItem = await prisma.item.findUnique({ where: { id } });
        if (!existingItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        await prisma.item.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
