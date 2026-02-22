import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    // 環境変数からパスワードを取得（設定されていない場合は認証をスキップ）
    const sitePassword = process.env.SITE_PASSWORD;

    if (!sitePassword) {
        return NextResponse.next();
    }

    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1];
        const [user, pwd] = atob(authValue).split(':');

        // ユーザー名は任意で、パスワードのみ検証
        if (pwd === sitePassword) {
            return NextResponse.next();
        }
    }

    // 認証失敗時は401を返し、ブラウザにBasic認証のダイアログを表示させる
    return new NextResponse('Authentication required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}

// 適用範囲を指定（API以外の全ページ、または必要に応じてAPIも含める）
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
