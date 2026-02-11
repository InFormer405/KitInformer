# KitInformer (InFormer Legal Forms)

## Overview

InFormer is an e-commerce platform selling state-specific legal form kits, primarily focused on divorce documents. The system serves static HTML pages for all 50 US states, with each state offering "No Children" and "With Children" divorce kit variants priced at $175. The platform integrates with Supabase for product data storage and Stripe for payment processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### February 2026
- **Product Card Styling**: Implemented dark card-based design with rounded corners, image support, and graceful image fallback
- **Image Support**: Added product image containers with 16:9 aspect ratio and SVG placeholder fallback
- **Error Handling Improvements**: Added defensive error handling to `supabase-products.js` and state pages to prevent white page issues when JavaScript fails
- **Dynamic Imports**: State pages now use dynamic imports for the Supabase module to gracefully handle load failures
- **State Registry**: Created `public/states/registry.json` containing all 50 US states for automation
- **Validation Script**: Added `validate-states.js` for registry validation and dry-run automation
- **Task Executor System**: Implemented autonomous task executor at project root (`executor.py`) with control plane directories

## System Architecture

### Frontend Architecture
- **Static HTML pages**: The `public/` directory contains pre-built HTML pages for the main site and individual state landing pages
- **Configuration-driven state pages**: Each state page uses a `CONFIG` object for state-specific values
- **Dark premium design system**: External stylesheet at `public/styles.css` with dark background (#0b0f14), serif headings, gold accents (#D4AF37)
- **Client-side data fetching**: JavaScript modules (ES modules via CDN) fetch product data from Supabase directly in the browser
- **Error resilience**: Pages render visible HTML content even if JavaScript fails to load or execute
- **No build process**: Pure HTML/CSS/JS without bundling or transpilation

### State Page Structure
- Located at `/public/states/{state-slug}/index.html`
- Each page has a `CONFIG` object with `STATE_NAME`, `STATE_SLUG`, `CHILDREN_STATUS`, and `DEBUG` flags
- DOM-based rendering replaces `document.write()` for automation safety
- Dynamic imports with try/catch ensure graceful degradation

### Design System (public/styles.css)
- **Body**: Dark background (#0b0f14), light text (#f5f5f5), sans-serif body, serif headings
- **Product cards** (.product-card): Background #11161d, gold border accent rgba(212,175,55,0.15), 18px radius, hover lift with gold glow
- **Pricing** (.price): Gold (#D4AF37), 2rem, weight 700
- **Pills** (.pill): Blue gradient (#2563eb → #1d4ed8), rounded, blue glow shadow
- **Product images** (.product-image): 14px radius, full width, hidden gracefully on error via onerror
- **Filing fee box** (.filing-fee-box): Semi-transparent dark container, gold price at 1.35rem
- **Layout** (.product-grid): Responsive grid — 1 column mobile, 2 columns at 640px+
- Image path convention: `/images/products/{state-slug}-{children-status}.jpg`

### Backend Architecture
- **Task executor system**: Python-based task queue in `executor/` and `control/` directories
  - `executor.py` at project root runs the control loop
  - `executor/run_task.py` executes individual tasks
  - Tasks are JSON files placed in `control/inbox/`
  - Executor moves tasks through `running/`, `completed/`, or `failed/` states
  - Supports file search, regex extraction, and reporting operations
  - Task validation ensures proper schema before execution

### Data Layer
- **Supabase**: PostgreSQL-based backend for storing kit/product information
- **Table structure**: `kits` table with fields including `state`, `children_status`, `sku`, `title`, `price`, `image_url` (optional)
- **Row-Level Security (RLS)**: Enabled on the kits table

### Product Structure
- Two product variants per state: "No Children" ($175) and "With Children" ($199)
- Each kit includes: state-specific forms, filing instructions, and fee waiver documents

## Key Files

### Public Assets
- `public/index.html` - Main landing page
- `public/supabase-products.js` - Supabase client module with error handling
- `public/states/registry.json` - Centralized state registry for automation
- `public/states/state-template.html` - Master template for state pages
- `public/states/{state}/index.html` - State-specific landing pages
- `public/images/placeholder.svg` - Fallback image for missing product images
- `public/images/products/` - Directory for product images

### Executor System
- `executor.py` - Main task executor control loop
- `executor/run_task.py` - Task execution script with validation
- `control/inbox/` - Drop tasks here for processing
- `control/completed/` - Successfully processed tasks
- `control/failed/` - Failed tasks with errors
- `control/logs/` - Execution logs

### Validation
- `validate-states.js` - Registry validation and dry-run automation script

## External Dependencies

### Third-Party Services
- **Supabase**: Database and authentication (accessed via `SUPABASE_URL` and `SUPABASE_KEY` environment variables)
- **Stripe**: Payment processing (checkout links embedded in HTML, currently placeholder values)
- **Google Drive API**: Document storage/delivery (service account credentials in `informer-automation-e9e542b3cea9.json`)
- **OpenAI API**: AI capabilities via `OPENAI_API_KEY`

### Python Dependencies
- `fastapi`: Web framework for backend API
- `supabase-py`: Supabase Python client
- `google-auth` / `google-api-python-client`: Google Drive integration
- `openai`: OpenAI API client

### Environment Variables Required
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase API key
- `OPENAI_API_KEY`: OpenAI API key
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Google OAuth credentials

## Deployment Notes

- Static site deployed via Cloudflare Pages
- Build output directory: `public`
- No server-side processing required for frontend
- Supabase credentials must be available client-side (consider using environment injection or a config endpoint for production)
- Product images should be placed in `/images/products/` with naming convention `{state-slug}-{children-status}.jpg`
