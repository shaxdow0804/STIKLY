// Static site copy. Edit freely. Policy text here is a template: confirm it matches your real operations.
export const whyUs = [
  { icon: 'Printer', title: 'Premium print quality', text: 'Sharp, saturated colour printed on quality vinyl so details stay crisp.' },
  { icon: 'ShieldCheck', title: 'Durable materials', text: 'Waterproof vinyl with a protective laminate for bottles, laptops and helmets.' },
  { icon: 'Sparkles', title: 'Unique designs', text: 'Original artwork you will not find on a generic marketplace.' },
  { icon: 'Wallet', title: 'Affordable pricing', text: 'Singles from ₹99 and packs that make a sticker wall cheap.' },
  { icon: 'Lock', title: 'Secure checkout', text: 'Payments go through a certified provider. We never see your card details.' },
];

export const faqs = [
  { q: 'How long does shipping take?', a: 'Orders are packed within 1–2 business days. Delivery typically takes 4–7 business days across India. Shipping is ₹49, and free on orders of ₹499 or more.' },
  { q: 'What is your return policy?', a: 'If your stickers arrive damaged or wrong, message us within 7 days of delivery with a photo and we will replace them or refund you. Custom orders are made to order and can only be replaced if they arrive damaged or misprinted.' },
  { q: 'How good is the sticker quality?', a: 'Our stickers are printed on waterproof vinyl with a protective laminate. They are made for laptops, bottles, phones and notebooks. Avoid soaking them for long periods or scrubbing with abrasive cleaners.' },
  { q: 'Can I order custom stickers?', a: 'Yes. Use the Custom Sticker Studio: upload an image, add optional text, choose a finish and quantity (minimum 5). We review each request and contact you if the artwork needs changes.' },
  { q: 'Which payment methods do you accept?', a: 'Online payment through our payment partner (UPI, cards, netbanking) and cash on delivery where available. Checkout shows exactly which options are currently enabled.' },
  { q: 'How do I track my order?', a: 'Use the Track Order page with your order number and the email used at checkout. You will see the latest status: pending, confirmed, shipped or delivered.' },
];

export const seedReviews = [
  { id: 'r1', productId: 'p-acid-chrome-smile', name: 'Aarav M.', rating: 5, title: 'Looks unreal in sunlight', body: 'The holographic finish on the chrome smile is way better than I expected. It is now the centrepiece of my laptop.', avatar: '/images/av-3.webp', verified: false, status: 'approved', createdAt: '2026-11-10T10:00:00Z' },
  { id: 'r2', productId: 'p-midnight-tokyo-ramen', name: 'Riya S.', rating: 5, title: 'Colours are so rich', body: 'Perfect size for my notebook. The ink lines are sharp and the colours match the photos.', avatar: '/images/av-1.webp', verified: false, status: 'approved', createdAt: '2026-11-02T10:00:00Z' },
  { id: 'r3', productId: 'p-anime-mega-pack', name: 'Kabir T.', rating: 4, title: 'Great value pack', body: 'Ten stickers for the price of two singles elsewhere. Peeled off the sheet cleanly.', avatar: '/images/av-2.webp', verified: false, status: 'approved', createdAt: '2026-10-28T10:00:00Z' },
  { id: 'r4', productId: 'p-pixel-gameboy', name: 'Meera P.', rating: 5, title: 'Instant nostalgia', body: 'Stuck it on my console. Survived a month of wiping down with no peeling at all.', avatar: '/images/av-1.webp', verified: false, status: 'approved', createdAt: '2026-10-19T10:00:00Z' },
  { id: 'r5', productId: 'p-laptop-starter-bundle', name: 'Dev K.', rating: 5, title: 'Laptop lid sorted', body: 'The bundle looks cohesive together. Easy to apply without bubbles.', avatar: '/images/av-3.webp', verified: false, status: 'approved', createdAt: '2026-10-11T10:00:00Z' },
  { id: 'r6', productId: 'p-cosmic-jellyfish', name: 'Ananya R.', rating: 4, title: 'Gorgeous finish', body: 'The iridescence is subtle indoors and stunning outside. Wish there were more sizes.', avatar: '/images/av-2.webp', verified: false, status: 'approved', createdAt: '2026-11-14T10:00:00Z' },
];

export const policies = {
  shipping: { title: 'Shipping Policy', body: ['Orders are packed within 1–2 business days.', 'Standard delivery across India takes 4–7 business days. Remote locations may take longer.', 'Shipping is ₹49 per order, and free for orders of ₹499 or more.', 'You can follow your order any time on the Track Order page.'] },
  returns: { title: 'Returns & Refunds', body: ['Received a damaged, misprinted or wrong item? Contact us within 7 days of delivery with a photo and we will replace it or refund you.', 'Because custom stickers are made to order, they are replaceable only if they arrive damaged or misprinted.', 'Approved refunds go back to the original payment method.'] },
  privacy: { title: 'Privacy Policy', body: ['We collect only what we need to fulfil your order: name, email, phone and delivery address.', 'We never store card details. Payments are handled by our payment provider.', 'Uploaded custom artwork is used only to produce your order.', 'Email us any time to access or delete your data.'] },
  terms: { title: 'Terms of Service', body: ['By placing an order you confirm the details you provide are accurate.', 'Custom artwork must be yours to use. We may decline designs that infringe copyright or contain hateful or unlawful content.', 'Prices are in Indian rupees and include applicable taxes unless stated otherwise.'] },
};
