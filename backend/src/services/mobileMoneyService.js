/**
 * Mobile Money Service — MTN Mobile Money & Orange Money (Cameroon)
 */
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// ── MTN Mobile Money ──────────────────────────────────────────────
exports.initiateMTNPayment = async ({ amount, currency, phoneNumber, orderId, orderNumber }) => {
  const referenceId = uuidv4();
  const baseUrl = process.env.MTN_MOMO_BASE_URL;

  // Step 1: Get access token
  const credentials = Buffer.from(`${process.env.MTN_MOMO_API_USER}:${process.env.MTN_MOMO_API_KEY}`).toString('base64');
  const tokenRes = await axios.post(
    `${baseUrl}/collection/token/`,
    {},
    { headers: { Authorization: `Basic ${credentials}`, 'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY } }
  );
  const accessToken = tokenRes.data.access_token;

  // Step 2: Request to Pay
  await axios.post(
    `${baseUrl}/collection/v1_0/requesttopay`,
    {
      amount: amount.toString(),
      currency,
      externalId: orderId,
      payer: { partyIdType: 'MSISDN', partyId: phoneNumber.replace('+', '') },
      payerMessage: `CHANCELOR STORE - Order #${orderNumber}`,
      payeeNote: `Order ${orderId}`,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
        'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

  return { referenceId };
};

exports.checkMTNStatus = async (referenceId) => {
  const baseUrl = process.env.MTN_MOMO_BASE_URL;
  const credentials = Buffer.from(`${process.env.MTN_MOMO_API_USER}:${process.env.MTN_MOMO_API_KEY}`).toString('base64');
  const tokenRes = await axios.post(`${baseUrl}/collection/token/`, {}, {
    headers: { Authorization: `Basic ${credentials}`, 'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY },
  });

  const statusRes = await axios.get(`${baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
    headers: {
      Authorization: `Bearer ${tokenRes.data.access_token}`,
      'X-Target-Environment': process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
      'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY,
    },
  });

  return statusRes.data.status; // SUCCESSFUL | FAILED | PENDING
};

// ── Orange Money ──────────────────────────────────────────────────
exports.initiateOrangePayment = async ({ amount, currency, phoneNumber, orderId }) => {
  const baseUrl = process.env.ORANGE_MONEY_BASE_URL;

  // Get access token
  const tokenRes = await axios.post(
    'https://api.orange.com/oauth/v3/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.ORANGE_MONEY_CLIENT_ID}:${process.env.ORANGE_MONEY_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const paymentRes = await axios.post(
    `${baseUrl}/webpayment`,
    {
      merchant_key: process.env.ORANGE_MONEY_CLIENT_ID,
      currency, order_id: orderId,
      amount: amount.toString(),
      return_url: `${process.env.CLIENT_URL}/order-confirmation`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
      notif_url: `${process.env.SERVER_URL}/api/payments/orange-money/webhook`,
      lang: 'fr',
    },
    { headers: { Authorization: `Bearer ${tokenRes.data.access_token}` } }
  );

  return {
    paymentUrl: paymentRes.data.payment_url,
    payToken: paymentRes.data.pay_token,
  };
};

exports.checkOrangeStatus = async (payToken) => {
  const tokenRes = await axios.post(
    'https://api.orange.com/oauth/v3/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.ORANGE_MONEY_CLIENT_ID}:${process.env.ORANGE_MONEY_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const statusRes = await axios.get(
    `${process.env.ORANGE_MONEY_BASE_URL}/webpayment/${payToken}`,
    { headers: { Authorization: `Bearer ${tokenRes.data.access_token}` } }
  );

  return statusRes.data.status; // SUCCESS | FAILED | PENDING
};
