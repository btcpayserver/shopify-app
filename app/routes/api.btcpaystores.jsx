import { json } from '@remix-run/node';
import { cors } from 'remix-utils/cors'
import db from '../db.server';

export async function loader({ request }) {
    const url = new URL(request.url);
    const shopName = url.searchParams.get("shopName");

    console.log(request.method)
    console.log(request);
    if (request.method === "OPTIONS") {
        const response = json({
        status: 200,
        });
        return await cors(request, response);
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

    const response = json({
        ok: true,
        message: `Record found for shop: ${shopName}`,
        data: btcpayServerRecord
    });

    return cors(request, response);
}
