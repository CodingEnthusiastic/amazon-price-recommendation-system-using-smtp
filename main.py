from bs4 import BeautifulSoup
import requests
import smtplib
import os
import time
import schedule
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ====================== Product List ===========================
# Add multiple products here with their target prices
PRODUCTS = [
    {
        "name": "Instant Pot Duo Plus",
        "url": "https://www.amazon.com/dp/B075CYMYK6?psc=1&ref_=cm_sw_r_cp_ud_ct_FM9M699VKHTT47YD50Q6",
        "target_price": 8000
    },
    
    # Add more products here:
    # {
    #     "name": "Product Name",
    #     "url": "Amazon product URL",
    #     "target_price": 5000
    # },
]

# ====================== Add Headers to the Request ===========================

header = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36",
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8"
}


def get_product_price(url):
    """Fetch and parse product price from Amazon"""
    try:
        response = requests.get(url, headers=header)
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Find the price element
        price_element = soup.find(class_="a-offscreen")
        if price_element is None:
            print(f"  ⚠️  Could not find price element for URL: {url}")
            return None, None
        
        price = price_element.get_text()
        
        # Remove currency symbols and commas
        price_without_currency = price.replace("$", "").replace("INR", "").replace("₹", "").replace(",", "").strip()
        
        # Convert to float
        price_as_float = float(price_without_currency)
        
        # Get product title
        title_element = soup.find(id="productTitle")
        if title_element:
            title = title_element.get_text().strip()
        else:
            title = "Unknown Product"
        
        return price_as_float, title
    
    except Exception as e:
        print(f"  ❌ Error fetching product: {e}")
        return None, None


def send_email(subject, message):
    """Send email notification"""
    try:
        with smtplib.SMTP(os.environ["SMTP_ADDRESS"], port=587) as connection:
            connection.starttls()
            connection.login(os.environ["EMAIL_ADDRESS"], os.environ["EMAIL_PASSWORD"])
            connection.sendmail(
                from_addr=os.environ["EMAIL_ADDRESS"],
                to_addrs=os.environ["EMAIL_ADDRESS"],
                msg=f"Subject:{subject}\n\n{message}".encode("utf-8")
            )
        print(f"  ✅ Email sent successfully!")
    except Exception as e:
        print(f"  ❌ Failed to send email: {e}")


def check_prices():
    """Check all products and send alerts if prices are below target"""
    print(f"\n{'='*60}")
    print(f"🔍 Checking prices at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")
    
    deals_found = []
    
    for product in PRODUCTS:
        print(f"\n📦 Checking: {product['name']}")
        print(f"   Target Price: ₹{product['target_price']}")
        
        current_price, title = get_product_price(product['url'])
        
        if current_price is not None:
            print(f"   Current Price: ₹{current_price}")
            
            if current_price < product['target_price']:
                print(f"   🎉 DEAL FOUND! Price is below target!")
                deals_found.append({
                    'title': title if title != "Unknown Product" else product['name'],
                    'current_price': current_price,
                    'target_price': product['target_price'],
                    'url': product['url']
                })
            else:
                print(f"   ⏳ No deal yet (₹{current_price - product['target_price']:.2f} above target)")
        
        # Add delay to avoid rate limiting
        time.sleep(2)
    
    # Send email if any deals were found
    if deals_found:
        message_body = "🎊 Great news! The following items are on sale:\n\n"
        for deal in deals_found:
            message_body += f"📦 {deal['title']}\n"
            message_body += f"   Current Price: ₹{deal['current_price']}\n"
            message_body += f"   Target Price: ₹{deal['target_price']}\n"
            message_body += f"   Savings: ₹{deal['target_price'] - deal['current_price']:.2f}\n"
            message_body += f"   Link: {deal['url']}\n\n"
        
        send_email("🛒 Amazon Price Alert - Deals Found!", message_body)
    else:
        print(f"\n✓ Price check complete. No deals found at this time.")
    
    print(f"{'='*60}\n")


def main():
    """Main function to run the price checker"""
    print("🤖 Amazon Price Tracker Bot Started!")
    print(f"📋 Tracking {len(PRODUCTS)} product(s)")
    print(f"⏰ Will check prices every 24 hours\n")
    
    # Run immediately on start
    check_prices()
    
    # Schedule to run every 24 hours
    schedule.every(24).hours.do(check_prices)
    
    print("⏳ Waiting for next check (in 24 hours)...")
    print("   Press Ctrl+C to stop the bot\n")
    
    # Keep the script running
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute if it's time to run


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Bot stopped by user. Goodbye!")
    except Exception as e:
        print(f"\n❌ Bot crashed with error: {e}")