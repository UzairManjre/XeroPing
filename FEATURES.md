# ZeroNode Utility Network - Master Feature List

## 1. EXIF Data Remover
*A professional-grade metadata eraser.*
- **Deep Metadata Parsing**: Extracts over 60+ EXIF tags including Camera Make, Lens, Exposure, Flash, and Software data.
- **GPS Map Inspector**: Automatically detects hidden geolocation coordinates and plots them on an interactive map.
- **Exhaustive Data Viewer**: An accordion-based UI to view every single hidden tag inside the image.
- **Selective Redaction (JPEGs)**: Toggle specifically what you want to remove (e.g., Strip GPS, Strip Settings, Strip Time).
- **Brute-Force Eraser**: Permanently obliterates all metadata from JPEGs, PNGs, and WebPs locally.

## 2. Image Converter & Optimizer
*A universal WASM-powered image conversion engine.*
- **ImageMagick WebAssembly**: Uses the industry-standard C++ ImageMagick library compiled to run entirely inside the browser's memory.
- **Universal Formats**: Supports uploading standard web formats (JPG, PNG) alongside professional formats like RAW, PSD, HEIC, TIFF, EPS, AI, and PDF.
- **Advanced Exporting**: Converts files into optimized web formats like WebP and the next-generation AVIF format.
- **Format Conversions**: Export into GIF, BMP, TIFF, ICO (Favicons), HEIC, and PDF.
- **Compression Settings**: Custom quality slider and maximum dimension controls for precise file size optimization.

## 3. PDF Toolkit
*A massive client-side document manipulation suite using `pdf-lib`.*
- **Merge**: Combine multiple PDFs into a single document with drag-and-drop ordering.
- **Split & Extract**: Extract specific pages (e.g. `1-3, 5, 8-10`) into a new PDF document.
- **Rotate**: Quickly flip all pages in a document by 90°, 180°, or 270°.
- **Image to PDF**: Package multiple JPEGs or PNGs into a single, multi-page PDF document.
- **Metadata Editor**: Read, inject, or erase the hidden Title, Author, Subject, and Keywords encoded inside the PDF.
- **PDF to Image Engine**: Extracts every single page from a massive PDF and packages them into a `.zip` file of high-quality JPEGs.
- **Watermarking**: Stamp massive, custom text diagonally across every page.
- **Interactive E-Sign**: Visually preview your document, open a touch-friendly drawing pad to sign your name, and drag your transparent signature onto the exact dotted line before burning it permanently into the PDF.

## 4. Data Converters
*A robust, offline parsing engine for translating massive datasets securely.*
- **JSON ↔ CSV**: Bidirectional conversion between raw JSON arrays and comma-separated values using `papaparse`.
- **CSV ↔ Excel**: Full support for compiling CSV strings into downloadable `.xlsx` files, or ripping data out of binary Excel sheets into CSV strings natively.
- **XML ↔ JSON**: Translate archaic XML web configs into modern JSON structures.
- **Markdown → HTML**: Compile markdown syntax strings directly into raw HTML tags.
- **Data Cleaner**: Automatically strip duplicate rows, remove null/empty fields, and mathematically trim whitespace from messy JSON/CSV files.
- **Data Splitter**: Chunk massive CSVs or JSON arrays into smaller segments (e.g. 500 rows each) and download them instantly as a `.zip` file using `jszip`.
- **Dual-Panel UI**: A massive, developer-focused dual textarea interface that allows instant payload viewing and 1-click clipboard copying.

## 5. Text Redactor (Data Sanitizer)
*A fast, client-side regex engine for scrubbing sensitive strings.*
- **Regex Engine**: Instantly parses massive log files and server traces purely in the browser.
- **Sensitive Detectors**: Automatically replaces highly sensitive data with `[REDACTED]` blocks.
- **Supported Formats**: Emails, standard 16-digit Credit Cards, Phone Numbers (US/Intl), IPv4, IPv6, JWTs, AWS Keys, and Bearer Tokens.
- **Dual-Panel UI**: A massive side-by-side editor showing raw data on the left and instantly sanitized output on the right, complete with redaction statistics.

## 6. Developer Toolkit
*A suite of advanced productivity utilities for software engineers.*
- **Local JWT Debugger**: Safely decodes JSON Web Tokens (Header & Payload) and actively calculates if the `exp` timestamp has expired relative to the user's local clock.
- **Cron Forecaster**: Translates archaic cron syntax into plain English strings and mathematically forecasts the next 5 exact execution dates.
- **SVG to JSX Compiler**: Converts raw SVG XML into perfectly formatted React Functional Components, including intelligent replacements for `currentColor` and `className`.
- **Crypto Hash Generator**: Leverages the browser's native `crypto.subtle` API to instantly encode text into Base64, MD5, SHA-256, and SHA-512 hashes.

## 7. Platform Architecture
*Built for scale, privacy, and maximum ad revenue.*
- **Zero-Server Processing**: 100% of processing happens in the user's browser via HTML5 Canvas, Web Workers, and WebAssembly. No files are ever uploaded.
- **Brutalist "Summer Fun" UI**: A high-contrast, aggressive design language utilizing neo-brutalism and a vibrant color palette (Sky Blue, Amber, Tiger Orange).
- **Strategic Ad Placements**: CLS-optimized, pulsing skeleton placeholders configured for Top Leaderboard, Sidebar, Content Footer, and Sticky Bottom Anchor units.
