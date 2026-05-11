export default function TermsPage() {
  return (
    <div className="page-enter container section" style={{ maxWidth: 800 }}>
      <h1 className="heading-xl" style={{ marginBottom: 40 }}>Terms & Conditions</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        <section>
          <h2 className="heading-md" style={{ color: 'var(--dark)', marginBottom: 12 }}>1. Introduction</h2>
          <p>
            Welcome to Aurangzaib Garments. By accessing our website and placing an order, you agree to comply with and be bound by the following terms and conditions. These terms govern your use of our website and the purchase of our products.
          </p>
        </section>

        <section>
          <h2 className="heading-md" style={{ color: 'var(--dark)', marginBottom: 12 }}>2. Product Information</h2>
          <p>
            We strive to display our products as accurately as possible. However, the actual colors you see may depend on your monitor settings. We cannot guarantee that your monitor's display of any color will be accurate. All products are subject to availability.
          </p>
        </section>

        <section>
          <h2 className="heading-md" style={{ color: 'var(--dark)', marginBottom: 12 }}>3. Pricing & Payments</h2>
          <p>
            All prices are in Pakistani Rupees (PKR). We reserve the right to change prices at any time without prior notice. Currently, we offer Cash on Delivery (COD) as the primary payment method. Payment must be made in full at the time of delivery.
          </p>
        </section>

        <section>
          <h2 className="heading-md" style={{ color: 'var(--dark)', marginBottom: 12 }}>4. Shipping & Delivery</h2>
          <p>
            We deliver nationwide across Pakistan. Delivery times may vary based on your location. Standard delivery typically takes 3-5 business days. We offer free delivery on orders above Rs. 2,000.
          </p>
        </section>

        <section>
          <h2 className="heading-md" style={{ color: 'var(--dark)', marginBottom: 12 }}>5. Returns & Exchanges</h2>
          <p>
            Items can be returned or exchanged within 7 days of delivery, provided they are in their original condition with tags intact. Please contact our support team for return instructions. Shipping costs for returns are the responsibility of the customer unless the product is defective.
          </p>
        </section>

        <section>
          <h2 className="heading-md" style={{ color: 'var(--dark)', marginBottom: 12 }}>6. Contact Information</h2>
          <p>
            If you have any questions regarding these terms, please contact us at support@aurangzaib.com or via WhatsApp at +92 300 123 4567.
          </p>
        </section>
      </div>
    </div>
  )
}
