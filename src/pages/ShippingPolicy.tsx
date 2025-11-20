import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ShippingPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Shipping Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: January 15, 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Overview</h2>
            <p className="text-foreground/80 leading-relaxed">
              BM Kicks is committed to delivering your premium sneakers safely and efficiently. This Shipping Policy outlines our processing times, shipping methods, costs, and delivery information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Order Processing Time</h2>
            <p className="text-foreground/80 leading-relaxed">
              Orders are typically processed within <strong>1-2 business days</strong> (Monday through Saturday, excluding public holidays in Qatar). You will receive an email confirmation when your order has been placed, and another notification with tracking information once your order has been shipped.
            </p>
            <p className="text-foreground/80 leading-relaxed mt-4">
              <strong>Note:</strong> During peak seasons (major releases, holidays, or promotional events), processing times may be extended to 3-4 business days. We will notify you of any delays via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Shipping Methods and Delivery Times</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-foreground">3.1 Local Delivery (Qatar)</h3>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-foreground/80 mb-2"><strong>Doha and Surrounding Areas:</strong> 1-2 business days</p>
              <p className="text-foreground/80 mb-2"><strong>Other Regions:</strong> 2-3 business days</p>
              <p className="text-foreground/80"><strong>Express Delivery:</strong> Same-day or next-day delivery available for orders placed before 2:00 PM (additional fees apply)</p>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">3.2 GCC Countries (Gulf Region)</h3>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-foreground/80 mb-2"><strong>UAE, Saudi Arabia, Kuwait, Bahrain, Oman:</strong> 3-5 business days</p>
              <p className="text-foreground/80">Delivery times may vary based on customs clearance and local courier services.</p>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">3.3 International Shipping</h3>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-foreground/80 mb-2"><strong>Middle East & Africa:</strong> 5-7 business days</p>
              <p className="text-foreground/80 mb-2"><strong>Asia (including Philippines):</strong> 7-10 business days</p>
              <p className="text-foreground/80 mb-2"><strong>Europe:</strong> 7-10 business days</p>
              <p className="text-foreground/80 mb-2"><strong>North America:</strong> 10-14 business days</p>
              <p className="text-foreground/80"><strong>Rest of World:</strong> 10-21 business days</p>
            </div>

            <p className="text-foreground/80 leading-relaxed mt-4">
              <strong>Important:</strong> International delivery times are estimates and may be affected by customs processing, local holidays, and courier delays. We are not responsible for delays caused by customs or local postal services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Shipping Costs</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Shipping costs are calculated at checkout based on your delivery location and selected shipping method. Below are our standard shipping rates:
            </p>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Qatar (Local Delivery)</h4>
                <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                  <li>Standard Delivery: QAR 15</li>
                  <li>Express Delivery: QAR 30</li>
                  <li>Free shipping on orders over QAR 500</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">GCC Countries</h4>
                <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                  <li>Standard Delivery: QAR 50-75 (depending on country)</li>
                  <li>Free shipping on orders over QAR 800</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">International Shipping</h4>
                <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                  <li>Asia: QAR 100-150</li>
                  <li>Europe & North America: QAR 150-200</li>
                  <li>Rest of World: QAR 200-250</li>
                  <li>Free international shipping on orders over QAR 1,500</li>
                </ul>
              </div>
            </div>

            <p className="text-foreground/80 leading-relaxed mt-4">
              <strong>Note:</strong> Shipping costs are automatically calculated at checkout based on your exact location and order weight.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Order Tracking</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Once your order is shipped, you will receive:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>A shipping confirmation email with tracking number</li>
              <li>Direct link to track your package with the courier</li>
              <li>Estimated delivery date</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              You can also track your order by logging into your account and viewing your order history. Tracking information is typically updated within 24 hours of shipment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Delivery Process</h2>
            <h3 className="text-xl font-semibold mb-3 text-foreground">6.1 Signature Required</h3>
            <p className="text-foreground/80 leading-relaxed">
              For security purposes, a signature may be required upon delivery for orders over QAR 1,000. Please ensure someone is available to receive the package.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">6.2 Failed Delivery Attempts</h3>
            <p className="text-foreground/80 leading-relaxed">
              If delivery is unsuccessful, the courier will typically make 2-3 attempts and leave a notification. You will be contacted to reschedule delivery or arrange pickup from the local courier facility. Packages not collected within 7 days may be returned to us, and return shipping fees may apply.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">6.3 Address Accuracy</h3>
            <p className="text-foreground/80 leading-relaxed">
              Please ensure your shipping address is accurate and complete. We are not responsible for lost or delayed packages due to incorrect or incomplete address information. If you need to change the delivery address after placing an order, contact us immediately at <strong>support@bmkicks.com</strong>. Address changes may not be possible once the order has been shipped.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Customs, Duties, and Taxes</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              For international shipments:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>Customs Duties:</strong> You are responsible for any customs duties, taxes, or import fees imposed by your country.</li>
              <li><strong>Customs Clearance:</strong> Delays in customs clearance are beyond our control. We will provide all necessary documentation to facilitate smooth customs processing.</li>
              <li><strong>Refused Packages:</strong> If a package is refused or returned due to unpaid customs fees, you will be responsible for return shipping costs, and the refund will be issued minus all shipping charges.</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              We recommend checking with your local customs office regarding potential duties and taxes before placing an international order.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Lost or Damaged Packages</h2>
            <h3 className="text-xl font-semibold mb-3 text-foreground">8.1 Lost Packages</h3>
            <p className="text-foreground/80 leading-relaxed">
              If your tracking shows that your package was delivered but you did not receive it, please check with neighbors, household members, or building reception. If you still cannot locate your package, contact us within 48 hours at <strong>support@bmkicks.com</strong> so we can investigate with the courier.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">8.2 Damaged Packages</h3>
            <p className="text-foreground/80 leading-relaxed">
              If your package arrives damaged, please take photos of the exterior packaging and the damaged items immediately. Contact us within 48 hours with photos and your order number. We will work with you to resolve the issue through replacement or refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Packaging</h2>
            <p className="text-foreground/80 leading-relaxed">
              All products are carefully packaged to ensure they arrive in perfect condition. Sneakers are shipped in their original box, which is then placed in a protective outer shipping box with cushioning materials. We take great care to protect your purchase during transit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Restrictions</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We currently ship to most countries worldwide. However, we may be unable to ship to certain regions due to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Courier service limitations</li>
              <li>Legal or import restrictions</li>
              <li>Ongoing conflicts or sanctions</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              If we cannot ship to your location, you will be notified during checkout, and we will not be able to process your order.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Contact Us</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have any questions about shipping or need assistance with your order, please contact us:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground/80"><strong>Email:</strong> support@bmkicks.com</p>
              <p className="text-foreground/80"><strong>WhatsApp:</strong> Available through our website</p>
              <p className="text-foreground/80"><strong>Response Time:</strong> Within 24 hours during business days</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
