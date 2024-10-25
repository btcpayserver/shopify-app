import db from "../db.server";
import { json } from "@remix-run/node";
import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { Page, Text, Card, Button, BlockStack, InlineGrid, TextField, Box } from "@shopify/polaris";

export async function loader({ request }) {
  await authenticate.admin(request);
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');
  const btcpayServerRecord = await db.bTCPayServerStore.findFirst({
      where: { shop }
  });
  return { btcpayUrl: btcpayServerRecord?.btcpayUrl, btcpayStoreId: btcpayServerRecord?.btcpayStoreId };
}

export const action = async ({ request }) => {
  await authenticate.admin(request);
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get('shop');
    const shopId = shop.split('.myshopify.com')[0];
    const formData = Object.fromEntries(await request.formData());
    let { btcpayUrl, btcpayStoreId } = formData;
    if (!btcpayUrl || !btcpayStoreId) {
      return json({ success: false, message: `Please input your BTCPay server domain url and store Id` }, { status: 400 });
    }
    btcpayUrl = btcpayUrl.endsWith('/') ? btcpayUrl.slice(0, -1) : btcpayUrl;
    const isValidBTCPayStore = await validateBTCPayStoreInstance(btcpayUrl, btcpayStoreId, shopId);
    if (!isValidBTCPayStore) {
      return json({ success: false, message: 'Failed to validate BTCPay store. Kindly ensure you have the plugin installed on your BTCPay Server instance.' }, { status: 400 });
    }
    const shopInfo = await getShopInfo(shop);
    var data = {
      btcpayUrl,
      shopName: shopInfo.name,
      shop,
      btcpayStoreId,
      shopId, 
      shopOwner: shopInfo.name, 
      currency: shopInfo.currency, 
      country: shopInfo.country
    };
    const user = await db.bTCPayServerStore.upsert({
      where: { shop }, 
      update: data,
      create: data
    });
    return json({
      btcpayUrl, success: true,
      message: "BTCPay URL saved successfully.",
    });
  } catch (error) {
    console.log('Error encountered', error.message) 
    return json({ success: false, message: `Error: ${error.message}` }, { status: 500 });
  }
};

const getShopInfo = async (shopDomain) => {
  let session = await findSessionByShop(shopDomain);
  const response = await fetch(`https://${shopDomain}/admin/api/2023-04/shop.json`, {
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': session.accessToken,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json(); 
  return data.shop;
};

const validateBTCPayStoreInstance = async (btcpayUrl, storeId, shopName) => {
  try {
    const response = await fetch(`${btcpayUrl}/stores/${storeId}/plugins/shopify/validate/${shopName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

const findSessionByShop = async (shop) => {
  return await db.session.findFirst({ where: { shop } });
};

export default function Index() {
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const settings = useLoaderData();
  const [formState, setFormState] = useState(settings);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => { 
    if (fetcher.data?.success === false) {
      shopify.toast.show(fetcher.data.message || "Error saving BTCPay URL");
      setErrorMessage(fetcher.data.message);
    } else if (fetcher.data?.success === true) {
      setErrorMessage(null);
      shopify.toast.show("BTCPay URL saved successfully");
    }
  }, [fetcher.data, shopify]);

  return ( 
    <Page>
      <TitleBar title="BTCPay Server - Shopify plugin" />
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: 400, sm: 0 }}
            paddingInlineEnd={{ xs: 400, sm: 0 }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                BTCPay Server
              </Text>
              <Text as="p" variant="bodyMd">
                Please enter your BTCPay server Url and the Store ID (where the plugin is installed)
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <fetcher.Form method="POST">
            <BlockStack gap="400">
              <TextField
                label="BTCPay URL"
                name="btcpayUrl"
                value={formState?.btcpayUrl}
                onChange={(v) =>
                  setFormState({ ...formState, btcpayUrl: v })
                }
              />
              <TextField
                label="BTCPay Store Id"
                name="btcpayStoreId"
                value={formState?.btcpayStoreId}
                onChange={(v) =>
                  setFormState({ ...formState, btcpayStoreId: v })
                }
              />
              <Button
              submit
              primary
              loading={fetcher.state === "submitting"}
              disabled={fetcher.state === "submitting"}
              >
                Save
              </Button>
            </BlockStack>
            </fetcher.Form>
          </Card> 
        </InlineGrid>
      </BlockStack>  
    </Page>
  );
}
