import { NextRequest } from "next/server";
const { JSDOM } = await import('jsdom');

export const vluUrl = 'https://online.vlu.edu.vn'
export const vluLoginUrl = `${vluUrl}/login`
export const vluHomeUrl = `${vluUrl}/Home`

export enum TermId {
    HK01 = "HK01",
    HK02 = "HK02",
    HK03 = "HK03"
}

export async function GET (req: NextRequest) {
    // truy cập trang online.vlu.edu.vn và lấy cookie, sau đó kiểm tra xem id và password được cung cấp có 
    // thể đăng nhập được hay không, nếu không thì trả về lỗi, nếu có thì xử lý để trả về tag <table> chứa 
    // lịch học của sinh viên

    const { id, password } = Object.fromEntries(new URL(req.url).searchParams)

    if (!id || !password) return new Response('Missing id or password', { status: 400 });
    
    // get vlu cookie 
    const handleGetVluCookie = async () => {
        try {
            const fetchVluServer = await fetch(vluUrl);
            const loginCookie = fetchVluServer.headers
                .get('set-cookie')
                ?.split(';')[0];
            return loginCookie;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error('Failed to get VLU cookie: ' + error.message);
            } else {
                throw new Error('Failed to get VLU cookie');
            }
        }
    };

    const loginCookie = await handleGetVluCookie();

    if (!loginCookie) return new Response('Failed to get VLU cookie', { status: 500 });
    // return new Response(loginCookie, { status: 200 });

    // // login to vlu
    const applyCookieHeader = new Headers();
    applyCookieHeader.append('Cookie', loginCookie);

    const applyAuth = new FormData();
    applyAuth.append('txtTaiKhoan', id);
    applyAuth.append('txtMatKhau', password);

    // login to vlu
    const loginResponse = await fetch(vluLoginUrl, {
        method: 'POST',
        headers: applyCookieHeader,
        body: applyAuth,
        redirect: 'follow'
    });

    if (!loginResponse.ok) return new Response('Failed to login to VLU', { status: 500 });

    const loginHtml = await loginResponse.text();
    const dom = new JSDOM(loginHtml);
    const title = dom.window.document.querySelector('title')?.textContent;

    if (title === 'Đăng nhập') {
        return new Response('Invalid id or password', { status: 401 });
    } else {
        return new Response(JSON.stringify({cookie: loginCookie}), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
}