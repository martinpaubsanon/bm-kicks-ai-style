import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: January 15, 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Agreement to Terms</h2>
            <p className="text-foreground/80 leading-relaxed">
              By accessing and using BM Kicks ("the Website"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Website. We reserve the right to modify these Terms at any time, and such modifications will be effective immediately upon posting.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. About BM Kicks</h2>
            <p className="text-foreground/80 leading-relaxed">
              BM Kicks is a premium sneaker retailer offering authentic footwear from leading brands. Our tagline "The world under your kicks" reflects our commitment to providing quality sneakers to customers worldwide. We operate primarily in Qatar with international shipping capabilities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Eligibility</h2>
            <p className="text-foreground/80 leading-relaxed">
              You must be at least 18 years old to make purchases on our Website. By using our Website, you represent and warrant that you are at least 18 years of age. If you are under 18, you may use the Website only with the involvement and consent of a parent or legal guardian.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Products and Pricing</h2>
            <h3 className="text-xl font-semibold mb-3 text-foreground">4.1 Product Information</h3>
            <p className="text-foreground/80 leading-relaxed">
              We strive to display accurate product information, including descriptions, images, and pricing. However, we do not warrant that product descriptions, colors, or other content is accurate, complete, or error-free. Colors may vary slightly from images due to monitor settings and photography.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">4.2 Pricing</h3>
            <p className="text-foreground/80 leading-relaxed">
              All prices are listed in Qatari Riyal (QAR) as the base currency. We also display prices in USD and PHP for customer convenience, with real-time conversion rates applied. We reserve the right to change prices at any time without prior notice. The price charged will be the price displayed at the time of order placement.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">4.3 Product Availability</h3>
            <p className="text-foreground/80 leading-relaxed">
              All products are subject to availability. We make every effort to keep our inventory information accurate, but in rare cases, a product may be out of stock after you place an order. If this occurs, we will notify you promptly and offer a full refund or alternative product.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Orders and Payment</h2>
            <h3 className="text-xl font-semibold mb-3 text-foreground">5.1 Order Acceptance</h3>
            <p className="text-foreground/80 leading-relaxed">
              Your order is an offer to purchase products from us. All orders are subject to acceptance by BM Kicks. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing or product information, or suspected fraudulent activity.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">5.2 Payment</h3>
            <p className="text-foreground/80 leading-relaxed">
              We accept various payment methods as displayed at checkout. Payment must be received before we process your order. By providing payment information, you represent and warrant that you are authorized to use the payment method and authorize us to charge the total amount to your chosen payment method.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">5.3 Order Confirmation</h3>
            <p className="text-foreground/80 leading-relaxed">
              After placing an order, you will receive an email confirmation with your order details. This confirmation does not signify acceptance of your order; it is simply a record that we have received it. We will send you a separate notification when your order has been processed and shipped.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Account Registration</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              To access certain features of our Website, you may be required to create an account. When you create an account, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate and current</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              We reserve the right to suspend or terminate your account if any information provided is inaccurate, false, or misleading.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Authenticity Guarantee</h2>
            <p className="text-foreground/80 leading-relaxed">
              BM Kicks guarantees that all products sold on our Website are 100% authentic. We source our products directly from authorized retailers and distributors. If you receive a product that you believe is not authentic, please contact us immediately. For more information, please see our Authenticity Guarantee page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Intellectual Property</h2>
            <p className="text-foreground/80 leading-relaxed">
              All content on the Website, including but not limited to text, graphics, logos, images, product descriptions, and software, is the property of BM Kicks or its content suppliers and is protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. User Conduct</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Use the Website for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems or networks</li>
              <li>Interfere with or disrupt the Website or servers</li>
              <li>Upload viruses or malicious code</li>
              <li>Collect or harvest information about other users</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in any activity that could damage or impair the Website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Shipping and Delivery</h2>
            <p className="text-foreground/80 leading-relaxed">
              Shipping terms, costs, and delivery timeframes are outlined in our Shipping Policy. We are not responsible for delays caused by customs, shipping carriers, or circumstances beyond our control. Risk of loss and title for products pass to you upon delivery to the shipping carrier.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Returns and Refunds</h2>
            <p className="text-foreground/80 leading-relaxed">
              Our return and refund policy is detailed in our Return Policy. By making a purchase, you agree to the terms outlined in that policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Limitation of Liability</h2>
            <p className="text-foreground/80 leading-relaxed">
              To the maximum extent permitted by law, BM Kicks and its affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Website or products purchased through the Website. Our total liability shall not exceed the amount you paid for the product giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Disclaimer of Warranties</h2>
            <p className="text-foreground/80 leading-relaxed">
              The Website and all products are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Website will be uninterrupted, error-free, or free of viruses or other harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Indemnification</h2>
            <p className="text-foreground/80 leading-relaxed">
              You agree to indemnify, defend, and hold harmless BM Kicks and its affiliates from any claims, liabilities, damages, losses, and expenses arising out of your use of the Website, your violation of these Terms, or your violation of any rights of another.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">15. Governing Law</h2>
            <p className="text-foreground/80 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Qatar, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Website shall be resolved in the courts of Qatar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">16. Severability</h2>
            <p className="text-foreground/80 leading-relaxed">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">17. Entire Agreement</h2>
            <p className="text-foreground/80 leading-relaxed">
              These Terms, along with our Privacy Policy, Return Policy, Shipping Policy, and Cookie Policy, constitute the entire agreement between you and BM Kicks regarding your use of the Website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">18. Contact Information</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground/80"><strong>Email:</strong> support@bmkicks.com</p>
              <p className="text-foreground/80"><strong>Website:</strong> www.bmkicks.com</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
