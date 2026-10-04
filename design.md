# Rinjani Clothing — Design System & UI/UX Specification

> Project type: Full-stack clothing brand catalog + admin inventory management
> Brand: Rinjani Clothing
> Primary language: Indonesian
> Design direction: Premium, minimal, editorial, modern outdoor/streetwear
> Reference direction:
> - Humblezing — visual/editorial direction and catalog experience
> - Cititex — apparel catalog, product information, and custom-printing/order-contact flow
>
> IMPORTANT:
> The references are used only as design and UX inspiration.
> Do NOT copy their logos, assets, text, source code, exact layouts, or proprietary visual assets.
> Rinjani Clothing must have its own visual identity.

---

# 1. PROJECT OVERVIEW

Rinjani Clothing is a clothing brand website focused on:

1. Product catalog
2. Clothing product discovery
3. Product detail
4. Custom/screen-printing information
5. Direct customer contact with admin
6. Inventory management
7. Admin authentication
8. Product CRUD
9. Category management
10. Stock management
11. Contact-channel configuration

The website is NOT primarily an e-commerce checkout platform.

Customers browse products and contact the administrator through configured communication channels such as:

- WhatsApp
- Telegram

The final order confirmation, availability confirmation, payment, shipping, and other transaction details are handled by the administrator through the selected messaging application.

---

# 2. PRODUCT GOALS

## Customer Goals

Customers should be able to:

- Understand the brand immediately
- Browse products comfortably
- Discover collections
- Filter products
- Open product details
- View price
- View stock availability
- Select size
- Select color
- Select quantity
- Contact the administrator
- Automatically send relevant product information through WhatsApp or Telegram
- Understand the custom-printing service
- Find brand/contact information

## Admin Goals

The owner/admin should be able to:

- Login securely
- View inventory
- Add products
- Edit products
- Delete products
- Update stock
- Manage categories
- Upload product images
- Configure WhatsApp
- Configure Telegram
- Enable/disable communication channels
- Configure the default order message
- Manage product visibility

---

# 3. DESIGN PHILOSOPHY

The visual experience should feel like a real clothing brand rather than a generic CRUD application.

The public website should prioritize:

- Photography
- Typography
- Whitespace
- Product discovery
- Editorial composition
- Simple navigation
- Strong visual hierarchy
- Minimal UI
- Fast interaction

Avoid:

- Excessive gradients
- Excessive rounded cards
- Generic SaaS dashboard aesthetics
- Excessive shadows
- Overly colorful UI
- Marketplace-style clutter
- Unnecessary badges
- Excessive animations
- Huge amounts of text

The design should feel:

- Premium
- Minimal
- Confident
- Urban
- Outdoor-inspired
- Contemporary
- Functional

---

# 4. VISUAL DIRECTION

## Reference Balance

Use the following conceptual balance:

### Humblezing influence

Primary influence:

- Editorial fashion presentation
- Large photography
- Minimal navigation
- Spacious layout
- Product-focused composition
- Collection-based presentation
- Strong typography
- Minimal UI controls

### Cititex influence

Secondary influence:

- Apparel-focused product organization
- Product information
- Categories
- Size/color selection
- Inventory awareness
- Custom printing service
- Direct customer communication

Do NOT attempt literal visual cloning.

The resulting website must feel like:

> Rinjani Clothing

not:

> Humblezing clone
> Cititex clone

---

# 5. BRAND IDENTITY

## Brand Name

RINJANI CLOTHING

Recommended display:

```text
RINJANI
CLOTHING
```

or:

```text
RINJANI CLOTHING
```

The wordmark should be typography-based unless an actual logo asset is provided.

---

# 6. COLOR SYSTEM

The initial visual system should use a restrained neutral palette.

## Primary

```css
--color-black: #111111;
--color-white: #FFFFFF;
--color-off-white: #F7F6F2;
```

## Secondary

```css
--color-gray-100: #F1F1EF;
--color-gray-200: #E5E5E2;
--color-gray-400: #A3A3A0;
--color-gray-600: #666662;
--color-gray-800: #292929;
```

## Accent

Use a subtle natural/outdoor accent only when needed.

Recommended:

```css
--color-earth: #6B6255;
```

Do not make the website heavily brown/green.

The dominant experience should remain monochrome.

---

# 7. TYPOGRAPHY

Use a modern sans-serif typography system.

Preferred:

```text
Inter
```

Alternative:

```text
Manrope
```

Use the selected font consistently.

## Typography hierarchy

### Display

Large editorial headlines.

```css
font-size: clamp(3rem, 7vw, 7rem);
font-weight: 500-700;
line-height: 0.95-1.05;
letter-spacing: -0.04em;
```

### H1

```css
font-size: clamp(2.5rem, 5vw, 5rem);
font-weight: 600;
line-height: 1;
```

### H2

```css
font-size: clamp(2rem, 3.5vw, 3.5rem);
font-weight: 600;
```

### H3

```css
font-size: 1.25rem;
font-weight: 600;
```

### Body

```css
font-size: 1rem;
line-height: 1.6;
```

### Small

```css
font-size: 0.75rem;
letter-spacing: 0.05em;
```

Uppercase labels may be used for:

- categories
- navigation metadata
- product status
- buttons

Do not uppercase large paragraphs.

---

# 8. LAYOUT SYSTEM

Use a responsive container.

Desktop:

```text
max-width: 1440px
padding: 24px - 48px
```

Tablet:

```text
padding: 24px
```

Mobile:

```text
padding: 16px
```

Use generous vertical spacing.

Recommended spacing scale:

```text
4px
8px
12px
16px
24px
32px
48px
64px
96px
128px
```

Avoid inconsistent arbitrary spacing.

---

# 9. BORDER RADIUS

The brand should not look overly rounded.

Default:

```text
border-radius: 0
```

Small UI elements may use:

```text
4px
6px
8px
```

Buttons should generally use subtle or zero radius.

Cards should generally be square or minimally rounded.

---

# 10. SHADOWS

Use shadows sparingly.

Avoid large box shadows.

Preferred:

```css
border: 1px solid var(--color-gray-200);
```

Use shadows only for floating elements such as:

- dropdowns
- modal
- mobile navigation
- floating action elements

---

# 11. GLOBAL HEADER

The header is one of the most important components.

Desktop layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ RINJANI CLOTHING    SHOP   COLLECTION   CUSTOM   ABOUT   ◎ │
└─────────────────────────────────────────────────────────────┘
```

Header should:

- Be minimal
- Have high whitespace
- Remain readable over backgrounds
- Support transparent/overlay mode on hero
- Become solid when scrolling if necessary

## Navigation

Primary:

```text
Shop
Collections
Custom
About
```

Secondary:

```text
Search
Instagram
Contact
```

Admin should NOT appear in public navigation.

Admin login is accessed through:

```text
/admin/login
```

Do not display obvious "Admin Login" to normal customers unless explicitly desired.

---

# 12. MOBILE HEADER

Mobile:

```text
┌─────────────────────────────────┐
│ RINJANI CLOTHING          MENU  │
└─────────────────────────────────┘
```

Menu opens full-screen or large overlay navigation.

Example:

```text
SHOP

All Products
T-Shirts
Oversize
Long Sleeve
Hoodies
Accessories

COLLECTION

CUSTOM
ABOUT
CONTACT
```

Include smooth open/close animation.

Do not make the mobile menu overly complex.

---

# 13. HOMEPAGE

Route:

```text
/
```

The homepage should feel like an editorial fashion landing page.

Recommended sections:

1. Hero
2. Featured Collection
3. New Arrivals
4. Brand Statement
5. Custom Printing
6. Selected Products
7. Contact CTA
8. Footer

---

# 14. HERO SECTION

Hero should be image-driven.

Desktop:

```text
┌───────────────────────────────────────────────────────────┐
│                                                           │
│                     LARGE IMAGE                           │
│                                                           │
│ RINJANI                                                   │
│ MADE FOR THE JOURNEY                                      │
│                                                           │
│ [ EXPLORE COLLECTION ]                                    │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

Hero image should occupy approximately:

```text
70-100vh
```

depending on the image and layout.

Do not use generic stock photography if actual brand photography is available.

Hero overlay should remain readable.

If text overlays image:

- Use strong contrast
- Add subtle overlay only when required
- Do not heavily darken the image

---

# 15. BRAND STATEMENT

Example concept:

```text
MADE FOR THE JOURNEY.

Rinjani Clothing creates everyday apparel
inspired by movement, nature, and urban culture.
```

Keep copy short.

Do not fill the page with marketing paragraphs.

---

# 16. FEATURED COLLECTION

Large editorial grid.

Example:

```text
┌───────────────────────────┐
│                           │
│       COLLECTION          │
│          IMAGE            │
│                           │
│ Oversized Collection      │
└───────────────────────────┘

┌───────────────┐ ┌───────────────┐
│     IMAGE     │ │     IMAGE     │
│               │ │               │
│ Graphic Tee   │ │ Outdoor Line  │
└───────────────┘ └───────────────┘
```

Use asymmetric editorial layouts where appropriate.

---

# 17. PRODUCT GRID

Product cards should be image-first.

Desktop:

```text
4 columns
```

Large desktop:

```text
4 columns
```

Tablet:

```text
3 columns
```

Mobile:

```text
2 columns
```

Example:

```text
┌──────────────┐ ┌──────────────┐
│              │ │              │
│ PRODUCT IMG  │ │ PRODUCT IMG  │
│              │ │              │
└──────────────┘ └──────────────┘
Rinjani Tee      Mountain Tee
Rp 125.000       Rp 135.000
```

Avoid putting product information inside heavy cards.

---

# 18. PRODUCT CARD

Required information:

- Product image
- Product name
- Price
- Optional category
- Stock status when necessary

Example:

```text
RINJANI MOUNTAIN TEE
Rp 125.000
```

If sold out:

```text
RINJANI MOUNTAIN TEE
SOLD OUT
```

Do not use excessive badges.

---

# 19. PRODUCT IMAGE BEHAVIOR

On hover:

- Slight image zoom
- Optional secondary image
- Smooth transition

Example:

```css
transform: scale(1.03);
```

Animation duration:

```text
250ms - 400ms
```

Keep animation subtle.

Respect:

```text
prefers-reduced-motion
```

---

# 20. SHOP PAGE

Route:

```text
/shop
```

Layout:

```text
SHOP

[ All ] [ T-Shirts ] [ Oversize ] [ Hoodie ] [ Long Sleeve ]

Sort:
[ Newest ]

-------------------------------------

Product Grid
```

Filters should remain simple.

Do not build a complicated marketplace filter system.

Potential filters:

- Category
- Size
- Color
- Availability
- Price

Only display filters that are actually useful.

---

# 21. PRODUCT DETAIL PAGE

Route:

```text
/product/:slug
```

Desktop:

```text
┌──────────────────────────────┬──────────────────────────────┐
│                              │ PRODUCT NAME                  │
│                              │                              │
│        PRODUCT IMAGE         │ Rp 125.000                   │
│                              │                              │
│                              │ Description                  │
│                              │                              │
│                              │ Size                         │
│                              │ [S] [M] [L] [XL]             │
│                              │                              │
│                              │ Color                        │
│                              │ [Black] [White]              │
│                              │                              │
│                              │ Quantity [-] 1 [+]            │
│                              │                              │
│                              │ [ HUBUNGI ADMIN ]             │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
```

Product detail should include:

- Product name
- Price
- Description
- Product images
- Category
- Available sizes
- Available colors
- Stock
- Material
- Weight/gramasi if available
- Care instructions if available
- Contact Admin button

---

# 22. PRODUCT VARIANTS

Products may have:

```text
Sizes:
S
M
L
XL
XXL
```

Colors:

```text
Black
White
Cream
Navy
Brown
etc.
```

The admin should be able to configure variants.

If inventory is variant-specific, stock should be tracked per variant.

Example:

```text
Product: Rinjani Mountain Tee

Black / S  = 5
Black / M  = 8
Black / L  = 2
Black / XL = 0

White / S  = 4
White / M  = 6
White / L  = 4
White / XL = 1
```

If the initial implementation does not require variant-level inventory, design the data model so it can be extended later.

---

# 23. STOCK STATUS

Public status:

```text
AVAILABLE
LIMITED
SOLD OUT
```

Do not show exact inventory numbers publicly unless configured.

Admin sees exact stock numbers.

Suggested logic:

```text
stock > 5
→ AVAILABLE

stock > 0 && stock <= 5
→ LIMITED

stock === 0
→ SOLD OUT
```

This logic may be configurable later.

---

# 24. HUBUNGI ADMIN

This is a core feature.

The primary product CTA should be:

```text
HUBUNGI ADMIN
```

Not:

```text
BUY NOW
```

because the website does not perform direct checkout.

---

# 25. CONTACT ADMIN FLOW

When customer clicks:

```text
HUBUNGI ADMIN
```

open a contact selection modal.

Example:

```text
┌─────────────────────────────────────┐
│                                     │
│       HUBUNGI RINJANI CLOTHING      │
│                                     │
│  Pilih platform untuk melanjutkan   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ WhatsApp                      │  │
│  │ Chat dengan admin             │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Telegram                      │  │
│  │ Chat dengan admin             │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

Only show enabled platforms.

---

# 26. WHATSAPP INTEGRATION

WhatsApp should open a URL using the configured admin phone number.

The message should be generated dynamically.

Example:

```text
Halo Rinjani Clothing,

Saya ingin memesan:

Produk: Rinjani Mountain Tee
Ukuran: L
Warna: Black
Jumlah: 1

Link produk:
https://example.com/product/rinjani-mountain-tee
```

The actual WhatsApp URL should be generated by the application.

Do NOT hard-code the phone number into product components.

Use configuration from the database/settings API.

---

# 27. TELEGRAM INTEGRATION

Telegram should use the configured username.

Example:

```text
@rinjaniclothing
```

The system should open Telegram through the appropriate public profile/chat URL.

The selected product information can also be made available to the user through:

- generated text
- copied message
- URL query parameters where appropriate

Do not assume Telegram supports exactly the same pre-filled messaging behavior as WhatsApp.

The UX must remain graceful if automatic message prefill is unavailable.

---

# 28. ORDER MESSAGE TEMPLATE

Admin can configure a default template.

Example:

```text
Halo Rinjani Clothing,

Saya ingin memesan:

Produk: {{product_name}}
Ukuran: {{size}}
Warna: {{color}}
Jumlah: {{quantity}}

Link produk:
{{product_url}}
```

Supported variables:

```text
{{product_name}}
{{product_url}}
{{product_slug}}
{{price}}
{{size}}
{{color}}
{{quantity}}
```

If a variable is unavailable, omit it gracefully.

---

# 29. CUSTOM PRINTING PAGE

Route:

```text
/custom
```

Purpose:

Explain that Rinjani Clothing provides custom printing.

Sections:

1. Hero
2. Printing methods
3. Available apparel
4. How it works
5. Example work
6. Contact admin CTA

Example:

```text
CUSTOM PRINTING

Bawa desainmu.
Kami bantu mewujudkannya.

[ HUBUNGI ADMIN ]
```

Possible printing methods:

- DTF
- DTG
- Screen Printing

These should be editable/configurable in the future.

Do not claim technical specifications unless they are provided by the business.

---

# 30. ABOUT PAGE

Route:

```text
/about
```

Should communicate:

- Brand story
- Philosophy
- Product approach
- Inspiration
- Quality
- Custom printing

Use editorial layouts.

Example:

```text
ABOUT RINJANI

Clothing made for everyday movement.

[Large brand image]

OUR APPROACH

Short concise paragraph.
```

Avoid generic corporate About Us templates.

---

# 31. CONTACT PAGE

Route:

```text
/contact
```

Include:

- WhatsApp
- Telegram
- Instagram if configured
- Email if configured
- Address if configured

Use large typography.

Example:

```text
LET'S TALK.

Need help with an order?
Want to create custom apparel?

WhatsApp
Telegram
Instagram
```

---

# 32. FOOTER

Footer should be minimal.

Example:

```text
RINJANI CLOTHING

Shop
Collections
Custom
About
Contact

Instagram
WhatsApp
Telegram

© 2026 Rinjani Clothing
```

Do not overpopulate the footer.

---

# 33. SEARCH

Public search should allow searching:

- Product name
- Category
- Tags

Search UI:

```text
SEARCH

[ Search products... ]
```

Results should update efficiently.

On mobile, search may open as a full-screen interface.

---

# 34. ADMIN SYSTEM

Admin routes:

```text
/admin/login
/admin
/admin/products
/admin/products/new
/admin/products/:id
/admin/categories
/admin/settings
```

All admin routes except login require authentication.

Unauthenticated users should be redirected to:

```text
/admin/login
```

---

# 35. ADMIN LOGIN

Minimal UI.

```text
┌─────────────────────────────┐
│                             │
│       RINJANI CLOTHING      │
│           ADMIN             │
│                             │
│ Email                       │
│ [_______________________]   │
│                             │
│ Password                    │
│ [_______________________]   │
│                             │
│ [ LOGIN ]                   │
│                             │
└─────────────────────────────┘
```

Do not use the public fashion hero design here.

The admin login should still use the same typography and colors.

---

# 36. ADMIN DASHBOARD

Route:

```text
/admin
```

Dashboard should be functional rather than decorative.

Example:

```text
ADMIN DASHBOARD

Good evening.

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Products    │ │ Available   │ │ Sold Out    │
│ 42          │ │ 36          │ │ 6           │
└─────────────┘ └─────────────┘ └─────────────┘

Recent Products

Product             Stock      Status
---------------------------------------
Mountain Tee        12         Active
Rinjani Oversize    4          Limited
Trail Hoodie        0          Sold Out
```

Avoid excessive analytics.

This is primarily an inventory management system.

---

# 37. ADMIN SIDEBAR

Desktop:

```text
RINJANI
ADMIN

Dashboard

Catalog
  Products
  Categories

Inventory

Settings

Logout
```

Mobile:

Use a drawer.

---

# 38. ADMIN PRODUCTS PAGE

Route:

```text
/admin/products
```

Features:

- Search
- Filter
- Add product
- Edit
- Delete
- Change status
- Quick stock visibility

Table:

```text
┌──────────────────────────────────────────────────────────────┐
│ Products                               [ + Add Product ]     │
├──────────────────────────────────────────────────────────────┤
│ Search...                                                   │
├──────┬────────────────┬──────────┬────────┬─────────────────┤
│ IMG  │ Product        │ Category │ Stock  │ Actions         │
├──────┼────────────────┼──────────┼────────┼─────────────────┤
│ IMG  │ Mountain Tee   │ T-Shirt  │ 12     │ Edit  Delete    │
│ IMG  │ Rinjani Tee    │ Oversize │ 5      │ Edit  Delete    │
└──────┴────────────────┴──────────┴────────┴─────────────────┘
```

---

# 39. ADD PRODUCT

Route:

```text
/admin/products/new
```

Fields:

```text
Product Name
Slug
Description
Price
Category
Images
Sizes
Colors
Material
Weight
Stock
Status
Featured
```

Primary CTA:

```text
CREATE PRODUCT
```

Secondary:

```text
CANCEL
```

---

# 40. EDIT PRODUCT

Route:

```text
/admin/products/:id/edit
```

Same fields as Create Product.

Additional functionality:

- Preview product
- Update
- Delete
- View public page

---

# 41. DELETE PRODUCT

Deletion must require confirmation.

Example:

```text
Delete product?

"Rinjani Mountain Tee" will be permanently deleted.

[Cancel] [Delete]
```

Avoid accidental deletion.

If soft delete is implemented, preferred behavior is:

```text
active = false
```

rather than immediately destroying the record.

---

# 42. CATEGORIES

Admin can create:

```text
T-Shirts
Oversize
Long Sleeve
Hoodies
Accessories
Custom
```

Category fields:

```text
name
slug
description
image
display_order
active
```

Categories should be manageable from the admin panel.

---

# 43. INVENTORY

Inventory should be easy to understand.

Admin view:

```text
INVENTORY

Product                  Stock

Rinjani Mountain Tee     12
Oversize Rinjani         4
Trail Hoodie             0
```

Use visual status:

```text
AVAILABLE
LOW STOCK
OUT OF STOCK
```

Admin may quickly change stock.

---

# 44. SETTINGS

Route:

```text
/admin/settings
```

Sections:

### Brand

```text
Brand Name
Logo
Instagram
Email
```

### Contact Channels

```text
WhatsApp
Phone Number
Enabled

Telegram
Username
Enabled
```

### Order Message

```text
Message Template
[____________________________]

Available variables:
{{product_name}}
{{product_url}}
{{size}}
{{color}}
{{quantity}}
{{price}}
```

### General

```text
Currency
Timezone
```

---

# 45. ADMIN RESPONSIVENESS

Admin must be responsive.

Desktop:

Sidebar + content.

Tablet:

Collapsible sidebar.

Mobile:

Drawer + content.

Tables should become:

- horizontally scrollable
- or transformed into stacked cards

Do not allow desktop tables to break mobile layouts.

---

# 46. PUBLIC RESPONSIVENESS

Desktop:

Editorial layouts.

Tablet:

Simplified grid.

Mobile:

Prioritize:

- image
- product name
- price
- CTA

Product grid:

```text
Desktop: 4 columns
Tablet: 3 columns
Mobile: 2 columns
```

Hero typography should scale using:

```text
clamp()
```

Avoid fixed oversized text that causes overflow.

---

# 47. IMAGE HANDLING

Product images are critical.

Recommended:

```css
object-fit: cover;
```

Use consistent image aspect ratio.

Preferred:

```text
4:5
```

for clothing product photography.

Hero images may use:

```text
16:9
```

or full viewport composition.

Images must include appropriate:

```text
alt
```

text.

---

# 48. IMAGE OPTIMIZATION

The application should:

- Optimize uploaded images
- Generate appropriate sizes
- Lazy-load below-the-fold images
- Use responsive image formats
- Avoid loading original full-resolution images everywhere

Hero images may be loaded eagerly when they are above the fold.

Product grid images should be lazy-loaded.

---

# 49. ACCESSIBILITY

The application must follow basic accessibility principles.

Required:

- semantic HTML
- keyboard navigation
- visible focus states
- sufficient contrast
- alt text
- accessible modal
- accessible dropdown
- accessible mobile menu
- form labels
- error messages
- button states

Do not rely only on color to communicate status.

---

# 50. ANIMATION SYSTEM

Animations should be subtle.

Use:

```text
150ms
250ms
350ms
```

Preferred effects:

- opacity
- transform
- scale
- translate
- height

Avoid:

- excessive parallax
- bouncing
- flashy transitions
- constant motion

Page transitions may use subtle fade/slide effects.

---

# 51. LOADING STATES

Public catalog:

Use skeleton loaders.

Example:

```text
┌──────────────┐
│              │
│   SKELETON   │
│              │
└──────────────┘
Product Name
████████████
```

Admin:

Use skeleton table rows.

Do not show blank screens while loading.

---

# 52. EMPTY STATES

Example:

```text
NO PRODUCTS FOUND

Try another search or category.

[ VIEW ALL PRODUCTS ]
```

Admin:

```text
YOUR CATALOG IS EMPTY

Start by adding your first product.

[ + ADD PRODUCT ]
```

---

# 53. ERROR STATES

Example:

```text
Something went wrong.

We couldn't load the products.

[ TRY AGAIN ]
```

Do not expose technical errors to customers.

Admin may see useful debugging information when appropriate.

---

# 54. FORM VALIDATION

Product form:

Required:

```text
name
price
category
status
```

Depending on implementation:

```text
images
description
stock
```

Validation must happen:

- Client-side
- Server-side

Never rely only on frontend validation.

---

# 55. SECURITY

Admin authentication must be server-side.

Never trust:

```text
localStorage
```

alone for authorization.

Protect admin APIs.

Required:

- Password hashing
- Secure session/token handling
- Authorization middleware
- Input validation
- Rate limiting on login
- CSRF protection where applicable
- Secure cookies when using cookie-based sessions
- Server-side authorization checks

A customer must never be able to call an admin API successfully without authorization.

---

# 56. DATA MODEL

Recommended conceptual schema:

```text
User
├── id
├── name
├── email
├── passwordHash
├── role
├── createdAt
└── updatedAt
```

```text
Product
├── id
├── name
├── slug
├── description
├── price
├── categoryId
├── material
├── weight
├── featured
├── status
├── createdAt
└── updatedAt
```

```text
ProductImage
├── id
├── productId
├── url
├── alt
├── sortOrder
└── createdAt
```

```text
Category
├── id
├── name
├── slug
├── description
├── image
├── displayOrder
├── active
├── createdAt
└── updatedAt
```

```text
ProductVariant
├── id
├── productId
├── size
├── color
├── stock
└── sku
```

```text
SiteSettings
├── id
├── brandName
├── whatsappNumber
├── whatsappEnabled
├── telegramUsername
├── telegramEnabled
├── orderMessageTemplate
├── instagramUrl
├── email
└── updatedAt
```

---

# 57. PRODUCT STATUS

Use:

```text
DRAFT
ACTIVE
ARCHIVED
```

Public catalog only displays:

```text
ACTIVE
```

Admin can see all statuses.

---

# 58. API DESIGN

Suggested API structure:

```text
GET    /api/products
GET    /api/products/:slug
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
```

Categories:

```text
GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id
```

Authentication:

```text
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

Settings:

```text
GET    /api/settings
PATCH  /api/settings
```

Admin inventory:

```text
GET    /api/admin/inventory
PATCH  /api/admin/inventory/:variantId
```

Exact API implementation may differ according to the selected framework.

---

# 59. PUBLIC API RULES

Public endpoints should only expose information necessary for the catalog.

Do NOT expose:

- admin password hashes
- private admin information
- internal database IDs unnecessarily
- private configuration
- internal audit information

---

# 60. ADMIN API RULES

Admin APIs must validate:

```text
authenticated
+
authorized
+
validated input
```

Do not assume that hiding a UI button provides security.

---

# 61. SEO

Each product should have:

```text
title
description
slug
canonical URL
Open Graph image
```

Example:

```text
Rinjani Mountain Tee — Rinjani Clothing
```

Use semantic:

```text
H1
H2
H3
```

correctly.

Product pages should be indexable.

Admin pages should not be indexed.

---

# 62. URL STRUCTURE

Preferred:

```text
/
 /shop
 /shop/t-shirts
 /shop/oversize
 /collections
 /collections/:slug
 /product/:slug
 /custom
 /about
 /contact
```

Admin:

```text
/admin/login
/admin
/admin/products
/admin/products/new
/admin/products/:id/edit
/admin/categories
/admin/inventory
/admin/settings
```

---

# 63. STATE MANAGEMENT

Keep state simple.

Server state:

- Products
- Categories
- Settings
- Authentication

Local state:

- Selected size
- Selected color
- Quantity
- Modal visibility
- Search input

Do not introduce a large global state system unless necessary.

---

# 64. COMPONENT ARCHITECTURE

Suggested public components:

```text
components/
├── layout/
│   ├── Header
│   ├── Footer
│   ├── MobileMenu
│   └── PageContainer
│
├── home/
│   ├── Hero
│   ├── FeaturedCollection
│   ├── BrandStatement
│   ├── NewArrivals
│   └── CustomCTA
│
├── product/
│   ├── ProductCard
│   ├── ProductGrid
│   ├── ProductGallery
│   ├── ProductInfo
│   ├── VariantSelector
│   ├── QuantitySelector
│   └── ContactAdmin
│
├── catalog/
│   ├── CategoryFilter
│   ├── SearchBar
│   └── SortSelect
│
└── ui/
    ├── Button
    ├── Modal
    ├── Input
    ├── Select
    ├── Badge
    ├── Skeleton
    └── Toast
```

Admin:

```text
components/admin/
├── AdminLayout
├── AdminSidebar
├── AdminHeader
├── ProductTable
├── ProductForm
├── CategoryTable
├── InventoryTable
├── DashboardStats
└── SettingsForm
```

---

# 65. BUTTON SYSTEM

Primary:

```text
BLACK BACKGROUND
WHITE TEXT
```

Secondary:

```text
WHITE/OFF-WHITE BACKGROUND
BLACK TEXT
BORDER
```

Text button:

```text
BLACK TEXT
NO BACKGROUND
```

Example:

```text
[ HUBUNGI ADMIN ]
```

Primary buttons should have strong but minimal visual weight.

---

# 66. INPUT SYSTEM

Inputs should be clean.

Avoid excessive rounded SaaS inputs.

Example:

```text
Product Name
┌─────────────────────────────────────┐
│ Rinjani Mountain Tee                │
└─────────────────────────────────────┘
```

Focus:

```text
border-color: black
```

Error:

```text
border-color: appropriate error color
```

---

# 67. MODAL SYSTEM

Modals should:

- Have accessible focus management
- Close through X
- Close through Escape
- Avoid accidental background interaction
- Be responsive

Contact modal on mobile should preferably become a bottom sheet.

Desktop:

Centered modal.

Mobile:

Bottom sheet.

---

# 68. TOAST SYSTEM

Use toast notifications for admin actions.

Examples:

```text
Product created successfully.
```

```text
Product updated successfully.
```

```text
Product deleted.
```

```text
Settings saved.
```

Do not use toast for critical errors that require user action.

---

# 69. CUSTOMER ORDER FLOW

Final flow:

```text
Customer
   ↓
Browse Shop
   ↓
Open Product
   ↓
Select Size
   ↓
Select Color
   ↓
Select Quantity
   ↓
Click HUBUNGI ADMIN
   ↓
Select WhatsApp / Telegram
   ↓
Open Messaging App
   ↓
Contact Admin
   ↓
Admin confirms availability
   ↓
Order handled manually
```

The website itself does NOT need to create an order record unless a future feature explicitly requires it.

---

# 70. INVENTORY FLOW

Admin:

```text
Login
 ↓
Dashboard
 ↓
Products
 ↓
Edit Product
 ↓
Update Stock
 ↓
Save
 ↓
Database updated
 ↓
Public catalog reflects new status
```

Example:

```text
Stock = 0
```

Public:

```text
SOLD OUT
```

Admin:

```text
0
```

---

# 71. PRODUCT CREATION FLOW

```text
Admin
 ↓
Add Product
 ↓
Enter Product Information
 ↓
Upload Images
 ↓
Configure Variants
 ↓
Set Stock
 ↓
Set Category
 ↓
Set Status
 ↓
Save
 ↓
Product becomes ACTIVE
```

If status is DRAFT:

The product must NOT appear in the public catalog.

---

# 72. DESIGN CONSISTENCY RULE

The public website and admin panel must share:

- Typography
- Brand colors
- Button language
- Spacing system
- Form styling
- Icon style

However:

Public:

> Editorial / Fashion

Admin:

> Functional / Operational

Do not make the admin dashboard unnecessarily editorial.

---

# 73. ICONOGRAPHY

Use a single icon library consistently.

Recommended:

```text
Lucide
```

Use icons for:

- Menu
- Search
- Arrow
- Chevron
- Edit
- Delete
- Settings
- Logout
- Close
- Plus
- Minus

Do not mix multiple icon styles.

Avoid icons when text is clearer.

---

# 74. RESPONSIVE BREAKPOINTS

Suggested:

```text
mobile:
< 640px

tablet:
640px - 1023px

desktop:
1024px+

large desktop:
1440px+
```

Do not design exclusively for one viewport.

---

# 75. MOBILE PRIORITY

Mobile UX must prioritize:

1. Product image
2. Product name
3. Price
4. Availability
5. Variant selection
6. Contact Admin

The Contact Admin CTA should remain easy to reach.

On long product pages, consider a sticky mobile CTA:

```text
┌─────────────────────────────────┐
│       HUBUNGI ADMIN             │
└─────────────────────────────────┘
```

---

# 76. PERFORMANCE

Target:

- Fast first contentful render
- Optimized images
- Lazy-loaded catalog images
- Minimal JavaScript where possible
- Server-side rendering/static rendering where appropriate
- Efficient database queries
- Pagination for admin product lists
- Debounced search

Avoid unnecessary dependencies.

---

# 77. CATALOG PAGINATION

If product count becomes large:

Use:

```text
Load More
```

or pagination.

Preferred public experience:

```text
[ LOAD MORE ]
```

rather than traditional dense pagination.

Admin may use traditional pagination.

---

# 78. SORTING

Public:

```text
Newest
Price: Low to High
Price: High to Low
```

Optional:

```text
Featured
```

Admin:

```text
Newest
Oldest
Name
Stock
```

---

# 79. FILTER URL STATE

Catalog filters should preferably be reflected in URL query parameters.

Example:

```text
/shop?category=t-shirts&color=black&size=l
```

This allows:

- sharing
- browser navigation
- refreshing without losing filters

---

# 80. DESIGN TOKENS

Use centralized CSS variables or equivalent design tokens.

Example:

```css
:root {
  --color-black: #111111;
  --color-white: #ffffff;
  --color-off-white: #f7f6f2;

  --color-gray-100: #f1f1ef;
  --color-gray-200: #e5e5e2;
  --color-gray-400: #a3a3a0;
  --color-gray-600: #666662;
  --color-gray-800: #292929;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
  --space-10: 128px;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  --transition-fast: 150ms;
  --transition-normal: 250ms;
  --transition-slow: 350ms;
}
```

---

# 81. UX WRITING

Primary language:

```text
Bahasa Indonesia
```

Keep copy concise.

Examples:

Instead of:

```text
Click this button to contact our administrator regarding
your desired product.
```

Use:

```text
Hubungi Admin
```

Instead of:

```text
This product is currently unavailable for purchase.
```

Use:

```text
Sold Out
```

Instead of:

```text
Please enter your product information below.
```

Use:

```text
Informasi Produk
```

---

# 82. MICROCOPY

Useful phrases:

```text
Lihat Koleksi
Jelajahi Produk
Lihat Detail
Hubungi Admin
Pilih Ukuran
Pilih Warna
Jumlah
Tersedia
Stok Terbatas
Sold Out
Tambah Produk
Simpan Perubahan
Batal
Hapus
Edit
```

Avoid excessive marketing language.

---

# 83. BRAND TONE

Tone:

- Calm
- Confident
- Minimal
- Modern
- Human
- Outdoor-inspired
- Slightly editorial

Avoid:

- Excessive exclamation marks
- Aggressive sales copy
- Cheap marketplace language
- Fake urgency
- Overly corporate language

---

# 84. SAMPLE HOMEPAGE CONTENT

Use placeholder content until real brand content is provided.

Hero:

```text
RINJANI CLOTHING

MADE FOR THE JOURNEY.

Everyday apparel inspired by movement,
nature, and urban culture.

[ EXPLORE COLLECTION ]
```

Collection:

```text
NEW ARRIVALS

Built for everyday movement.
```

Custom:

```text
CUSTOM PRINTING

Punya desain sendiri?

Kami bantu mewujudkannya.

[ HUBUNGI ADMIN ]
```

---

# 85. DO NOT HARD-CODE BUSINESS INFORMATION

Do not hard-code:

- WhatsApp number
- Telegram username
- Instagram
- Email
- Brand address
- Order template

These should come from configuration.

Product information must come from the database.

---

# 86. DO NOT HARD-CODE INVENTORY

Never use:

```text
stock = 10
```

inside frontend components.

Inventory must come from backend/database.

---

# 87. ADMIN PERMISSIONS

Initial role:

```text
ADMIN
```

Design the system so additional roles can be added later:

```text
ADMIN
EDITOR
```

Potential future permissions:

```text
manage_products
manage_categories
manage_inventory
manage_settings
manage_users
```

For the initial version, only ADMIN is required.

---

# 88. DATABASE RELATIONSHIPS

Conceptual relationships:

```text
User
  │
  └── authentication

Category
  │
  └── has many Products

Product
  │
  ├── belongs to Category
  ├── has many ProductImages
  └── has many ProductVariants

SiteSettings
  │
  └── global configuration
```

---

# 89. ERROR HANDLING

Backend should return structured errors.

Example:

```json
{
  "success": false,
  "message": "Product not found"
}
```

Frontend should display user-friendly messages.

Never display raw stack traces.

---

# 90. API RESPONSE STYLE

Prefer consistent responses.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

Pagination:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

# 91. SECURITY FOR FILE UPLOADS

Product image upload must:

- Validate file type
- Validate file size
- Reject executable files
- Generate safe filenames
- Store files securely
- Avoid exposing server filesystem directly
- Sanitize metadata

Allowed formats:

```text
JPEG
PNG
WebP
```

Recommended maximum upload size:

```text
5MB
```

This can be adjusted later.

---

# 92. ADMIN SESSION

Admin session should:

- Expire appropriately
- Support logout
- Be invalidated after logout
- Not expose authentication secrets to frontend unnecessarily

If cookies are used:

```text
HttpOnly
Secure
SameSite
```

should be configured appropriately for production.

---

# 93. SEO STRUCTURE

Homepage:

```text
Rinjani Clothing — Clothing & Custom Printing
```

Shop:

```text
Shop — Rinjani Clothing
```

Product:

```text
{Product Name} — Rinjani Clothing
```

Custom:

```text
Custom Printing — Rinjani Clothing
```

About:

```text
About — Rinjani Clothing
```

---

# 94. SOCIAL SHARING

Product pages should support:

```text
Open Graph
Twitter/X card
```

Use product image as preview.

Example:

```text
Rinjani Mountain Tee
Rp 125.000
Rinjani Clothing
```

---

# 95. ANALYTICS

Analytics may be added later.

Potential events:

```text
product_view
category_view
search
contact_admin_click
whatsapp_click
telegram_click
```

Do not make analytics a blocker for the initial implementation.

---

# 96. FUTURE FEATURES

Architecture should allow future implementation of:

- Shopping cart
- Online checkout
- Payment gateway
- Order management
- Customer accounts
- Wishlist
- Reviews
- Promo codes
- Discount system
- Shipping integration
- Multiple admin roles
- Product variants with individual SKU
- Sales reports
- Analytics dashboard

Do not implement these unless explicitly requested.

---

# 97. MVP SCOPE

The first production-ready version MUST include:

## Public

- Home
- Shop
- Product detail
- Category
- Custom Printing
- About
- Contact
- Responsive design
- Search
- Basic filtering
- Product variants
- Stock status
- Contact Admin
- WhatsApp
- Telegram

## Admin

- Login
- Dashboard
- Product CRUD
- Category CRUD
- Inventory management
- Image upload
- Settings
- WhatsApp configuration
- Telegram configuration
- Order message template

---

# 98. NON-MVP

Do not implement initially:

- Payment gateway
- Shopping cart
- Customer accounts
- Reviews
- Wishlist
- Coupon system
- Shipping calculator
- Complex analytics
- Multi-vendor
- Marketplace functionality

---

# 99. VISUAL QUALITY BAR

The finished website should NOT look like:

- A Bootstrap template
- A generic Next.js starter
- A generic admin dashboard
- A marketplace clone
- A CRUD demo

It should look like:

> A real independent Indonesian clothing brand with a premium editorial identity.

The public website is the primary visual priority.

---

# 100. IMPLEMENTATION PRINCIPLES

When implementing this specification:

1. Prioritize responsive behavior.
2. Prioritize image presentation.
3. Keep layouts clean.
4. Avoid unnecessary UI elements.
5. Keep components reusable.
6. Keep business logic separate from UI.
7. Keep API logic separate from components.
8. Validate all server inputs.
9. Protect all admin routes.
10. Do not hard-code inventory.
11. Do not hard-code contact information.
12. Keep public and admin UI consistent but purpose-specific.
13. Optimize images.
14. Use semantic HTML.
15. Support keyboard navigation.
16. Respect reduced-motion preferences.
17. Do not introduce dependencies without a clear reason.
18. Do not implement non-MVP features unless explicitly requested.

---

# 101. FINAL USER EXPERIENCE

The ideal customer experience is:

```text
LANDING
   ↓
See the brand
   ↓
Explore collection
   ↓
Browse products
   ↓
Find a product
   ↓
Open product detail
   ↓
Choose size / color / quantity
   ↓
See availability
   ↓
HUBUNGI ADMIN
   ↓
WhatsApp / Telegram
   ↓
Continue conversation with admin
```

The ideal owner experience is:

```text
ADMIN LOGIN
   ↓
Dashboard
   ↓
Manage Products
   ↓
Manage Categories
   ↓
Manage Inventory
   ↓
Configure Contact Channels
   ↓
Save
   ↓
Public website automatically reflects changes
```

---

# 102. FINAL DESIGN PRINCIPLE

Rinjani Clothing should feel like a clothing brand first and a web application second.

Public interface:

```text
IMAGE
+
TYPOGRAPHY
+
WHITESPACE
+
PRODUCT
+
BRAND STORY
```

Admin interface:

```text
CLARITY
+
SPEED
+
INVENTORY
+
CRUD
+
CONTROL
```

The two experiences should share the same brand language while serving completely different purposes.

The final result should be:

> Minimal.
> Editorial.
> Functional.
> Responsive.
> Premium.
> Easy to manage.
> Easy to browse.
> Easy to contact.

Rinjani Clothing is a catalog-first clothing brand website with a lightweight but production-ready inventory management system behind it.
