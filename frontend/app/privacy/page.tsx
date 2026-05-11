export default function PrivacyPage() {
  return (
    <div className="page-enter container section" style={{ maxWidth: 800 }}>
      <h1 className="heading-xl" style={{ marginBottom: 40 }}>Privacy Policy</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        <section>
          <h2 className="heading-md" style={{ color: 'var(--dark)', marginBottom: 12 }}>1. Information We Collect</h2>
          <p>
            When you visit Aurangzaib Garments or place an order, we collect certain information to provide a better shopping experience. This includes your name, phone number, email address, and delivery address.
          </p>
        </section>

        <section>
          <h2 className="heading-md" style={{ color: 'var(--dark)', marginBottom: 12 }}>2. How We Use Your Information</h2>
          <p>
            We use your information to process your orders, communicate with you about your order status, and provide customer support. We may also send you promotional emails or messages about new arrivals and special offers if you opt-in.
          </p>
        </section>

        <section>
          <h2 className="heading-md" style={{ color: 'var(--dark)', marginBottom: 12 }}>3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information. Your data is stored securely and is only accessible by authorized personnel for order fulfillment and support.
          </p>
        </section>

        <section>
          <h2 className="heading-md" style={{ color: 'var(--dark)', marginBottom: 12 }}>4. Third-Party Services</h2>
          <p>
            We do not sell your personal information to third parties. We may share necessary details (like name and address) with our logistics partners to ensure successful delivery of your orders.
          </p>
        </section>

        <section>
          <h2 className="heading-md" style={{ color: 'var(--dark)', marginBottom: 12 }}>5. Cookies</h2>
          <p>
            Our website uses cookies to enhance your browsing experience, remember your cart items, and analyze traffic patterns. You can manage your cookie preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="heading-md" style={{ color: 'var(--dark)', marginBottom: 12 }}>6. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information stored with us. You can do this through your profile settings or by contacting our support team.
          </p>
        </section>
      </div>
    </div>
  )
}
