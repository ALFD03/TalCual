---
name: Tal Cual
colors:
  surface: '#fafaf1'
  surface-dim: '#dadbd2'
  surface-bright: '#fafaf1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4eb'
  surface-container: '#eeeee5'
  surface-container-high: '#e9e9e0'
  surface-container-highest: '#e3e3da'
  on-surface: '#1a1c17'
  on-surface-variant: '#44483c'
  inverse-surface: '#2f312b'
  inverse-on-surface: '#f1f1e8'
  outline: '#74796b'
  outline-variant: '#c4c8b8'
  surface-tint: '#4a6727'
  primary: '#446122'
  on-primary: '#ffffff'
  primary-container: '#5c7a38'
  on-primary-container: '#e7ffc6'
  inverse-primary: '#afd185'
  secondary: '#475e89'
  on-secondary: '#ffffff'
  secondary-container: '#b5ccfe'
  on-secondary-container: '#3f5681'
  tertiary: '#7e4571'
  on-tertiary: '#ffffff'
  tertiary-container: '#9a5d8b'
  on-tertiary-container: '#fff4f8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cbee9f'
  primary-fixed-dim: '#afd185'
  on-primary-fixed: '#102000'
  on-primary-fixed-variant: '#334e11'
  secondary-fixed: '#d7e2ff'
  secondary-fixed-dim: '#afc7f8'
  on-secondary-fixed: '#001b3f'
  on-secondary-fixed-variant: '#2f4770'
  tertiary-fixed: '#ffd7f1'
  tertiary-fixed-dim: '#f8b0e3'
  on-tertiary-fixed: '#370530'
  on-tertiary-fixed-variant: '#6a335e'
  background: '#fafaf1'
  on-background: '#1a1c17'
  surface-variant: '#e3e3da'
  cta-terracotta: '#D97328'
  bg-cream: '#F5F1E8'
  text-dark: '#1E242B'
  text-muted: '#6C757D'
  whatsapp-green: '#25D366'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  accent-quote:
    fontFamily: Playfair Display
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 30px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-mobile: 16px
  margin-desktop: 64px
  gutter: 24px
  section-gap: 80px
  stack-sm: 8px
  stack-md: 16px
---

# Design System - TAL CUAL (Conectamos Oportunidades)
## Brand Identity & Theme
TAL CUAL is a retail brand focused on circular economy, eco-friendly shopping, and second-hand/new curated products.
The visual identity is warm, trustworthy, organic, modern, and accessible.
## Color Palette
- **Primary Olive Green:** `#5C7A38` (Headers, active filters, sustainability elements)
- **Primary Deep Navy:** `#0F2A52` (Text, primary titles, trust badges)
- **Accent Terracotta Orange:** `#D97328` (CTAs, tags, sale badges, WhatsApp checkout button)
- **Background Cream Warm:** `#F5F1E8` (Main body background)
- **Card Background White:** `#FFFFFF` (Product cards, modals)
- **Text Dark:** `#1E242B`
- **Text Muted:** `#6C757D`
## Typography
- **Headings (H1, H2, H3):** Round Sans-Serif or Friendly Serif (e.g., 'Fredoka', 'Quicksand', or 'Playfair Display' for organic handwritten accent vibes).
- **Body & UI:** Clean Sans-Serif ('Inter', 'Plus Jakarta Sans', or 'Roboto').
- **Accents:** Handwritten style touches for quote callouts ("No vendemos cosas usadas, conectamos oportunidades").
## Component Styles
- **Buttons:** Rounded (Border radius: `12px` or `9999px` pill-style).
  - *Primary CTA (WhatsApp Buy):* Terracotta Orange (`#D97328`) with white text and a green WhatsApp icon.
  - *Secondary Buttons:** Deep Navy outline or solid Olive Green.
- **Product Cards:** Clean rounded corners (`16px`), light shadow (`0 4px 20px rgba(0,0,0,0.05)`), image area with category tags ("Nuevo", "Como Nuevo", "Segunda Mano").
- **Badge Tags:** Curved tag shape in Orange (`#D97328`) mimicking price tags.
- **Cart Drawer / Modal:** Slide-over panel from the right displaying items, quantity selector, total estimate, and "Finalizar Pedido por WhatsApp" CTA.
## Layout Structure
1. **Header/Navbar:** Logo ("TAL CUAL"), Navigation links (Inicio, Catálogo, ¿Cómo Funciona?, Consignación, Ubicación), Search bar, and Interactive Shopping Cart trigger with item count badge.
2. **Hero Banner:** Headline *"Artículos nuevos y de segunda mano"*, Tagline *"Conectamos oportunidades"*, and CTA buttons *"Ver Catálogo"* & *"Quiero Vender/Consignar"*.
3. **Category Pills Filter:** Horizontal filter buttons (Todos, Ropa, Muebles, Zapatos, Cocina, Accesorios, Libros).
4. **Product Catalog Grid:** Responsive grid (2 columns mobile, 4 columns desktop) displaying title, tag, price, and "Agregar al Carrito" button.
5. **How It Works Section ("¿Tienes algo que ya no usas?"):** 4 step process icons (1. Traes tus artículos -> 2. Los exhibimos -> 3. Los vendemos -> 4. Tú ganas).
6. **Location & Contact Footer:** CC Capadoro Local 19, WhatsApp 0424-9039269, social media links, and map info.