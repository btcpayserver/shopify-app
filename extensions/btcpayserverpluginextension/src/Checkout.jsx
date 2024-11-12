import {
  reactExtension,
  Banner,
  BlockStack,
  Button,
  Text,
  useApi,
  Link,
  Modal,
  Spinner,
  TextBlock,
  useTotalAmount,
  useInstructions,
  useTranslate,
  useSelectedPaymentOptions
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from 'react';

// 1. Choose an extension target
export default reactExtension(
  'purchase.thank-you.block.render',
  () => <Extension />,
);

function Extension() {
  const translate = useTranslate(); 
  const { shop, ui, checkoutToken } = useApi();
  const { currencyCode, amount } = useTotalAmount();
  const instructions = useInstructions();

  const shopifyApplicaitonUrl = 'https://btcpayshopifyplugin.vercel.app';
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [btcPayUrl, setBtcPayUrl] = useState(null);
  const [btcPayStoreId, setBtcPayStoreId] = useState(null);
  const [error, setError] = useState(null);
  const [modalContent, setModalContent] = useState(null); 
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [modalTitle, setModalTitle] = useState('Pay with Bitcoin/Lightning Network');
  const shopName = shop.myshopifyDomain.split('.myshopify.com')[0];
  const options = useSelectedPaymentOptions();

  useEffect(() => {
    const hasManualPaymentOption = options.some((option) => option.type.toLowerCase() === 'manualpayment');
    if (hasManualPaymentOption) {
      const timer = setTimeout(async () => {
        await validateToken();
      }, 5000);
      return () => {
        clearTimeout(timer);
      };
    }
    
  }, [options]);

  const validateToken = async () => {
    try {
      const storeData = await retrieveBTCPayUrl(shopName);
      if (!storeData.btcpayUrl || !storeData.btcpayStoreId) {
        setError('Failed to retrieve BTCPay URL or Store ID'); 
      }
      setBtcPayStoreId(storeData.btcpayStoreId);
      setBtcPayUrl(storeData.btcpayUrl);
      await setCheckTokenValidity(storeData.btcpayUrl, storeData.btcpayStoreId, shopName);
    } catch (error) {
      setError(`Failed to validate token: ${error.message}`);
      setIsTokenValid(false);
    }
  };

  const setCheckTokenValidity = async (btcpayurl, btcpaystoreId, shopName) => {
    try {
      const validationResponse = await validateCheckoutToken(btcpayurl, btcpaystoreId, shopName, checkoutToken.current); 
      if (validationResponse.success) {
        if(validationResponse.data.financialStatus === "success"){
          setIsTokenValid(false);
        }
        else{
          setIsTokenValid(true);
          setOrderId(validationResponse.data.orderId);
          setModalTitle(validationResponse.data.paymentMethodDescription);
        }
      } else {
        setIsTokenValid(false);
        setTimeout(async () => {
          await validateToken();
        }, 3000);
      }
    } catch (error) {
      setIsTokenValid(false);
      setTimeout(async () => {
        await validateToken();
      }, 3000);
    } 
  }; 

  const retrieveBTCPayUrl = async (shopName) => {
    const response = await fetch(`${shopifyApplicaitonUrl}/api/btcpaystores?shopName=${shopName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      const { btcpayUrl, btcpayStoreId } = data.data;
      return { btcpayUrl, btcpayStoreId };
    } 
  }; 
  
  const validateCheckoutToken = async (btcpayUrl, btcpayStoreId, shopName, token) => {
    try {
      const response = await fetch(`${btcpayUrl}/stores/${btcpayStoreId}/plugins/shopify/order/${shopName}/${token}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}  
      });
      if (response.ok) {
        return {
          success: true,
          data: await response.json()
        };
      } else {
        return {
          success: false,
          error: response.statusText
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const CreateBTCPayOrder = async () => {
    setLoading(true); 
    try {
      const createOrderPayload = {
        shopName: shopName,
        orderId: orderId,
        currency: currencyCode,
        total: amount
      };
      console.log('Creating BTCPay order...');
      const createOrderResponse = await fetch(`${btcPayUrl}/stores/${btcPayStoreId}/plugins/shopify/${shopName}/create-order`, {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(createOrderPayload)
      });
      if (!createOrderResponse.ok) {
        setError(`Failed to create order: ${createOrderResponse.statusText}`);
      }
      const orderData = await createOrderResponse.json();
      console.log('Order created successfully');
      setModalContent(orderData); 
    } catch (error) {
      setError(`Failed to load BTC Pay content: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };  

  // 2. Check instructions for feature availability, see https://shopify.dev/docs/api/checkout-ui-extensions/apis/cart-instructions for details
  if (!instructions.attributes.canUpdateAttributes) {
    // For checkouts such as draft order invoices, cart attributes may not be allowed
    // Consider rendering a fallback UI or nothing at all, if the feature is unavailable
    return (
      <Banner title="btcpaytextshopext" status="warning">
        {translate("attributeChangesAreNotSupported")}
      </Banner>
    );
  }

  // 3. Render a UI
  return (
    <>
    {error && (
      <Banner status="critical">
        <Text>{error}</Text>
      </Banner>
    )}
      {isTokenValid && (
        <BlockStack>
          <Text>Shop name: {shop.name}</Text>
          <Text size="large" alignment="center" bold>Review and pay using BTCPay Server!</Text>
          <Text>Please review your order and complete the payment using BTCPay Server.</Text>
          <Button onPress={async () => {
              await CreateBTCPayOrder();
              ui.overlay.open('btc-pay-modal');
            }}
            overlay={
              <Modal 
                id="btc-pay-modal" 
                padding 
                title={modalTitle}
                onClose={async () => {
                  await setCheckTokenValidity(btcPayUrl, btcPayStoreId, shopName);
                }}>
                {loading ? (
                  <Spinner />
                ) : error ? (
                  <TextBlock>{error}</TextBlock>
                ) : modalContent ? (
                  <Link to={`${modalContent.externalPaymentLink}`} external>
                    Click to pay invoice
                  </Link>
                ) : (
                  <TextBlock>No content available</TextBlock>
                )}
              </Modal>
            }>Complete Payment</Button>
        </BlockStack>
      )}
    </>
  );
}
