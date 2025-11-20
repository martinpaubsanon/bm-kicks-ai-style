import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function CookiePolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: January 15, 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. What Are Cookies?</h2>
            <p className="text-foreground/80 leading-relaxed">
              Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and provide a better user experience. Cookies allow websites to remember your actions and preferences over time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. How We Use Cookies</h2>
            <p className="text-foreground/80 leading-relaxed">
              BM Kicks uses cookies to enhance your browsing experience, analyze website traffic, and personalize content. We use cookies for various purposes, including remembering your shopping cart, keeping you logged in, and understanding how you interact with our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-foreground">3.1 Essential Cookies</h3>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-foreground/80 mb-2"><strong>Purpose:</strong> These cookies are necessary for the website to function properly.</p>
              <p className="text-foreground/80 mb-2"><strong>Examples:</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li>Authentication cookies (keeping you logged in)</li>
                <li>Shopping cart cookies (remembering items in your cart)</li>
                <li>Session cookies (maintaining your session across pages)</li>
                <li>Security cookies (protecting against fraud and unauthorized access)</li>
              </ul>
              <p className="text-foreground/80 mt-2"><strong>Can be disabled?</strong> No. These cookies are essential for the website to work.</p>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">3.2 Functional Cookies</h3>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-foreground/80 mb-2"><strong>Purpose:</strong> These cookies enable enhanced functionality and personalization.</p>
              <p className="text-foreground/80 mb-2"><strong>Examples:</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li>Language preference cookies</li>
                <li>Currency selection cookies (QAR, USD, PHP)</li>
                <li>Recently viewed products</li>
                <li>User interface preferences</li>
              </ul>
              <p className="text-foreground/80 mt-2"><strong>Can be disabled?</strong> Yes, but some features may not work properly.</p>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">3.3 Performance and Analytics Cookies</h3>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-foreground/80 mb-2"><strong>Purpose:</strong> These cookies help us understand how visitors interact with our website.</p>
              <p className="text-foreground/80 mb-2"><strong>Examples:</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80">
                <li>Page views and navigation patterns</li>
                <li>Time spent on pages</li>
                <li>Error messages and technical issues</li>
                <li>Traffic sources (how you found our website)</li>
              </ul>
              <p className="text-foreground/80 mt-2"><strong>Information collected:</strong> Anonymous statistical data that cannot identify you personally.</p>
              <p className="text-foreground/80 mt-2"><strong>Can be disabled?</strong> Yes, through your browser settings or cookie preferences.</p>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">3.4 Marketing and Advertising Cookies</h3>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-foreground/80 mb-2"><strong>Purpose:</strong> Currently, we do not use third-party advertising cookies.</p>
              <p className="text-foreground/80"><strong>Future Use:</strong> If we decide to use marketing cookies in the future, we will update this policy and request your consent.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Third-Party Cookies</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              In addition to our own cookies, we may use third-party services that set cookies on your device:
            </p>
            
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Payment Processing</h4>
                <p className="text-foreground/80">
                  Our payment gateway partners may set cookies to process transactions securely. We do not control these cookies.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Social Media Integration</h4>
                <p className="text-foreground/80">
                  Social media platforms (Facebook, Instagram, Twitter) may set cookies if you interact with social sharing buttons. These cookies are controlled by the respective social media platforms.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">WhatsApp Integration</h4>
                <p className="text-foreground/80">
                  Our WhatsApp support integration may use cookies to facilitate communication.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Cookie Duration</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">Cookies can be either:</p>
            
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Session Cookies</h4>
                <p className="text-foreground/80">
                  Temporary cookies that are deleted when you close your browser. These are used for essential website functionality like maintaining your shopping cart during your visit.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Persistent Cookies</h4>
                <p className="text-foreground/80">
                  Cookies that remain on your device for a set period or until you delete them. These help remember your preferences and provide a personalized experience on return visits. Duration typically ranges from 30 days to 1 year.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. How to Control Cookies</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              You have the right to decide whether to accept or reject cookies. You can control cookies through:
            </p>

            <h3 className="text-xl font-semibold mb-3 text-foreground">6.1 Browser Settings</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Block all cookies</li>
              <li>Allow only first-party cookies</li>
              <li>Delete cookies after each browsing session</li>
              <li>Accept or reject cookies on a case-by-case basis</li>
            </ul>

            <p className="text-foreground/80 leading-relaxed mt-4 mb-4">
              <strong>How to manage cookies in popular browsers:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Mozilla Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
              <li><strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">6.2 Cookie Preference Center (Future)</h3>
            <p className="text-foreground/80 leading-relaxed">
              We are working on implementing a Cookie Preference Center that will allow you to easily manage your cookie preferences directly on our website without changing browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Impact of Disabling Cookies</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              If you choose to disable cookies, please note that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>You may not be able to log in or use account features</li>
              <li>Your shopping cart may not function properly</li>
              <li>You will need to re-enter preferences on each visit</li>
              <li>Some pages may not display correctly</li>
              <li>Your user experience may be significantly reduced</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Updates to This Policy</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any significant changes by posting a notice on our website or updating the "Last Updated" date at the top of this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. More Information</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              For more information about cookies and how they work, visit:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>All About Cookies:</strong> www.allaboutcookies.org</li>
              <li><strong>Network Advertising Initiative:</strong> www.networkadvertising.org</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Contact Us</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground/80"><strong>Email:</strong> privacy@bmkicks.com</p>
              <p className="text-foreground/80"><strong>Website:</strong> www.bmkicks.com</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
