import { Card } from "@/components/ui/card";
import { PageSEO } from "@/components/seo/PageSEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShieldCheck, Store, Gavel, Package } from "lucide-react";

export default function BrandDisclaimer() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageSEO title="Brand Disclaimer | BM Kicks" description="BM Kicks is an independent reseller. Read our brand and trademark disclaimer." path="/brand-disclaimer" />
      <Header />
      <main className="flex-1 bg-background pt-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Brand Disclaimer</h1>
            <p className="text-muted-foreground text-lg">
              Important information about BM Kicks and our relationship with brands
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-2 border-accent/20">
              <div className="flex gap-4">
                <Store className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">Independent Seller Status</h2>
                  <p className="text-foreground/80 mb-3">
                    BM Kicks is an independent seller and reseller of authentic sneakers and footwear. 
                    We operate as a standalone business entity and are <strong>not affiliated with, endorsed by, 
                    authorized by, or in any way officially connected</strong> to Nike, Inc., Adidas AG, 
                    New Balance Athletics, Inc., Brooks Sports, Inc., Jordan Brand, or any other footwear 
                    manufacturer or brand mentioned on our website.
                  </p>
                  <p className="text-foreground/80">
                    Our business model is based on sourcing genuine products from authorized retailers, 
                    distributors, and legitimate wholesale channels, then offering them to our customers 
                    with dedicated service and support.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex gap-4">
                <ShieldCheck className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">Product Authenticity Commitment</h2>
                  <p className="text-foreground/80 mb-3">
                    Despite being an independent seller, we guarantee that <strong>all products sold 
                    through BM Kicks are 100% authentic and genuine</strong>. We take extreme care in 
                    sourcing our inventory exclusively from:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-foreground/80 mb-3 ml-4">
                    <li>Authorized brand retailers and distributors</li>
                    <li>Verified wholesale suppliers with proven track records</li>
                    <li>Legitimate retail partners in good standing</li>
                    <li>Direct purchases from official brand stores and websites</li>
                  </ul>
                  <p className="text-foreground/80">
                    Every product undergoes our internal authentication verification process before being 
                    listed for sale. If you ever have concerns about the authenticity of any product you 
                    receive, please refer to our <a href="/authenticity-guarantee" className="text-accent hover:underline">
                    Authenticity Guarantee</a> policy.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex gap-4">
                <Gavel className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">Trademark & Intellectual Property</h2>
                  <p className="text-foreground/80 mb-3">
                    All brand names, logos, trademarks, and product names mentioned on this website are 
                    the property of their respective owners. These include but are not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-foreground/80 mb-3 ml-4">
                    <li><strong>Nike®</strong> - Registered trademark of Nike, Inc.</li>
                    <li><strong>Adidas®</strong> - Registered trademark of Adidas AG</li>
                    <li><strong>Air Jordan®</strong> - Registered trademark of Nike, Inc.</li>
                    <li><strong>New Balance®</strong> - Registered trademark of New Balance Athletics, Inc.</li>
                    <li><strong>Brooks®</strong> - Registered trademark of Brooks Sports, Inc.</li>
                  </ul>
                  <p className="text-foreground/80 mb-3">
                    We use these brand names and trademarks solely for the purpose of:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-foreground/80 mb-3 ml-4">
                    <li>Identifying the products we sell</li>
                    <li>Providing accurate product descriptions to our customers</li>
                    <li>Facilitating product search and discovery on our platform</li>
                  </ul>
                  <p className="text-foreground/80">
                    The use of these names and marks does not imply any affiliation with or endorsement 
                    by these brands. BM Kicks respects all intellectual property rights and complies with 
                    applicable trademark laws.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex gap-4">
                <Package className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">Warranty & Support Limitations</h2>
                  <p className="text-foreground/80 mb-3">
                    As an independent seller, please note the following regarding warranty and support:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-foreground/80 mb-3 ml-4">
                    <li>Manufacturer warranties may not apply to products purchased through BM Kicks</li>
                    <li>We provide our own customer satisfaction guarantee and return policy</li>
                    <li>For warranty claims, customers should contact BM Kicks directly, not the manufacturer</li>
                    <li>We cannot process warranty claims through official brand channels</li>
                  </ul>
                  <p className="text-foreground/80">
                    However, we stand behind every product we sell. If you experience any issues with your 
                    purchase, please contact our customer support team, and we will work with you to find a 
                    satisfactory resolution according to our <a href="/return-policy" className="text-accent hover:underline">
                    Return Policy</a>.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-muted/50">
              <h2 className="text-2xl font-bold mb-3">Legal Statement</h2>
              <p className="text-foreground/80 mb-3">
                BM Kicks operates in compliance with all applicable laws governing the resale of authentic 
                consumer goods. The doctrine of "first sale" (also known as "exhaustion of rights") allows 
                us to legally resell genuine, authentic products that we have lawfully acquired.
              </p>
              <p className="text-foreground/80 mb-3">
                We do not sell counterfeit, replica, or unauthorized products. Any suggestion or claim to 
                the contrary is false and may be subject to legal action.
              </p>
              <p className="text-foreground/80">
                This disclaimer is subject to change without notice. Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </Card>

            <div className="mt-8 p-6 bg-accent/10 rounded-lg border border-accent/20">
              <h3 className="text-xl font-bold mb-3">Questions or Concerns?</h3>
              <p className="text-foreground/80 mb-3">
                If you have any questions about this disclaimer, the authenticity of our products, or our 
                relationship with brands, please don't hesitate to contact us:
              </p>
              <ul className="space-y-2 text-foreground/80">
                <li>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:legal@bmkicks.shop" className="text-accent hover:underline">
                    legal@bmkicks.shop
                  </a>
                </li>
                <li>
                  <strong>WhatsApp:</strong>{" "}
                  <a href="https://wa.me/97433467115" className="text-accent hover:underline">
                    +974 3346 7115
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
