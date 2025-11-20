import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ReturnPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Return & Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: January 15, 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Overview</h2>
            <p className="text-foreground/80 leading-relaxed">
              At BM Kicks, we want you to be completely satisfied with your purchase. If you're not happy with your order, we offer a straightforward return and refund process. Please read this policy carefully to understand your rights and our procedures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Return Window</h2>
            <p className="text-foreground/80 leading-relaxed">
              You have <strong>14 calendar days</strong> from the date of delivery to return your purchase. Returns initiated after this period will not be accepted. The return period starts from the day you (or a third party you designate) physically receives the product.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Return Conditions</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              To be eligible for a return, your item must meet the following conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>Unworn and Unused:</strong> The sneakers must be in new, unworn condition with no signs of wear, dirt, or scuffs</li>
              <li><strong>Original Packaging:</strong> All items must be returned in their original box with all tags, labels, and accessories included</li>
              <li><strong>Original Condition:</strong> The product must be in the same condition as when you received it</li>
              <li><strong>Proof of Purchase:</strong> You must provide the order number or receipt as proof of purchase</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              <strong>Note:</strong> We recommend trying on sneakers indoors on clean, soft surfaces only. Any signs of outdoor wear will make the item ineligible for return.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Non-Returnable Items</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              The following items are non-returnable:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Clearance or final sale items (clearly marked as such on the product page)</li>
              <li>Limited edition releases with "No Return" designation</li>
              <li>Items returned after 14 days from delivery</li>
              <li>Worn, damaged, or altered products</li>
              <li>Items without original packaging, tags, or labels</li>
              <li>Custom or personalized orders</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. How to Initiate a Return</h2>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Step 1: Contact Us</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Email us at <strong>returns@bmkicks.com</strong> with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Your order number</li>
              <li>Item(s) you wish to return</li>
              <li>Reason for return</li>
              <li>Photos of the item (if defective or damaged)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">Step 2: Receive Authorization</h3>
            <p className="text-foreground/80 leading-relaxed">
              Our team will review your request within 24-48 hours and provide you with a Return Authorization Number (RAN) and return instructions. Do not ship items back without authorization, as unauthorized returns may not be accepted.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">Step 3: Pack and Ship</h3>
            <p className="text-foreground/80 leading-relaxed">
              Carefully pack the item in its original box and packaging. Include the Return Authorization Number inside the package. Ship the item using a trackable shipping method and retain the tracking number for your records.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">Step 4: Inspection and Refund</h3>
            <p className="text-foreground/80 leading-relaxed">
              Once we receive your return, we will inspect the item within 3-5 business days. If approved, your refund will be processed according to our refund policy below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Return Shipping Costs</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              <strong>Standard Returns:</strong> Customers are responsible for return shipping costs unless the item is defective, damaged, or incorrect.
            </p>
            <p className="text-foreground/80 leading-relaxed mb-4">
              <strong>Defective or Incorrect Items:</strong> If you receive a defective, damaged, or incorrect item, we will provide a prepaid return shipping label at no cost to you.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              We recommend using a trackable shipping service with insurance, as we are not responsible for lost or damaged return shipments.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Refund Policy</h2>
            <h3 className="text-xl font-semibold mb-3 text-foreground">7.1 Processing Time</h3>
            <p className="text-foreground/80 leading-relaxed">
              Once your return is received and inspected, we will process your refund within <strong>5-7 business days</strong>. You will receive an email notification when your refund has been processed.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">7.2 Refund Method</h3>
            <p className="text-foreground/80 leading-relaxed">
              Refunds will be issued to the original payment method used for the purchase. Depending on your bank or credit card company, it may take an additional 5-10 business days for the refund to appear in your account.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">7.3 Partial Refunds</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              In some cases, only partial refunds may be granted:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Items with obvious signs of use or minor damage</li>
              <li>Items returned without original packaging or tags</li>
              <li>Items returned more than 14 days after delivery</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              We will notify you if a partial refund is applicable and the amount before processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Exchanges</h2>
            <p className="text-foreground/80 leading-relaxed">
              We currently offer exchanges on a case-by-case basis, subject to product availability. If you would like to exchange an item for a different size or color, please contact us at <strong>support@bmkicks.com</strong> to check availability before initiating a return.
            </p>
            <p className="text-foreground/80 leading-relaxed mt-4">
              <strong>Exchange Process:</strong> If an exchange is available, we will provide instructions. You may need to return the original item and place a new order, or we may arrange a direct exchange depending on the situation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Defective or Damaged Items</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              If you receive a defective or damaged item, please contact us immediately at <strong>support@bmkicks.com</strong> with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Your order number</li>
              <li>Clear photos showing the defect or damage</li>
              <li>Description of the issue</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mt-4">
              We will provide a resolution, which may include a full refund, replacement, or exchange at no additional cost to you, including return shipping.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Authenticity Guarantee</h2>
            <p className="text-foreground/80 leading-relaxed">
              All products sold by BM Kicks are guaranteed to be 100% authentic. If you receive a product that is not authentic, we will provide a full refund including all shipping costs. Please see our Authenticity Guarantee page for more details on how we verify authenticity and our authentication process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Cancellations</h2>
            <p className="text-foreground/80 leading-relaxed">
              You may cancel your order within <strong>2 hours</strong> of placing it by contacting us immediately at <strong>support@bmkicks.com</strong>. Once an order has been processed and shipped, it cannot be cancelled, but you may return it according to our return policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Questions and Contact</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have any questions about our Return & Refund Policy, please contact us:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground/80"><strong>Email:</strong> returns@bmkicks.com</p>
              <p className="text-foreground/80"><strong>Support:</strong> support@bmkicks.com</p>
              <p className="text-foreground/80"><strong>Phone:</strong> Available through WhatsApp support</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
