const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send price alert email to user
 * @param {string} userEmail - Recipient email
 * @param {Array} deals - Array of deal objects
 */
async function sendPriceAlert(userEmail, deals) {
  try {
    let htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff9900; color: white; padding: 20px; text-align: center; }
            .deal { border: 1px solid #ddd; margin: 15px 0; padding: 15px; border-radius: 5px; }
            .deal-title { font-size: 16px; font-weight: bold; color: #0066c0; }
            .price { font-size: 24px; color: #b12704; font-weight: bold; }
            .savings { color: #007600; font-weight: bold; }
            .button { background: #ff9900; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px; display: inline-block; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Price Alert - Deals Found!</h1>
            </div>
            <p>Great news! The following items are now below your target price:</p>
    `;

    deals.forEach(deal => {
      const savings = (deal.target_price - deal.current_price).toFixed(2);
      htmlContent += `
        <div class="deal">
          <div class="deal-title">${deal.product_name}</div>
          <div class="price">₹${deal.current_price}</div>
          <p>Target Price: ₹${deal.target_price}</p>
          <p class="savings">You Save: ₹${savings}</p>
          <a href="${deal.url}" class="button">View on Amazon</a>
        </div>
      `;
    });

    htmlContent += `
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              This email was sent by Amazon Price Tracker because you subscribed to price alerts.
            </p>
          </div>
        </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"Amazon Price Tracker" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `🛒 Price Alert: ${deals.length} Deal${deals.length > 1 ? 's' : ''} Found!`,
      html: htmlContent,
    });

    // console.log('✅ Email sent:', info.messageId);
    return true;
  } catch (error) {
    // console.error('❌ Email sending failed:', error.message);
    throw error;
  }
}

module.exports = {
  sendPriceAlert,
};
