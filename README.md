# Kanishka Collection — demo website

A responsive, static fashion retail website with a boutique-style landing page, category filters, sample product cards, subtle scroll reveals, Google Maps embed, contact links, and WhatsApp enquiry/order messages. It uses plain HTML, CSS and JavaScript, so it can be hosted on almost any static hosting provider.

## Run locally

Open `index.html` in a browser, or run a local server from this folder:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy

Upload the contents of this folder to any static host, for example:
- Hostinger shared hosting: upload files into `public_html`
- Netlify / Cloudflare Pages: deploy this folder as a static site
- Any Nginx server: point the site's document root to this folder

No build command or package installation is required.

## Before presenting to the client / publishing

1. **Confirm the WhatsApp number** in `script.js` (`WHATSAPP_NUMBER`). It is currently set to `919792929364` based on the details supplied.
2. **Verify the email address** `kanishkacollection@gmail.com` in `index.html`. This address was used as a demo contact and should be confirmed by the store owner before launch.
3. Product names, prices, catalogue photos and the rating text are **illustrative demo content**. Confirm real inventory, prices, product photos, and review rating with the client. The site intentionally does not take online payments or confirm orders.
4. Verify opening hours, address, map pin, and Instagram account with the store.
5. Replace external Unsplash images with the store's own product photography for the final site. Google Fonts, Maps and Unsplash images require internet access.
6. Update the page title and meta description if the business wants a different SEO positioning.

## WhatsApp & Cart Flow

1. **Multi-Item Shopping Bag**: Customers can click "+ Add to Bag" on multiple products across ladieswear, menswear and kidswear.
2. **Interactive Cart Drawer**: Clicking "Bag" in the header or the floating bag pill opens the drawer, displaying selected items, thumbnails, real-time quantity controls (`+`/`-`), and subtotal calculation.
3. **Multi-Item WhatsApp Checkout**: Clicking "Order on WhatsApp" prepares a formatted summary with item names, quantities, unit prices, subtotal, and customer name/size notes.
4. **Single-Item Quick Order**: Individual "Order ↗" buttons remain available on every product card for instant 1-click orders.

## Minimal Motion & Animations

- **Cart Badge Pop**: Elastic pulse when items are added or quantities change.
- **Button Feedback**: "+ Add to Bag" micro-animation switches to "✓ Added!" with green confirmation.
- **Drawer Motion**: Smooth slide-in transition with backdrop blur and staggered item fade.
- **Hero & Floating Elements**: Subtle organic sway on the hero family edit stamp and floating note.
- **Wishlist Heart**: Spring pop animation when toggling favorites.
- **Respects Motion Preferences**: All animations safely disable under `prefers-reduced-motion: reduce`.

## Project structure

- `index.html` — page content, navigation, product cards, cart drawer modal, store information and footer
- `styles.css` — responsive visual design system, cart drawer, floating buttons, micro-animations, and mobile styles
- `script.js` — cart state management (localStorage), WhatsApp message compiler, category filters, favourites, and scroll reveals

## Suggested client demo agenda

1. Show the responsive hero and brand positioning.
2. Filter ladieswear, menswear and kidswear.
3. Click an item's Order button and show the pre-filled WhatsApp message.
4. Show the map, contact actions and mobile layout.
5. Explain the next phase: owner-managed catalogue, real product photography, analytics/SEO, and optional inventory/admin features.
