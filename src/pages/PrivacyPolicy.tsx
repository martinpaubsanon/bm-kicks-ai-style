import { useEffect } from "react";
import { PageSEO } from "@/components/seo/PageSEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageSEO title="Privacy Policy | BM Kicks" description="How BM Kicks collects, uses, and protects your personal data in Qatar and the Philippines." path="/privacy-policy" />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: January 15, 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Introduction</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Welcome to BM Kicks ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              We comply with Qatar Law No. 13 of 2016 on the Protection of Personal Data Privacy (PDPPL) and the Philippines Data Privacy Act of 2012 (RA 10173), ensuring your data rights are protected according to applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3 text-foreground">2.1 Personal Information</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Create an account on our website</li>
              <li>Place an order for products</li>
              <li>Contact our customer support</li>
              <li>Subscribe to our newsletter or marketing communications</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              This information may include: full name, email address, phone number, shipping address, billing address, and payment information.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">2.2 Automatically Collected Information</h3>
            <p className="text-foreground/80 leading-relaxed">
              When you visit our website, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and cookies installed on your device. We also collect information about your browsing behavior and purchase history to improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. How We Use Your Information</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Process and fulfill your orders, including shipping and delivery</li>
              <li>Communicate with you about your orders, products, and services</li>
              <li>Provide customer support and respond to your inquiries</li>
              <li>Send you marketing and promotional communications (only where you have opted-in and provided consent; you can withdraw consent at any time)</li>
              <li>Improve our website, products, and services</li>
              <li>Detect, prevent, and address fraud and security issues</li>
              <li>Comply with legal obligations and enforce our terms and policies</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              <strong>Marketing Communications:</strong> We only send marketing messages where you have explicitly opted in. You can unsubscribe from marketing emails at any time using the unsubscribe link in our emails or by contacting us at privacy@bmkicks.shop.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Data Storage and Security</h2>
            <p className="text-foreground/80 leading-relaxed">
              Your data is securely stored using industry-standard encryption and security measures. We use secure cloud infrastructure to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Payment information is processed through secure payment gateways and is not stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Sharing Your Information</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              We may share your information with third parties in the following situations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>Service Providers:</strong> We share information with third-party service providers who perform services on our behalf, such as payment processing, shipping, and email delivery.</li>
              <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid requests by public authorities.</li>
              <li><strong>With Your Consent:</strong> We may share your information with third parties when you give us explicit consent to do so.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Your Privacy Rights</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Under Qatar Law No. 13 of 2016 (PDPPL) and the Philippines Data Privacy Act of 2012 (RA 10173), you have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Object to Processing:</strong> Object to certain types of processing of your data</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for processing your information at any time</li>
              <li><strong>Opt-Out:</strong> Opt-out of marketing communications at any time</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              To exercise these rights, please contact us at privacy@bmkicks.shop. We will respond to your request within the timeframes required by applicable law (typically within 30 days).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Cookies and Tracking Technologies</h2>
            <p className="text-foreground/80 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies help us provide, protect, and improve our services. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website. For more information, please see our Cookie Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Data Retention</h2>
            <p className="text-foreground/80 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Children's Privacy</h2>
            <p className="text-foreground/80 leading-relaxed">
              Our website is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. International Data Transfers</h2>
            <p className="text-foreground/80 leading-relaxed">
              Your information may be transferred to and maintained on servers located outside of your country of residence. We take appropriate safeguards to ensure your personal information remains protected in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Changes to This Privacy Policy</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Contact Us</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground/80"><strong>Email:</strong> privacy@bmkicks.shop</p>
              <p className="text-foreground/80"><strong>Website:</strong> www.bmkicks.shop</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
