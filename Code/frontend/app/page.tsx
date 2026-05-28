export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">🏠⚓ HomePort</div>
          <a href="/auth/login" className="text-accent hover:underline">Login</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-card-sand to-background py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold text-primary mb-6">
            Your Safe Harbor in Real Estate
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            AI-powered workflows for smarter buying and selling
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a 
              href="/auth/login?role=seller"
              className="bg-accent text-white px-8 py-3 rounded-lg hover:bg-accent/90 transition"
            >
              Get Started as Seller
            </a>
            <a 
              href="/auth/login?role=buyer"
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition"
            >
              Get Started as Buyer
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg border">
              <h3 className="text-2xl font-semibold mb-4 text-accent">For Sellers</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>AI-generated marketing content for social media, MLS, and brochures</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Vision-based property improvement insights</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Smart pricing strategy with comparable sales analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Real-time offer management with AI recommendations</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg border">
              <h3 className="text-2xl font-semibold mb-4 text-primary">For Buyers</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Intelligent property matching based on your preferences</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Fair value analysis with comparable sales data</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>AI-powered negotiation strategy support</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Instant offer submission with real-time updates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card-sand py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What People Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4 text-muted-foreground italic">
                "HomePort's AI helped me price my listing perfectly. Sold in 3 days!"
              </p>
              <p className="font-semibold">- Sarah M., Seller</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4 text-muted-foreground italic">
                "The comp analysis saved me $15K on my purchase. Incredible value."
              </p>
              <p className="font-semibold">- James T., Buyer</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4 text-muted-foreground italic">
                "Finally, a platform that works for both sides of the deal seamlessly."
              </p>
              <p className="font-semibold">- Lisa K., Realtor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <p className="text-lg font-semibold">🏠⚓ HomePort</p>
            <p className="text-sm text-gray-300 mt-2">Your safe harbor in real estate</p>
          </div>
          <div className="text-center">
            <p className="text-sm">© 2024 HomePort. All rights reserved.</p>
            <div className="mt-4 space-x-6 text-sm">
              <a href="#" className="hover:underline">About</a>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
              <a href="#" className="hover:underline">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
