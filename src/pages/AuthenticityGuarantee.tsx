import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, CheckCircle, Search, Package, Award, AlertCircle } from "lucide-react";

export default function AuthenticityGuarantee() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Authenticity Guarantee</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: January 15, 2025</p>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">100% Authentic Guarantee</h2>
          <p className="text-foreground/80 text-lg leading-relaxed">
            At BM Kicks, we guarantee that every single product we sell is 100% authentic. We stand behind our promise with a full money-back guarantee if any product is found to be counterfeit.
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Our Commitment</h2>
            <p className="text-foreground/80 leading-relaxed">
              Authenticity is the foundation of our business. We understand that when you purchase premium sneakers, you expect genuine products from trusted brands. BM Kicks is committed to sourcing and selling only authentic merchandise, and we take this responsibility seriously.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. How We Ensure Authenticity</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Authorized Sources Only</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    We source all our products directly from authorized retailers, official brand distributors, and verified suppliers. We maintain strict partnerships and documented relationships with all our suppliers to ensure a clear chain of custody.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Multi-Point Verification</h3>
                  <p className="text-foreground/80 leading-relaxed mb-3">
                    Every product undergoes a thorough authentication process before being listed on our website. Our verification includes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                    <li>Visual inspection of product quality, stitching, and materials</li>
                    <li>Verification of packaging, labels, and tags</li>
                    <li>Examination of serial numbers and product codes</li>
                    <li>Authentication of holograms and security features</li>
                    <li>Comparison with official brand specifications</li>
                    <li>UV light testing for authentic materials</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Expert Authentication Team</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Our authentication team consists of trained professionals with years of experience in the sneaker industry. They are experts in identifying authentic products and detecting counterfeits. Our team stays updated on the latest authentication techniques and counterfeit detection methods.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Secure Supply Chain</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    We maintain complete control and documentation of our supply chain from the moment we receive products until they are delivered to you. All products are stored in secure facilities with strict inventory management to prevent any mixing with unauthorized items.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. What Makes a Sneaker Authentic?</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Authentic sneakers have specific characteristics that distinguish them from counterfeits:
            </p>
            
            <div className="bg-muted p-6 rounded-lg space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Build Quality</h4>
                <p className="text-foreground/80">Premium materials, precise stitching, and superior craftsmanship that meets brand standards.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Packaging</h4>
                <p className="text-foreground/80">Original shoebox with correct labeling, tissue paper, and any included accessories.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Labels and Tags</h4>
                <p className="text-foreground/80">Accurate product codes, size labels, and hang tags with proper formatting and holograms.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Details</h4>
                <p className="text-foreground/80">Logos, emblems, and branding match official specifications exactly.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Documentation</h4>
                <p className="text-foreground/80">Purchase receipts and proof of authenticity from authorized sources.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. How You Can Verify Authenticity</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              When you receive your sneakers from BM Kicks, you can verify authenticity by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>Inspect the Box:</strong> Check that the box is in good condition with proper labeling and matches the product inside.</li>
              <li><strong>Check the Product Code:</strong> Verify that the product code on the box matches the code on the shoe label.</li>
              <li><strong>Examine Quality:</strong> Look for high-quality materials, even stitching, and proper glue application.</li>
              <li><strong>Compare with Official Images:</strong> Compare your sneakers with official product images from the brand's website.</li>
              <li><strong>Request Documentation:</strong> Contact us for proof of purchase from our authorized suppliers (we can provide this upon request).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Our Guarantee to You</h2>
            
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3 text-foreground">If You Receive a Counterfeit Product</h3>
              <p className="text-foreground/80 leading-relaxed mb-4">
                While we have stringent authentication processes in place, if you believe you have received a counterfeit product, we will:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                <li>Provide a <strong>full refund</strong> of the purchase price</li>
                <li>Cover <strong>all return shipping costs</strong></li>
                <li>Offer a <strong>replacement</strong> with a guaranteed authentic product (if available)</li>
                <li>Provide <strong>additional compensation</strong> for the inconvenience (store credit or discount on future purchases)</li>
              </ul>
              <p className="text-foreground/80 leading-relaxed mt-4">
                <strong>No questions asked.</strong> Your satisfaction and trust are our top priorities.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. How to Report Authenticity Concerns</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              If you have any concerns about the authenticity of a product you received from BM Kicks:
            </p>
            
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-foreground">Step 1: Document Your Concerns</h3>
              <p className="text-foreground/80 mb-3">Take clear photos of:</p>
              <ul className="list-disc pl-6 space-y-1 text-foreground/80 mb-4">
                <li>The product from multiple angles</li>
                <li>Product labels and tags</li>
                <li>The shoebox and packaging</li>
                <li>Any specific details that concern you</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-foreground">Step 2: Contact Us Immediately</h3>
              <p className="text-foreground/80 mb-2">Email: <strong>authenticity@bmkicks.com</strong></p>
              <p className="text-foreground/80 mb-4">Include your order number, photos, and a description of your concerns.</p>

              <h3 className="text-xl font-semibold mb-3 text-foreground">Step 3: We Will Respond Within 24 Hours</h3>
              <p className="text-foreground/80 mb-4">Our authentication team will review your case and respond with next steps.</p>

              <h3 className="text-xl font-semibold mb-3 text-foreground">Step 4: Resolution</h3>
              <p className="text-foreground/80">We will arrange for the product to be returned (at our expense) and provide a refund or replacement based on your preference.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Third-Party Authentication</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you prefer to have your sneakers authenticated by a third-party service (such as CheckCheck, Legit Check, or other professional authentication services), we fully support this. If a reputable third-party authenticator determines that a product you purchased from BM Kicks is not authentic, we will honor their finding and provide a full refund plus all authentication costs.
            </p>
          </section>

          <section className="border-t border-border pt-8">
            <div className="flex gap-3 items-start bg-amber-50 dark:bg-amber-950/20 p-6 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Beware of Counterfeit Websites</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Only purchase from our official website (www.bmkicks.com) or authorized retail partners. We are not responsible for products purchased from unauthorized sellers, social media marketplaces, or third-party websites claiming to represent BM Kicks.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Our Promise</h2>
            <p className="text-foreground/80 leading-relaxed">
              BM Kicks was built on trust and authenticity. Every member of our team is dedicated to maintaining the highest standards of quality and honesty. When you shop with us, you can be confident that you are receiving genuine, authentic products every single time.
            </p>
            <p className="text-foreground/80 leading-relaxed mt-4 font-semibold">
              "The world under your kicks" - and we guarantee those kicks are 100% real.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Contact Our Authentication Team</h2>
            <p className="text-foreground/80 leading-relaxed">
              For any questions about authenticity, verification, or our authentication process:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground/80"><strong>Email:</strong> authenticity@bmkicks.com</p>
              <p className="text-foreground/80"><strong>General Support:</strong> support@bmkicks.com</p>
              <p className="text-foreground/80"><strong>Response Time:</strong> Within 24 hours</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
