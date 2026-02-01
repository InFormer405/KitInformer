# KitInformer (InFormer Legal Forms)

## Overview

InFormer is an e-commerce platform selling state-specific legal form kits, primarily focused on divorce documents. The system serves static HTML pages for all 50 US states, with each state offering "No Children" and "With Children" divorce kit variants priced at $175. The platform integrates with Supabase for product data storage and Stripe for payment processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Static HTML pages**: The `public/` directory contains pre-built HTML pages for the main site and individual state landing pages
- **Template-based design**: A `state-template.html` provides the structure for state pages, with placeholders like `{{STATE}}` and `{{state-slug}}`
- **Client-side data fetching**: JavaScript modules (ES modules via CDN) fetch product data from Supabase directly in the browser
- **No build process**: Pure HTML/CSS/JS without bundling or transpilation

### Backend Architecture
- **FastAPI server** (`core_backup/server.py`): Provides API endpoints for testing and fetching kit data
- **Task executor system**: Python-based task queue in `executor/` and `control/` directories
  - Tasks are JSON files placed in `control/inbox/`
  - Executor moves tasks through `running/`, `completed/`, or `failed/` states
  - Supports file search and regex extraction operations

### Data Layer
- **Supabase**: PostgreSQL-based backend for storing kit/product information
- **Table structure**: `kits` table with fields including `state`, `children_status`, `sku`, `title`, `price`
- **Row-Level Security (RLS)**: Enabled on the kits table

### Product Structure
- Two product variants per state: "No Children" and "With Children"
- Consistent pricing at $175 per kit
- Each kit includes: state-specific forms, filing instructions, and fee waiver documents

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