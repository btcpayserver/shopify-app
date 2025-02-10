import { json } from '@remix-run/node';
import { cors } from 'remix-utils/cors'
import db from '../db.server';

export async function loader({ request }) {
    const url = new URL(request.url);
    const shopName = url.searchParams.get("shopName");

    if (request.method === "OPTIONS") {
        return json({ status: 204 });
    }

    if (!shopName) {
        return json({
            success: false,
            message: "shop name is missing",
            data: null
        });
    }

    const shop = `${shopName}.myshopify.com`;
    const btcpayServerRecord = await db.bTCPayServerStore.findFirst({
        where: { shop }
    });
    if (!btcpayServerRecord) {
        return json({
            success: false,
            data: null,
            message: `No record found for shop: ${shopName}`
        });
    }

    return json({
        ok: true,
        message: `Record found for shop: ${shopName}`,
        data: btcpayServerRecord
    });
}
