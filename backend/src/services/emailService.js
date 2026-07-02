const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === '465',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const from = `CHANCELOR STORE 🛍🇨🇲 <${process.env.EMAIL_FROM}>`;

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a237e, #7b1fa2); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; }
    .body { padding: 30px 20px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #888; }
    .btn { display: inline-block; background: #7b1fa2; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 15px 0; }
    .highlight { background: #f3e5f5; border-left: 4px solid #7b1fa2; padding: 12px; border-radius: 0 6px 6px 0; margin: 15px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f3e5f5; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛍 CHANCELOR STORE</h1>
      <p>Your Trusted Cameroon Online Store 🇨🇲</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>CHANCELOR STORE | Cameroon 🇨🇲</p>
      <p>WhatsApp: <a href="https://wa.me/237674962803">+237 674 962 803</a></p>
      <p>© ${new Date().getFullYear()} CHANCELOR STORE. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

exports.sendWelcomeEmail = async (user) => {
  await transporter.sendMail({
    from, to: user.email,
    subject: '🎉 Welcome to CHANCELOR STORE!',
    html: baseTemplate(`
      <h2>Welcome, ${user.firstName}! 🎉</h2>
      <p>Thank you for joining CHANCELOR STORE Cameroon's premier online shopping destination.</p>
      <div class="highlight">
        <strong>Your referral code: ${user.referralCode}</strong><br>
        Share with friends and earn 100 loyalty points for each successful referral!
      </div>
      <p>Start shopping for the best deals today!</p>
      <a href="${process.env.CLIENT_URL}" class="btn">Shop Now →</a>
    `),
  });
};

exports.sendPasswordResetEmail = async (user, resetUrl) => {
  await transporter.sendMail({
    from, to: user.email,
    subject: '🔐 Password Reset Request CHANCELOR STORE',
    html: baseTemplate(`
      <h2>Reset Your Password</h2>
      <p>Hi ${user.firstName}, we received a request to reset your password.</p>
      <p>Click the button below to reset it. This link expires in <strong>10 minutes</strong>.</p>
      <a href="${resetUrl}" class="btn">Reset Password →</a>
      <p style="color:#888;font-size:13px">If you didn't request this, please ignore this email.</p>
    `),
  });
};

exports.sendOrderConfirmationEmail = async (user, order) => {
  const itemsHtml = order.items.map(i => `
    <tr>
      <td>${i.name}${i.variantName ? ` (${i.variantName})` : ''}</td>
      <td>${i.quantity}</td>
      <td>${i.price.toLocaleString()} XAF</td>
      <td><strong>${i.total.toLocaleString()} XAF</strong></td>
    </tr>
  `).join('');

  await transporter.sendMail({
    from, to: user.email,
    subject: `✅ Order Confirmed #${order.orderNumber} CHANCELOR STORE`,
    html: baseTemplate(`
      <h2>Order Confirmed! 🎉</h2>
      <p>Hi ${user.firstName}, your order has been placed successfully.</p>
      <div class="highlight">
        <strong>Order #${order.orderNumber}</strong><br>
        Payment Method: ${(order.payment?.method || order.paymentMethod || '').replace('_', ' ').toUpperCase()}
      </div>
      <table>
        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        ${itemsHtml}
        <tr><td colspan="3">Subtotal</td><td>${(order.pricing?.subtotal || 0).toLocaleString()} XAF</td></tr>
        <tr><td colspan="3">Shipping</td><td>${(order.pricing?.shippingFee || 0).toLocaleString()} XAF</td></tr>
        ${order.pricing?.discount ? `<tr><td colspan="3">Discount</td><td>-${order.pricing.discount.toLocaleString()} XAF</td></tr>` : ''}
        <tr><td colspan="3"><strong>Total</strong></td><td><strong>${(order.pricing?.total || 0).toLocaleString()} XAF</strong></td></tr>
      </table>
      <a href="${process.env.CLIENT_URL}/orders/${order._id}" class="btn">Track Order →</a>
    `),
  });
};

exports.sendShippingEmail = async (user, order) => {
  await transporter.sendMail({
    from, to: user.email,
    subject: `🚚 Your Order #${order.orderNumber} is on its way!`,
    html: baseTemplate(`
      <h2>Your Order is Shipped! 🚚</h2>
      <p>Hi ${user.firstName}, great news! Your order is on its way.</p>
      <div class="highlight">
        <strong>Tracking Number:</strong> ${order.shipping?.trackingNumber || 'Will be updated shortly'}<br>
        <strong>Carrier:</strong> ${order.shipping?.carrier || 'N/A'}<br>
        <strong>Estimated Delivery:</strong> ${order.shipping?.estimatedDelivery ? new Date(order.shipping.estimatedDelivery).toLocaleDateString() : '2-5 business days'}
      </div>
      <a href="${process.env.CLIENT_URL}/orders/${order._id}" class="btn">Track Your Order →</a>
      <p>Or contact us on WhatsApp: <a href="https://wa.me/237674962803">+237 674 962 803</a></p>
    `),
  });
};
