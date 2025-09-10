# Overview

InFormer is a static site generator for selling DIY legal kits, specifically focused on state-specific divorce kits. The system fetches product data from a Google Sheets CSV export and generates a complete static website with product pages, category listings, and search functionality. It's designed as a simple e-commerce site for digital legal document templates.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Static Site Generation**: Uses vanilla HTML/CSS/JavaScript with no frontend frameworks
- **Responsive Design**: Mobile-first approach with CSS grid for product listings
- **Client-Side Search**: Real-time search functionality using a JSON index file
- **Single Page Template System**: Reusable page template function generates consistent layouts

## Backend Architecture
- **Build-Time Generation**: Node.js script processes CSV data and generates static HTML files
- **Data Source Integration**: Fetches product data from Google Sheets via CSV export URL
- **File-Based Routing**: Generates directory structure that maps to URL paths
- **Static Asset Serving**: Uses http-server for local development

## Data Management
- **CSV Data Processing**: Uses csv-parse library to transform spreadsheet data into JavaScript objects
- **Search Index Generation**: Creates JSON file with searchable product metadata
- **Product Categorization**: Automatic category page generation based on product types and states
- **URL Slug Generation**: Converts product titles and SKUs into SEO-friendly URLs

## Content Structure
- **Product Pages**: Individual pages for each legal kit with details and pricing
- **Category Pages**: Grouped listings for divorce kits by state and type
- **Static Pages**: Legal pages (terms, refund policy, contact) with consistent navigation
- **Search Interface**: Global search bar with instant results across all products

## Build Process
- **Data Fetching**: Retrieves latest product data from Google Sheets on each build
- **Page Generation**: Creates HTML files for products, categories, and navigation
- **Asset Management**: Copies static assets and generates search index
- **Development Server**: Local HTTP server for testing generated site

# External Dependencies

## Data Sources
- **Google Sheets**: Primary data source for product catalog via CSV export
- **Product Images**: External image URLs referenced in spreadsheet data

## Build Dependencies  
- **csv-parse**: CSV parsing and data transformation
- **node-fetch**: HTTP requests for fetching remote CSV data
- **http-server**: Local development server for static files

## Hosting Requirements
- **Static File Hosting**: Any web server capable of serving HTML/CSS/JS files
- **No Database**: All data is pre-generated at build time
- **No Server-Side Processing**: Pure static site with client-side JavaScript only