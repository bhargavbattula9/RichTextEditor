/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                           ║
 * ║   RichEditor - A Full-Featured WYSIWYG Rich Text Editor                   ║
 * ║                                                                           ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║   Version     : 1.0.0                                                     ║
 * ║   Author      : Bhargav Battula                                           ║
 * ║   License     : MIT                                                       ║
 * ║   Created     : 2025                                                      ║
 * ║                                                                           ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║   Description:                                                            ║
 * ║   A comprehensive, free, and open-source rich text editor similar to      ║
 * ║   TinyMCE with all standard features and plugin support. Built with       ║
 * ║   vanilla JavaScript - no dependencies required.                          ║
 * ║                                                                           ║
 * ║   Features:                                                               ║
 * ║   • TinyMCE-style menu bar (Edit, Insert, Format, Table)                  ║
 * ║   • Rich text formatting (bold, italic, underline, etc.)                  ║
 * ║   • 15+ font families and 7 font sizes                                    ║
 * ║   • Line height control                                                   ║
 * ║   • Text and background colors                                            ║
 * ║   • Lists (ordered & unordered)                                           ║
 * ║   • Text alignment options                                                ║
 * ║   • Links, images, and video embedding                                    ║
 * ║   • Table support with row/column management                              ║
 * ║   • Code blocks and inline code                                           ║
 * ║   • Undo/Redo with history                                                ║
 * ║   • Source code view                                                      ║
 * ║   • Fullscreen mode                                                       ║
 * ║   • Print support                                                         ║
 * ║   • Plugin architecture                                                   ║
 * ║   • Customizable toolbar                                                  ║
 * ║   • Feature toggles (enable/disable specific features)                    ║
 * ║   • Auto-save support                                                     ║
 * ║   • RTL support                                                           ║
 * ║                                                                           ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║   Usage:                                                                  ║
 * ║   const editor = new RichEditor('#editor', {                              ║
 * ║       height: 400,                                                        ║
 * ║       showMenuBar: true,                                                  ║
 * ║       plugins: [RichEditorPlugins.WordCount]                              ║
 * ║   });                                                                     ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

(function(global) {
    'use strict';

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    const Utils = {
        /**
         * Generate unique ID
         */
        generateId: function(prefix = 'richeditor') {
            return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
        },

        /**
         * Deep merge objects
         */
        deepMerge: function(target, source) {
            const output = Object.assign({}, target);
            if (this.isObject(target) && this.isObject(source)) {
                Object.keys(source).forEach(key => {
                    if (this.isObject(source[key])) {
                        if (!(key in target)) {
                            Object.assign(output, { [key]: source[key] });
                        } else {
                            output[key] = this.deepMerge(target[key], source[key]);
                        }
                    } else {
                        Object.assign(output, { [key]: source[key] });
                    }
                });
            }
            return output;
        },

        isObject: function(item) {
            return item && typeof item === 'object' && !Array.isArray(item);
        },

        /**
         * Sanitize HTML to prevent XSS
         */
        sanitizeHTML: function(html, allowedTags = null) {
            if (!allowedTags) {
                allowedTags = [
                    'p', 'br', 'b', 'i', 'u', 's', 'strong', 'em', 'strike', 'sub', 'sup',
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
                    'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
                    'div', 'span', 'hr', 'figure', 'figcaption',
                    'video', 'audio', 'source', 'iframe'
                ];
            }
            
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const elements = doc.body.querySelectorAll('*');
            
            elements.forEach(el => {
                if (!allowedTags.includes(el.tagName.toLowerCase())) {
                    el.outerHTML = el.innerHTML;
                }
                // Remove event handlers
                Array.from(el.attributes).forEach(attr => {
                    if (attr.name.startsWith('on')) {
                        el.removeAttribute(attr.name);
                    }
                });
            });
            
            return doc.body.innerHTML;
        },

        /**
         * Debounce function
         */
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Create DOM element with attributes
         */
        createElement: function(tag, attributes = {}, children = []) {
            const element = document.createElement(tag);
            Object.keys(attributes).forEach(key => {
                if (key === 'className') {
                    element.className = attributes[key];
                } else if (key === 'innerHTML') {
                    element.innerHTML = attributes[key];
                } else if (key === 'textContent') {
                    element.textContent = attributes[key];
                } else if (key.startsWith('data-')) {
                    element.setAttribute(key, attributes[key]);
                } else {
                    element[key] = attributes[key];
                }
            });
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
            return element;
        }
    };

    // ============================================
    // ICONS (SVG)
    // ============================================
    const Icons = {
        bold: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>',
        italic: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>',
        underline: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>',
        strikethrough: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>',
        subscript: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M22 18h-2v1h3v1h-4v-2.5c0-.55.45-1 1-1h2v-1h-3v-1h3c.55 0 1 .45 1 1v1.5c0 .55-.45 1-1 1zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.87 4H6.19l4.32 6.73L5.88 18z"/></svg>',
        superscript: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M22 7h-2v1h3v1h-4V6.5c0-.55.45-1 1-1h2v-1h-3v-1h3c.55 0 1 .45 1 1v1.5c0 .55-.45 1-1 1zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.87 6H6.19l4.32 6.73L5.88 20z"/></svg>',
        alignLeft: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>',
        alignCenter: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>',
        alignRight: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>',
        alignJustify: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zM3 3v2h18V3H3z"/></svg>',
        orderedList: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>',
        unorderedList: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>',
        indent: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/></svg>',
        outdent: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/></svg>',
        link: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
        unlink: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.43-.98 2.63-2.31 2.98l1.46 1.46C20.88 15.61 22 13.95 22 12c0-2.76-2.24-5-5-5zm-1 4h-2.19l2 2H16zM2 4.27l3.11 3.11C3.29 8.12 2 9.91 2 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l4.01 4L20 19.74 3.27 3 2 4.27z"/></svg>',
        image: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
        video: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>',
        table: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/></svg>',
        horizontalRule: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 11h16v2H4z"/></svg>',
        undo: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>',
        redo: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>',
        removeFormat: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15 16h4v2h-4v-2zm0-8h7v2h-7V8zm0 4h6v2h-6v-2zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12V5z"/></svg>',
        code: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
        codeBlock: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
        blockquote: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>',
        print: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>',
        fullscreen: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
        exitFullscreen: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>',
        sourceCode: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M14.6 16.6l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4zm-5.2 0L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4z"/></svg>',
        fontColor: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z"/><path fill="currentColor" d="M5 19h14v3H5z"/></svg>',
        backgroundColor: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z"/><path fill="currentColor" d="M2 20h20v4H2z"/></svg>',
        clearFormatting: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"/></svg>',
        findReplace: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M11 6c1.38 0 2.63.56 3.54 1.46L12 10h6V4l-2.05 2.05C14.68 4.78 12.93 4 11 4c-3.53 0-6.43 2.61-6.92 6H6.1c.46-2.28 2.48-4 4.9-4zm5.64 9.14c.66-.9 1.12-1.97 1.28-3.14H15.9c-.46 2.28-2.48 4-4.9 4-1.38 0-2.63-.56-3.54-1.46L10 12H4v6l2.05-2.05C7.32 17.22 9.07 18 11 18c1.55 0 2.98-.51 4.14-1.36L20 21.49 21.49 20l-4.85-4.86z"/></svg>',
        insertMedia: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>',
        emoji: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
        specialChar: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z"/></svg>',
        wordCount: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2zM7 17h10V7H7v10zm2-8h6v6H9V9z"/></svg>',
        help: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',
        heading: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M5 4v3h5.5v12h3V7H19V4z"/></svg>',
        paragraph: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M13 4v16h-2V4H8c-2.21 0-4 1.79-4 4s1.79 4 4 4h1v8h2V4h2z"/></svg>',
        copy: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
        cut: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3z"/></svg>',
        paste: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"/></svg>',
        selectAll: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2zM7 17h10V7H7v10zm2-8h6v6H9V9z"/></svg>',
        insertRowBefore: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20 13H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM8 17H4v-2h4v2zm6 0h-4v-2h4v2zm6 0h-4v-2h4v2zm-7-6h2V7h4V5h-4V1h-2v4H9v2h4v4z"/></svg>',
        insertRowAfter: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20 3H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 7H4V5h4v2zm6 0h-4V5h4v2zm6 0h-4V5h4v2zm-7 6h2v4h4v2h-4v4h-2v-4H9v-2h4v-4z"/></svg>',
        insertColBefore: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M13 4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2V4zm2 14h4v-4h-4v4zm0-6h4V8h-4v4zm0-6h4V4h-4v2zM6 7V5H4v2H0v2h4v2h2V9h2V7H6z"/></svg>',
        insertColAfter: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M11 4c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V4zM9 18H5v-4h4v4zm0-6H5V8h4v4zm0-6H5V4h4v2zm8 5v-2h-2v2h-2v2h2v2h2v-2h2v-2h-2z"/></svg>',
        deleteRow: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM8 11H4V9h4v2zm6 0h-4V9h4v2zm6 0h-4V9h4v2zm-14 4h4v2H4v-2h2zm6 0h4v2h-4v-2zm6 0h4v2h-4v-2zM6 3h12v2H6z"/></svg>',
        deleteCol: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4zm0 14h5v-4H4v4zm0-6h5V8H4v4zm11-4h-4V6h4v2zm-4 2h4v4h-4v-4zm0 6h4v4h-4v-4z"/></svg>',
        deleteTable: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15 16h4v2h-4v-2zm0-8h7v2h-7V8zm0 4h6v2h-6v-2zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12V5z"/></svg>',
        chevronDown: '<svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>',
        lineHeight: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9.17 15.5h5.66l1 2.5h2.25L13 6h-2L6 18h2.25l.92-2.5zm4.45-1.5H10.4l1.6-4.27 1.62 4.27zM21 10.5h-2V7l-1.5 1.5-1-1L19.5 4.5l3 3-1 1L20 7v3.5h1v1.5h-1v6h-1v-6h-1V10.5h3z"/></svg>'
    };

    // ============================================
    // DEFAULT CONFIGURATION
    // ============================================
    const DefaultConfig = {
        // Editor settings
        height: 400,
        minHeight: 200,
        maxHeight: null,
        width: '100%',
        placeholder: 'Start typing...',
        
        // Content settings
        initialContent: '',
        
        // Feature toggles - set to false to disable
        enableLinks: true,
        enableImages: true,
        enableVideos: true,
        enableTables: true,
        enableColors: true,
        enableLists: true,
        enableAlignment: true,
        enableIndent: true,
        enableHeadings: true,
        enableFonts: true,
        enableFontSizes: true,
        enableLineHeight: true,
        
        // Toolbar configuration
        toolbar: [
            ['undo', 'redo'],
            ['formatBlock', 'fontFamily', 'fontSize'],
            ['bold', 'italic', 'underline', 'strikethrough'],
            ['subscript', 'superscript'],
            ['fontColor', 'backgroundColor'],
            ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'],
            ['lineHeight'],
            ['orderedList', 'unorderedList'],
            ['indent', 'outdent'],
            ['link', 'unlink', 'image', 'video', 'table'],
            ['blockquote', 'codeBlock', 'horizontalRule'],
            ['removeFormat', 'clearFormatting'],
            ['sourceCode', 'fullscreen', 'print']
        ],
        
        // Available toolbar buttons
        toolbarButtons: {
            // History
            undo: { icon: 'undo', title: 'Undo (Ctrl+Z)', command: 'undo' },
            redo: { icon: 'redo', title: 'Redo (Ctrl+Y)', command: 'redo' },
            
            // Text formatting
            bold: { icon: 'bold', title: 'Bold (Ctrl+B)', command: 'bold' },
            italic: { icon: 'italic', title: 'Italic (Ctrl+I)', command: 'italic' },
            underline: { icon: 'underline', title: 'Underline (Ctrl+U)', command: 'underline' },
            strikethrough: { icon: 'strikethrough', title: 'Strikethrough', command: 'strikeThrough' },
            subscript: { icon: 'subscript', title: 'Subscript', command: 'subscript' },
            superscript: { icon: 'superscript', title: 'Superscript', command: 'superscript' },
            
            // Alignment
            alignLeft: { icon: 'alignLeft', title: 'Align Left', command: 'justifyLeft' },
            alignCenter: { icon: 'alignCenter', title: 'Align Center', command: 'justifyCenter' },
            alignRight: { icon: 'alignRight', title: 'Align Right', command: 'justifyRight' },
            alignJustify: { icon: 'alignJustify', title: 'Justify', command: 'justifyFull' },
            
            // Lists
            orderedList: { icon: 'orderedList', title: 'Numbered List', command: 'insertOrderedList' },
            unorderedList: { icon: 'unorderedList', title: 'Bullet List', command: 'insertUnorderedList' },
            
            // Indentation
            indent: { icon: 'indent', title: 'Increase Indent', command: 'indent' },
            outdent: { icon: 'outdent', title: 'Decrease Indent', command: 'outdent' },
            
            // Insert elements
            link: { icon: 'link', title: 'Insert Link (Ctrl+K)', action: 'insertLink' },
            unlink: { icon: 'unlink', title: 'Remove Link', command: 'unlink' },
            image: { icon: 'image', title: 'Insert Image', action: 'insertImage' },
            video: { icon: 'video', title: 'Insert Video', action: 'insertVideo' },
            table: { icon: 'table', title: 'Insert Table', action: 'insertTable' },
            horizontalRule: { icon: 'horizontalRule', title: 'Horizontal Line', command: 'insertHorizontalRule' },
            
            // Block elements
            blockquote: { icon: 'blockquote', title: 'Blockquote', command: 'formatBlock', value: 'blockquote' },
            codeBlock: { icon: 'codeBlock', title: 'Code Block', action: 'insertCodeBlock' },
            
            // Formatting
            removeFormat: { icon: 'removeFormat', title: 'Remove Format', command: 'removeFormat' },
            clearFormatting: { icon: 'clearFormatting', title: 'Clear All Formatting', action: 'clearAllFormatting' },
            
            // Colors
            fontColor: { icon: 'fontColor', title: 'Text Color', action: 'fontColor' },
            backgroundColor: { icon: 'backgroundColor', title: 'Background Color', action: 'backgroundColor' },
            
            // View
            sourceCode: { icon: 'sourceCode', title: 'View Source', action: 'toggleSourceView' },
            fullscreen: { icon: 'fullscreen', title: 'Fullscreen', action: 'toggleFullscreen' },
            print: { icon: 'print', title: 'Print', action: 'print' },
            
            // Format block dropdown
            formatBlock: { type: 'dropdown', title: 'Format', action: 'formatBlock' },
            
            // Font family dropdown
            fontFamily: { type: 'dropdown', title: 'Font Family', action: 'fontFamily' },
            
            // Font size dropdown
            fontSize: { type: 'dropdown', title: 'Font Size', action: 'fontSize' },
            
            // Line height dropdown
            lineHeight: { type: 'dropdown', title: 'Line Height', action: 'lineHeight' }
        },
        
        // Format block options
        formatBlockOptions: [
            { value: 'p', label: 'Paragraph' },
            { value: 'h1', label: 'Heading 1' },
            { value: 'h2', label: 'Heading 2' },
            { value: 'h3', label: 'Heading 3' },
            { value: 'h4', label: 'Heading 4' },
            { value: 'h5', label: 'Heading 5' },
            { value: 'h6', label: 'Heading 6' },
            { value: 'blockquote', label: 'Blockquote' },
            { value: 'div', label: 'Div' },
            { value: 'pre', label: 'Preformatted' }
        ],
        
        // Inline format options
        inlineFormatOptions: [
            { command: 'bold', label: 'Bold', shortcut: 'Ctrl+B' },
            { command: 'italic', label: 'Italic', shortcut: 'Ctrl+I' },
            { command: 'underline', label: 'Underline', shortcut: 'Ctrl+U' },
            { command: 'strikeThrough', label: 'Strikethrough' },
            { command: 'superscript', label: 'Superscript' },
            { command: 'subscript', label: 'Subscript' },
            { action: 'insertCode', label: 'Code' }
        ],
        
        // Alignment options
        alignOptions: [
            { command: 'justifyLeft', label: 'Left' },
            { command: 'justifyCenter', label: 'Center' },
            { command: 'justifyRight', label: 'Right' },
            { command: 'justifyFull', label: 'Justify' }
        ],
        
        // Block format options for menu
        blockFormatOptions: [
            { value: 'p', label: 'Paragraph' },
            { value: 'blockquote', label: 'Blockquote' },
            { value: 'div', label: 'Div' },
            { value: 'pre', label: 'Pre' }
        ],
        
        // Show menu bar (TinyMCE style)
        showMenuBar: true,
        
        // Default font family (applied to editor on init)
        defaultFontFamily: 'Arial, sans-serif',
        
        // Default font size (applied to editor on init)
        defaultFontSize: '14px',
        
        // Default line height
        defaultLineHeight: '1.5',
        
        // Font families (matching TinyMCE)
        fontFamilies: [
            { value: 'Andale Mono, monospace', label: 'Andale Mono' },
            { value: 'Arial, sans-serif', label: 'Arial' },
            { value: 'Arial Black, sans-serif', label: 'Arial Black' },
            { value: 'Book Antiqua, Palatino, serif', label: 'Book Antiqua' },
            { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
            { value: 'Courier New, monospace', label: 'Courier New' },
            { value: 'Georgia, serif', label: 'Georgia' },
            { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
            { value: 'Impact, sans-serif', label: 'Impact' },
            { value: 'Symbol', label: 'Symbol' },
            { value: 'Tahoma, sans-serif', label: 'Tahoma' },
            { value: 'Terminal, monospace', label: 'Terminal' },
            { value: 'Times New Roman, serif', label: 'Times New Roman' },
            { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
            { value: 'Verdana, sans-serif', label: 'Verdana' }
        ],
        
        // Font sizes (matching TinyMCE - in pt)
        fontSizes: [
            { value: '8pt', label: '8pt' },
            { value: '10pt', label: '10pt' },
            { value: '12pt', label: '12pt' },
            { value: '14pt', label: '14pt' },
            { value: '18pt', label: '18pt' },
            { value: '24pt', label: '24pt' },
            { value: '36pt', label: '36pt' }
        ],
        
        // Line heights
        lineHeights: [
            { value: '1', label: '1' },
            { value: '1.15', label: '1.15' },
            { value: '1.5', label: '1.5' },
            { value: '2', label: '2' },
            { value: '2.5', label: '2.5' },
            { value: '3', label: '3' }
        ],
        
        // Color palette
        colorPalette: [
            '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
            '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
            '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
            '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
            '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
            '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
            '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
            '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'
        ],
        
        // Table defaults
        tableDefaults: {
            rows: 3,
            cols: 3,
            width: '100%',
            border: '1px solid #ccc'
        },
        
        // Image upload settings
        imageUpload: {
            enabled: true,
            maxSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            handler: null // Custom upload handler function
        },
        
        // Paste settings
        pasteSettings: {
            cleanPaste: true,
            stripStyles: false,
            keepStructure: true
        },
        
        // Auto-save
        autoSave: {
            enabled: false,
            interval: 30000, // 30 seconds
            key: 'richeditor_autosave'
        },
        
        // Spell check
        spellcheck: true,
        
        // Character/word count
        showWordCount: true,
        
        // Plugins
        plugins: [],
        
        // Events
        events: {
            onChange: null,
            onFocus: null,
            onBlur: null,
            onInit: null,
            onImageUpload: null,
            onPaste: null,
            onKeydown: null,
            onKeyup: null
        },
        
        // Theme
        theme: 'light', // 'light' or 'dark'
        
        // Custom CSS
        customCSS: '',
        
        // RTL support
        rtl: false,
        
        // Allowed HTML tags (for sanitization)
        allowedTags: null
    };

    // ============================================
    // MAIN RICHEDITOR CLASS
    // ============================================
    class RichEditor {
        constructor(selector, options = {}) {
            // Handle selector
            if (typeof selector === 'string') {
                this.originalElement = document.querySelector(selector);
            } else if (selector instanceof HTMLElement) {
                this.originalElement = selector;
            }
            
            if (!this.originalElement) {
                throw new Error('RichEditor: Invalid selector or element');
            }
            
            // Merge options with defaults
            this.options = Utils.deepMerge(DefaultConfig, options);
            
            // Initialize state
            this.id = Utils.generateId();
            this.isFullscreen = false;
            this.isSourceView = false;
            this.undoStack = [];
            this.redoStack = [];
            this.currentColor = '#000000';
            this.currentBgColor = '#ffff00';
            this.autoSaveTimer = null;
            this.plugins = {};
            this.savedSelection = null;
            
            // Initialize editor
            this.init();
        }

        /**
         * Initialize the editor
         */
        init() {
            this.createEditorStructure();
            if (this.options.showMenuBar) {
                this.createMenuBar();
            }
            this.createToolbar();
            this.createEditorArea();
            this.createStatusBar();
            this.attachEventListeners();
            this.injectStyles();
            this.loadPlugins();
            
            // Set initial content
            if (this.options.initialContent) {
                this.setContent(this.options.initialContent);
            } else if (this.originalElement.value) {
                this.setContent(this.originalElement.value);
            } else if (this.originalElement.innerHTML) {
                this.setContent(this.originalElement.innerHTML);
            }
            
            // Auto-save setup
            if (this.options.autoSave.enabled) {
                this.setupAutoSave();
            }
            
            // Trigger init event
            this.triggerEvent('onInit', { editor: this });
        }

        /**
         * Create the main editor structure
         */
        createEditorStructure() {
            // Create wrapper
            this.wrapper = Utils.createElement('div', {
                className: `richeditor-wrapper richeditor-theme-${this.options.theme}`,
                id: this.id
            });
            
            // Hide original element
            this.originalElement.style.display = 'none';
            
            // Insert wrapper after original element
            this.originalElement.parentNode.insertBefore(this.wrapper, this.originalElement.nextSibling);
            
            // Set dimensions
            this.wrapper.style.width = typeof this.options.width === 'number' 
                ? `${this.options.width}px` 
                : this.options.width;
        }

        /**
         * Create the menu bar (TinyMCE style)
         */
        createMenuBar() {
            this.menuBar = Utils.createElement('div', { className: 'richeditor-menubar' });
            
            // Build Insert menu items based on enabled features
            const insertItems = [];
            if (this.options.enableImages) {
                insertItems.push({ label: 'Image...', action: () => this.showImageDialog() });
            }
            if (this.options.enableLinks) {
                insertItems.push({ label: 'Link...', shortcut: 'Ctrl+K', action: () => this.showLinkDialog() });
            }
            if (this.options.enableVideos) {
                insertItems.push({ label: 'Video...', action: () => this.showVideoDialog() });
            }
            if (insertItems.length > 0) {
                insertItems.push({ type: 'separator' });
            }
            if (this.options.enableTables) {
                insertItems.push({ label: 'Table...', action: () => this.showTableDialog() });
            }
            insertItems.push({ label: 'Horizontal Rule', action: () => this.execCommand('insertHorizontalRule') });
            insertItems.push({ type: 'separator' });
            insertItems.push({ label: 'Code Block', action: () => this.insertCodeBlock() });
            
            // Build Format menu submenus based on enabled features
            const formatSubmenus = [];
            if (this.options.enableHeadings) {
                formatSubmenus.push({
                    label: 'Headings',
                    submenu: [
                        { label: 'Heading 1', action: () => this.execCommand('formatBlock', 'h1') },
                        { label: 'Heading 2', action: () => this.execCommand('formatBlock', 'h2') },
                        { label: 'Heading 3', action: () => this.execCommand('formatBlock', 'h3') },
                        { label: 'Heading 4', action: () => this.execCommand('formatBlock', 'h4') },
                        { label: 'Heading 5', action: () => this.execCommand('formatBlock', 'h5') },
                        { label: 'Heading 6', action: () => this.execCommand('formatBlock', 'h6') }
                    ]
                });
            }
            formatSubmenus.push({
                label: 'Inline',
                submenu: this.options.inlineFormatOptions.map(opt => ({
                    label: opt.label,
                    shortcut: opt.shortcut,
                    command: opt.command,
                    action: opt.action ? () => this.execAction(opt.action) : null
                }))
            });
            formatSubmenus.push({
                label: 'Blocks',
                submenu: this.options.blockFormatOptions.map(opt => ({
                    label: opt.label,
                    action: () => this.execCommand('formatBlock', opt.value)
                }))
            });
            if (this.options.enableAlignment) {
                formatSubmenus.push({
                    label: 'Align',
                    submenu: this.options.alignOptions.map(opt => ({
                        label: opt.label,
                        command: opt.command
                    }))
                });
            }
            if (this.options.enableLineHeight) {
                formatSubmenus.push({
                    label: 'Line height',
                    submenu: this.options.lineHeights.map(opt => ({
                        label: opt.label,
                        action: () => this.applyLineHeight(opt.value)
                    }))
                });
            }
            
            // Build Format menu items
            const formatItems = [
                { label: 'Bold', shortcut: 'Ctrl+B', command: 'bold' },
                { label: 'Italic', shortcut: 'Ctrl+I', command: 'italic' },
                { label: 'Underline', shortcut: 'Ctrl+U', command: 'underline' },
                { label: 'Strikethrough', command: 'strikeThrough' },
                { type: 'separator' },
                { label: 'Superscript', command: 'superscript' },
                { label: 'Subscript', command: 'subscript' },
                { label: 'Code', action: () => this.insertInlineCode() },
                { type: 'separator' },
                { label: 'Formats', submenu: formatSubmenus },
                { label: 'Blocks', submenu: this.options.blockFormatOptions.map(opt => ({
                    label: opt.label,
                    action: () => this.execCommand('formatBlock', opt.value)
                })) }
            ];
            
            if (this.options.enableFonts) {
                formatItems.push({
                    label: 'Fonts',
                    submenu: this.options.fontFamilies.map(opt => ({
                        label: opt.label,
                        style: `font-family: ${opt.value}`,
                        action: () => this.execCommand('fontName', opt.value)
                    }))
                });
            }
            if (this.options.enableFontSizes) {
                formatItems.push({
                    label: 'Font sizes',
                    submenu: this.options.fontSizes.map(opt => ({
                        label: opt.label,
                        action: () => this.applyFontSize(opt.value)
                    }))
                });
            }
            if (this.options.enableAlignment) {
                formatItems.push({
                    label: 'Align',
                    submenu: this.options.alignOptions.map(opt => ({
                        label: opt.label,
                        command: opt.command
                    }))
                });
            }
            if (this.options.enableLineHeight) {
                formatItems.push({
                    label: 'Line height',
                    submenu: this.options.lineHeights.map(opt => ({
                        label: opt.label,
                        action: () => this.applyLineHeight(opt.value)
                    }))
                });
            }
            formatItems.push({ type: 'separator' });
            formatItems.push({ label: 'Clear formatting', action: () => this.clearAllFormatting() });
            
            const menus = [
                {
                    label: 'Edit',
                    items: [
                        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => this.undo() },
                        { label: 'Redo', shortcut: 'Ctrl+Y', action: () => this.redo() },
                        { type: 'separator' },
                        { label: 'Cut', shortcut: 'Ctrl+X', command: 'cut' },
                        { label: 'Copy', shortcut: 'Ctrl+C', command: 'copy' },
                        { label: 'Paste', shortcut: 'Ctrl+V', command: 'paste' },
                        { type: 'separator' },
                        { label: 'Select All', shortcut: 'Ctrl+A', command: 'selectAll' }
                    ]
                },
                {
                    label: 'Insert',
                    items: insertItems
                },
                {
                    label: 'Format',
                    items: formatItems
                }
            ];
            
            // Add Table menu only if tables are enabled
            if (this.options.enableTables) {
                menus.push({
                    label: 'Table',
                    items: [
                        { label: 'Insert Table...', action: () => this.showTableDialog() },
                        { type: 'separator' },
                        { label: 'Insert Row Before', action: () => this.tableAction('insertRowBefore') },
                        { label: 'Insert Row After', action: () => this.tableAction('insertRowAfter') },
                        { label: 'Insert Column Before', action: () => this.tableAction('insertColBefore') },
                        { label: 'Insert Column After', action: () => this.tableAction('insertColAfter') },
                        { type: 'separator' },
                        { label: 'Delete Row', action: () => this.tableAction('deleteRow') },
                        { label: 'Delete Column', action: () => this.tableAction('deleteCol') },
                        { label: 'Delete Table', action: () => this.tableAction('deleteTable') }
                    ]
                });
            }
            
            menus.forEach(menu => {
                const menuItem = this.createMenuItem(menu);
                this.menuBar.appendChild(menuItem);
            });
            
            this.wrapper.appendChild(this.menuBar);
        }

        /**
         * Create a menu item with dropdown
         */
        createMenuItem(menu) {
            const menuItem = Utils.createElement('div', { className: 'richeditor-menu-item' });
            
            const button = Utils.createElement('button', {
                className: 'richeditor-menu-btn',
                textContent: menu.label,
                type: 'button'
            });
            
            const dropdown = Utils.createElement('div', { className: 'richeditor-menu-dropdown' });
            
            menu.items.forEach(item => {
                if (item.type === 'separator') {
                    dropdown.appendChild(Utils.createElement('div', { className: 'richeditor-menu-separator' }));
                } else if (item.submenu) {
                    const submenuItem = this.createSubmenuItem(item);
                    dropdown.appendChild(submenuItem);
                } else {
                    const menuOption = Utils.createElement('div', { className: 'richeditor-menu-option' });
                    
                    const labelSpan = Utils.createElement('span', { 
                        className: 'richeditor-menu-label',
                        textContent: item.label 
                    });
                    menuOption.appendChild(labelSpan);
                    
                    if (item.shortcut) {
                        const shortcutSpan = Utils.createElement('span', { 
                            className: 'richeditor-menu-shortcut',
                            textContent: item.shortcut 
                        });
                        menuOption.appendChild(shortcutSpan);
                    }
                    
                    menuOption.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.restoreSelection();
                        if (item.command) {
                            this.execCommand(item.command);
                        } else if (item.action) {
                            item.action();
                        }
                        this.closeAllMenus();
                    });
                    
                    dropdown.appendChild(menuOption);
                }
            });
            
            // Save selection when menu button is pressed (before focus is lost)
            button.addEventListener('mousedown', (e) => {
                this.saveSelection();
            });
            
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const wasOpen = menuItem.classList.contains('open');
                this.closeAllMenus();
                if (!wasOpen) {
                    menuItem.classList.add('open');
                }
            });
            
            menuItem.appendChild(button);
            menuItem.appendChild(dropdown);
            
            return menuItem;
        }

        /**
         * Create a submenu item
         */
        createSubmenuItem(item) {
            const submenuWrapper = Utils.createElement('div', { className: 'richeditor-submenu-wrapper' });
            
            const submenuTrigger = Utils.createElement('div', { className: 'richeditor-menu-option richeditor-has-submenu' });
            const labelSpan = Utils.createElement('span', { 
                className: 'richeditor-menu-label',
                textContent: item.label 
            });
            const arrowSpan = Utils.createElement('span', { 
                className: 'richeditor-submenu-arrow',
                innerHTML: '&#9656;'
            });
            submenuTrigger.appendChild(labelSpan);
            submenuTrigger.appendChild(arrowSpan);
            
            const submenu = Utils.createElement('div', { className: 'richeditor-submenu' });
            
            item.submenu.forEach(subItem => {
                if (subItem.submenu) {
                    // Nested submenu
                    const nestedSubmenu = this.createSubmenuItem(subItem);
                    submenu.appendChild(nestedSubmenu);
                } else {
                    const subOption = Utils.createElement('div', { className: 'richeditor-menu-option' });
                    
                    if (subItem.style) {
                        subOption.style.cssText = subItem.style;
                    }
                    
                    const subLabelSpan = Utils.createElement('span', { 
                        className: 'richeditor-menu-label',
                        textContent: subItem.label 
                    });
                    subOption.appendChild(subLabelSpan);
                    
                    if (subItem.shortcut) {
                        const shortcutSpan = Utils.createElement('span', { 
                            className: 'richeditor-menu-shortcut',
                            textContent: subItem.shortcut 
                        });
                        subOption.appendChild(shortcutSpan);
                    }
                    
                    subOption.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.restoreSelection();
                        if (subItem.command) {
                            this.execCommand(subItem.command);
                        } else if (subItem.action) {
                            subItem.action();
                        }
                        this.closeAllMenus();
                    });
                    
                    submenu.appendChild(subOption);
                }
            });
            
            submenuWrapper.appendChild(submenuTrigger);
            submenuWrapper.appendChild(submenu);
            
            return submenuWrapper;
        }

        /**
         * Close all menu dropdowns
         */
        closeAllMenus() {
            document.querySelectorAll('.richeditor-menu-item.open').forEach(m => {
                m.classList.remove('open');
            });
        }

        /**
         * Insert inline code
         */
        insertInlineCode() {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            const selectedText = range.toString();
            
            if (selectedText) {
                const code = document.createElement('code');
                code.textContent = selectedText;
                range.deleteContents();
                range.insertNode(code);
            } else {
                this.execCommand('insertHTML', '<code>&nbsp;</code>');
            }
            
            this.syncContent();
        }

        /**
         * Table manipulation actions
         */
        tableAction(action) {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            let node = selection.anchorNode;
            let cell = null;
            let row = null;
            let table = null;
            
            // Find the table, row, and cell
            while (node && node !== this.editor) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'TD' || node.tagName === 'TH') cell = node;
                    if (node.tagName === 'TR') row = node;
                    if (node.tagName === 'TABLE') table = node;
                }
                node = node.parentNode;
            }
            
            if (!table) return;
            
            this.saveState();
            
            switch (action) {
                case 'insertRowBefore':
                    if (row) {
                        const newRow = row.cloneNode(true);
                        Array.from(newRow.cells).forEach(c => c.innerHTML = '&nbsp;');
                        row.parentNode.insertBefore(newRow, row);
                    }
                    break;
                    
                case 'insertRowAfter':
                    if (row) {
                        const newRow = row.cloneNode(true);
                        Array.from(newRow.cells).forEach(c => c.innerHTML = '&nbsp;');
                        row.parentNode.insertBefore(newRow, row.nextSibling);
                    }
                    break;
                    
                case 'insertColBefore':
                    if (cell) {
                        const cellIndex = cell.cellIndex;
                        Array.from(table.rows).forEach(r => {
                            const newCell = r.insertCell(cellIndex);
                            newCell.innerHTML = '&nbsp;';
                        });
                    }
                    break;
                    
                case 'insertColAfter':
                    if (cell) {
                        const cellIndex = cell.cellIndex + 1;
                        Array.from(table.rows).forEach(r => {
                            const newCell = r.insertCell(cellIndex);
                            newCell.innerHTML = '&nbsp;';
                        });
                    }
                    break;
                    
                case 'deleteRow':
                    if (row && table.rows.length > 1) {
                        row.remove();
                    }
                    break;
                    
                case 'deleteCol':
                    if (cell && table.rows[0].cells.length > 1) {
                        const cellIndex = cell.cellIndex;
                        Array.from(table.rows).forEach(r => {
                            if (r.cells[cellIndex]) r.deleteCell(cellIndex);
                        });
                    }
                    break;
                    
                case 'deleteTable':
                    table.remove();
                    break;
            }
            
            this.syncContent();
        }

        /**
         * Check if a toolbar button is enabled based on feature toggles
         */
        isButtonEnabled(buttonName) {
            const disabledButtons = {
                // Links
                link: !this.options.enableLinks,
                unlink: !this.options.enableLinks,
                // Images
                image: !this.options.enableImages,
                // Videos
                video: !this.options.enableVideos,
                // Tables
                table: !this.options.enableTables,
                // Colors
                fontColor: !this.options.enableColors,
                backgroundColor: !this.options.enableColors,
                // Lists
                orderedList: !this.options.enableLists,
                unorderedList: !this.options.enableLists,
                // Alignment
                alignLeft: !this.options.enableAlignment,
                alignCenter: !this.options.enableAlignment,
                alignRight: !this.options.enableAlignment,
                alignJustify: !this.options.enableAlignment,
                // Indent
                indent: !this.options.enableIndent,
                outdent: !this.options.enableIndent,
                // Headings/Format
                formatBlock: !this.options.enableHeadings,
                // Fonts
                fontFamily: !this.options.enableFonts,
                // Font sizes
                fontSize: !this.options.enableFontSizes,
                // Line height
                lineHeight: !this.options.enableLineHeight
            };
            
            return !disabledButtons[buttonName];
        }

        /**
         * Create the toolbar
         */
        createToolbar() {
            this.toolbar = Utils.createElement('div', { className: 'richeditor-toolbar' });
            
            this.options.toolbar.forEach(group => {
                const groupEl = Utils.createElement('div', { className: 'richeditor-toolbar-group' });
                let hasButtons = false;
                
                group.forEach(buttonName => {
                    // Skip disabled buttons
                    if (!this.isButtonEnabled(buttonName)) return;
                    
                    const buttonConfig = this.options.toolbarButtons[buttonName];
                    if (!buttonConfig) return;
                    
                    hasButtons = true;
                    
                    if (buttonConfig.type === 'dropdown') {
                        groupEl.appendChild(this.createDropdown(buttonName, buttonConfig));
                    } else {
                        groupEl.appendChild(this.createToolbarButton(buttonName, buttonConfig));
                    }
                });
                
                // Only add group if it has buttons
                if (hasButtons) {
                    this.toolbar.appendChild(groupEl);
                }
            });
            
            this.wrapper.appendChild(this.toolbar);
        }

        /**
         * Create a toolbar button
         */
        createToolbarButton(name, config) {
            const button = Utils.createElement('button', {
                className: 'richeditor-toolbar-btn',
                title: config.title,
                type: 'button',
                'data-command': config.command || '',
                'data-action': config.action || '',
                'data-value': config.value || ''
            });
            
            button.innerHTML = Icons[config.icon] || config.icon;
            button.dataset.name = name;
            
            return button;
        }

        /**
         * Create a dropdown
         */
        createDropdown(name, config) {
            const dropdown = Utils.createElement('div', { className: 'richeditor-dropdown' });
            
            const button = Utils.createElement('button', {
                className: 'richeditor-toolbar-btn richeditor-dropdown-btn',
                title: config.title,
                type: 'button'
            });
            
            // Set default label based on dropdown type
            let defaultLabel = 'Paragraph';
            if (name === 'fontFamily') defaultLabel = 'Font';
            else if (name === 'fontSize') defaultLabel = '14pt';
            else if (name === 'lineHeight') defaultLabel = 'Line Height';
            
            const label = Utils.createElement('span', { 
                className: 'richeditor-dropdown-label',
                textContent: defaultLabel
            });
            
            button.appendChild(label);
            button.innerHTML += Icons.chevronDown;
            
            const menu = Utils.createElement('div', { className: 'richeditor-dropdown-menu' });
            
            // Add appropriate class for styling
            if (name === 'fontFamily') menu.classList.add('richeditor-font-menu');
            if (name === 'fontSize') menu.classList.add('richeditor-fontsize-menu');
            if (name === 'lineHeight') menu.classList.add('richeditor-lineheight-menu');
            
            if (name === 'formatBlock') {
                this.options.formatBlockOptions.forEach(opt => {
                    const item = Utils.createElement('div', {
                        className: 'richeditor-dropdown-item',
                        'data-value': opt.value,
                        innerHTML: `<${opt.value}>${opt.label}</${opt.value}>`
                    });
                    item.addEventListener('click', () => {
                        this.restoreSelection();
                        this.execCommand('formatBlock', opt.value);
                        label.textContent = opt.label;
                        menu.classList.remove('show');
                    });
                    menu.appendChild(item);
                });
            } else if (name === 'fontFamily') {
                this.options.fontFamilies.forEach(opt => {
                    const item = Utils.createElement('div', {
                        className: 'richeditor-dropdown-item',
                        'data-value': opt.value
                    });
                    item.style.fontFamily = opt.value;
                    item.textContent = opt.label;
                    item.addEventListener('click', () => {
                        this.restoreSelection();
                        this.execCommand('fontName', opt.value);
                        label.textContent = opt.label;
                        menu.classList.remove('show');
                    });
                    menu.appendChild(item);
                });
            } else if (name === 'fontSize') {
                this.options.fontSizes.forEach(opt => {
                    const item = Utils.createElement('div', {
                        className: 'richeditor-dropdown-item',
                        'data-value': opt.value
                    });
                    item.textContent = opt.label;
                    item.addEventListener('click', () => {
                        this.restoreSelection();
                        this.applyFontSize(opt.value);
                        label.textContent = opt.label;
                        menu.classList.remove('show');
                    });
                    menu.appendChild(item);
                });
            } else if (name === 'lineHeight') {
                this.options.lineHeights.forEach(opt => {
                    const item = Utils.createElement('div', {
                        className: 'richeditor-dropdown-item',
                        'data-value': opt.value
                    });
                    item.textContent = opt.label;
                    item.addEventListener('click', () => {
                        this.restoreSelection();
                        this.applyLineHeight(opt.value);
                        label.textContent = opt.label;
                        menu.classList.remove('show');
                    });
                    menu.appendChild(item);
                });
            }
            
            // Save selection on mousedown (before click steals focus)
            button.addEventListener('mousedown', (e) => {
                this.saveSelection();
            });
            
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.richeditor-dropdown-menu.show').forEach(m => {
                    if (m !== menu) m.classList.remove('show');
                });
                menu.classList.toggle('show');
            });
            
            dropdown.appendChild(button);
            dropdown.appendChild(menu);
            
            // Store reference for updating state
            dropdown.dataset.dropdownType = name;
            dropdown.labelElement = label;
            
            return dropdown;
        }

        /**
         * Create the editor content area
         */
        createEditorArea() {
            // Create editor container
            this.editorContainer = Utils.createElement('div', { className: 'richeditor-container' });
            
            // Create contenteditable area
            this.editor = Utils.createElement('div', {
                className: 'richeditor-content',
                innerHTML: '<p><br></p>'
            });
            this.editor.setAttribute('contenteditable', 'true');
            this.editor.setAttribute('spellcheck', this.options.spellcheck);
            this.editor.setAttribute('data-placeholder', this.options.placeholder);
            
            // Apply default font styles
            if (this.options.defaultFontFamily) {
                this.editor.style.fontFamily = this.options.defaultFontFamily;
            }
            if (this.options.defaultFontSize) {
                this.editor.style.fontSize = this.options.defaultFontSize;
            }
            if (this.options.defaultLineHeight) {
                this.editor.style.lineHeight = this.options.defaultLineHeight;
            }
            
            if (this.options.rtl) {
                this.editor.setAttribute('dir', 'rtl');
            }
            
            // Create source code textarea
            this.sourceEditor = Utils.createElement('textarea', {
                className: 'richeditor-source'
            });
            this.sourceEditor.style.display = 'none';
            
            // Set height
            const height = typeof this.options.height === 'number' 
                ? `${this.options.height}px` 
                : this.options.height;
            this.editor.style.minHeight = height;
            this.sourceEditor.style.minHeight = height;
            
            if (this.options.maxHeight) {
                this.editor.style.maxHeight = typeof this.options.maxHeight === 'number'
                    ? `${this.options.maxHeight}px`
                    : this.options.maxHeight;
            }
            
            this.editorContainer.appendChild(this.editor);
            this.editorContainer.appendChild(this.sourceEditor);
            this.wrapper.appendChild(this.editorContainer);
        }

        /**
         * Create status bar
         */
        createStatusBar() {
            this.statusBar = Utils.createElement('div', { className: 'richeditor-statusbar' });
            
            if (this.options.showWordCount) {
                this.wordCount = Utils.createElement('span', { 
                    className: 'richeditor-wordcount',
                    textContent: 'Words: 0 | Characters: 0'
                });
                this.statusBar.appendChild(this.wordCount);
            }
            
            const resizeHandle = Utils.createElement('div', { className: 'richeditor-resize' });
            this.statusBar.appendChild(resizeHandle);
            
            this.wrapper.appendChild(this.statusBar);
            
            // Make editor resizable
            this.setupResize(resizeHandle);
        }

        /**
         * Setup resize functionality
         */
        setupResize(handle) {
            let startY, startHeight;
            
            const onMouseMove = (e) => {
                const newHeight = startHeight + (e.clientY - startY);
                if (newHeight >= this.options.minHeight) {
                    this.editor.style.minHeight = `${newHeight}px`;
                    this.sourceEditor.style.minHeight = `${newHeight}px`;
                }
            };
            
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            
            handle.addEventListener('mousedown', (e) => {
                startY = e.clientY;
                startHeight = this.editor.offsetHeight;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        }

        /**
         * Attach event listeners
         */
        attachEventListeners() {
            // Save selection on mousedown (before click steals focus)
            this.toolbar.addEventListener('mousedown', (e) => {
                const btn = e.target.closest('.richeditor-toolbar-btn');
                if (btn) {
                    this.saveSelection();
                }
            });
            
            // Toolbar button clicks
            this.toolbar.addEventListener('click', (e) => {
                const btn = e.target.closest('.richeditor-toolbar-btn');
                if (!btn || btn.classList.contains('richeditor-dropdown-btn')) return;
                
                const command = btn.dataset.command;
                const action = btn.dataset.action;
                const value = btn.dataset.value;
                
                if (command) {
                    this.execCommand(command, value);
                } else if (action) {
                    this.execAction(action, value);
                }
                
                this.editor.focus();
            });
            
            // Editor content changes
            this.editor.addEventListener('input', Utils.debounce(() => {
                this.syncContent();
                this.updateWordCount();
                this.triggerEvent('onChange', { content: this.getContent() });
            }, 100));
            
            // Focus/blur events
            this.editor.addEventListener('focus', () => {
                this.wrapper.classList.add('focused');
                this.triggerEvent('onFocus');
            });
            
            this.editor.addEventListener('blur', () => {
                this.wrapper.classList.remove('focused');
                this.triggerEvent('onBlur');
            });
            
            // Keyboard shortcuts
            this.editor.addEventListener('keydown', (e) => {
                this.handleKeydown(e);
                this.triggerEvent('onKeydown', { event: e });
            });
            
            this.editor.addEventListener('keyup', (e) => {
                this.updateToolbarState();
                this.triggerEvent('onKeyup', { event: e });
            });
            
            // Selection change
            document.addEventListener('selectionchange', () => {
                if (document.activeElement === this.editor) {
                    this.updateToolbarState();
                }
            });
            
            // Paste handling
            this.editor.addEventListener('paste', (e) => {
                this.handlePaste(e);
            });
            
            // Drop handling
            this.editor.addEventListener('drop', (e) => {
                this.handleDrop(e);
            });
            
            // Click outside to close dropdowns and menus
            document.addEventListener('click', (e) => {
                // Close dropdown menus
                document.querySelectorAll('.richeditor-dropdown-menu.show').forEach(m => {
                    m.classList.remove('show');
                });
                
                // Close menu bar menus
                if (!e.target.closest('.richeditor-menu-item')) {
                    this.closeAllMenus();
                }
            });
            
            // Source editor sync
            this.sourceEditor.addEventListener('input', () => {
                if (this.isSourceView) {
                    this.syncFromSource();
                }
            });
        }

        /**
         * Handle keyboard shortcuts
         */
        handleKeydown(e) {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modKey = isMac ? e.metaKey : e.ctrlKey;
            
            if (modKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        this.execCommand('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.execCommand('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.execCommand('underline');
                        break;
                    case 'k':
                        e.preventDefault();
                        this.execAction('insertLink');
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        break;
                }
            }
            
            // Tab handling for lists
            if (e.key === 'Tab') {
                const selection = window.getSelection();
                const parentLi = selection.anchorNode.parentElement.closest('li');
                if (parentLi) {
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.execCommand('outdent');
                    } else {
                        this.execCommand('indent');
                    }
                }
            }
        }

        /**
         * Handle paste events
         */
        handlePaste(e) {
            if (!this.options.pasteSettings.cleanPaste) return;
            
            e.preventDefault();
            
            let content = '';
            
            if (e.clipboardData) {
                // Try to get HTML content
                const html = e.clipboardData.getData('text/html');
                const text = e.clipboardData.getData('text/plain');
                
                if (html && this.options.pasteSettings.keepStructure) {
                    content = Utils.sanitizeHTML(html, this.options.allowedTags);
                    
                    if (this.options.pasteSettings.stripStyles) {
                        const temp = document.createElement('div');
                        temp.innerHTML = content;
                        temp.querySelectorAll('*').forEach(el => {
                            el.removeAttribute('style');
                            el.removeAttribute('class');
                        });
                        content = temp.innerHTML;
                    }
                } else {
                    // Convert plain text to HTML
                    content = text.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
                }
            }
            
            this.execCommand('insertHTML', content);
            this.triggerEvent('onPaste', { content });
        }

        /**
         * Handle drop events (for images)
         */
        handleDrop(e) {
            e.preventDefault();
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    if (file.type.startsWith('image/')) {
                        this.handleImageFile(file);
                    }
                });
            }
        }

        /**
         * Handle image file upload
         */
        handleImageFile(file) {
            if (!this.options.imageUpload.enabled) return;
            
            if (file.size > this.options.imageUpload.maxSize) {
                alert(`Image size exceeds maximum allowed (${this.options.imageUpload.maxSize / 1024 / 1024}MB)`);
                return;
            }
            
            if (!this.options.imageUpload.allowedTypes.includes(file.type)) {
                alert('Image type not allowed');
                return;
            }
            
            if (this.options.imageUpload.handler) {
                // Use custom handler
                this.options.imageUpload.handler(file, (url) => {
                    this.insertImage(url);
                });
            } else {
                // Use base64
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.insertImage(e.target.result);
                };
                reader.readAsDataURL(file);
            }
            
            this.triggerEvent('onImageUpload', { file });
        }

        /**
         * Execute a command
         */
        execCommand(command, value = null) {
            this.saveState();
            
            // Restore selection if we have a saved one
            if (this.savedSelection) {
                this.restoreSelection();
            }
            
            this.editor.focus();
            
            if (command === 'formatBlock' && value) {
                value = `<${value}>`;
            }
            
            document.execCommand(command, false, value);
            this.syncContent();
            this.updateToolbarState();
        }

        /**
         * Save the current selection (call before focus is lost)
         */
        saveSelection() {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                // Only save if selection is within the editor
                if (this.editor && this.editor.contains(range.commonAncestorContainer)) {
                    this.savedSelection = range.cloneRange();
                }
            }
        }

        /**
         * Restore the previously saved selection
         */
        restoreSelection() {
            if (this.savedSelection) {
                try {
                    this.editor.focus();
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(this.savedSelection);
                } catch (e) {
                    // Selection might be invalid, clear it
                    this.savedSelection = null;
                }
            }
        }

        /**
         * Clear the saved selection
         */
        clearSavedSelection() {
            this.savedSelection = null;
        }

        /**
         * Apply font size using CSS (more reliable than deprecated fontSize command)
         */
        applyFontSize(size) {
            this.saveState();
            
            // Restore saved selection if available
            if (this.savedSelection) {
                this.restoreSelection();
            }
            
            this.editor.focus();
            
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            
            if (range.collapsed) {
                // If no selection, create a span with zero-width space for cursor positioning
                const span = document.createElement('span');
                span.style.fontSize = size;
                // Use a zero-width space to keep the span from collapsing
                span.innerHTML = '&#8203;';
                range.insertNode(span);
                
                // Move cursor after the zero-width space (inside the span)
                const newRange = document.createRange();
                newRange.setStart(span.firstChild, 1);
                newRange.setEnd(span.firstChild, 1);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } else {
                // Wrap selection in span with font size
                const span = document.createElement('span');
                span.style.fontSize = size;
                
                try {
                    span.appendChild(range.extractContents());
                    range.insertNode(span);
                    
                    // Select the new content
                    selection.removeAllRanges();
                    const newRange = document.createRange();
                    newRange.selectNodeContents(span);
                    selection.addRange(newRange);
                } catch (e) {
                    // Fallback to execCommand
                    document.execCommand('fontSize', false, '7');
                    // Then replace with proper CSS
                    this.editor.querySelectorAll('font[size="7"]').forEach(el => {
                        const newSpan = document.createElement('span');
                        newSpan.style.fontSize = size;
                        newSpan.innerHTML = el.innerHTML;
                        el.parentNode.replaceChild(newSpan, el);
                    });
                }
            }
            
            this.syncContent();
            this.updateToolbarState();
        }

        /**
         * Apply line height to all selected paragraphs/blocks
         */
        applyLineHeight(height) {
            this.saveState();
            
            // Restore saved selection if available
            if (this.savedSelection) {
                this.restoreSelection();
            }
            
            this.editor.focus();
            
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            
            // Block-level tags that can have line-height applied
            const blockSelector = 'p, div, h1, h2, h3, h4, h5, h6, li, blockquote, pre';
            
            // Get all block elements in the editor
            const allBlocks = this.editor.querySelectorAll(blockSelector);
            
            // Also check if editor direct children are text nodes wrapped in nothing
            // (this handles cases where text is directly in editor without p tags)
            
            let appliedCount = 0;
            
            // Check each block element to see if it intersects with selection
            allBlocks.forEach(block => {
                if (this.rangeIntersectsElement(range, block)) {
                    block.style.lineHeight = height;
                    appliedCount++;
                }
            });
            
            // If no blocks found (maybe text directly in editor), apply to common ancestor
            if (appliedCount === 0) {
                let target = range.commonAncestorContainer;
                if (target.nodeType === Node.TEXT_NODE) {
                    target = target.parentElement;
                }
                if (target && target !== this.editor) {
                    target.style.lineHeight = height;
                } else if (target === this.editor) {
                    // Apply to the editor itself as fallback
                    this.editor.style.lineHeight = height;
                }
            }
            
            this.syncContent();
            this.updateToolbarState();
        }

        /**
         * Check if a range intersects with an element
         */
        rangeIntersectsElement(range, element) {
            if (!element || !range) return false;
            
            try {
                // Create a range that encompasses the element
                const elementRange = document.createRange();
                elementRange.selectNodeContents(element);
                
                // Check if ranges overlap
                // Range.compareBoundaryPoints returns:
                // -1 if first is before second
                // 0 if equal
                // 1 if first is after second
                
                const startsBeforeEnd = range.compareBoundaryPoints(Range.START_TO_END, elementRange) >= 0;
                const endsAfterStart = range.compareBoundaryPoints(Range.END_TO_START, elementRange) <= 0;
                
                return startsBeforeEnd && endsAfterStart;
            } catch (e) {
                // Fallback: check if range intersects node
                return range.intersectsNode(element);
            }
        }

        /**
         * Execute a custom action
         */
        execAction(action, value = null) {
            switch (action) {
                case 'insertLink':
                    this.showLinkDialog();
                    break;
                case 'insertImage':
                    this.showImageDialog();
                    break;
                case 'insertVideo':
                    this.showVideoDialog();
                    break;
                case 'insertTable':
                    this.showTableDialog();
                    break;
                case 'insertCodeBlock':
                    this.insertCodeBlock();
                    break;
                case 'clearAllFormatting':
                    this.clearAllFormatting();
                    break;
                case 'fontColor':
                    this.showColorPicker('foreColor');
                    break;
                case 'backgroundColor':
                    this.showColorPicker('hiliteColor');
                    break;
                case 'toggleSourceView':
                    this.toggleSourceView();
                    break;
                case 'toggleFullscreen':
                    this.toggleFullscreen();
                    break;
                case 'print':
                    this.print();
                    break;
            }
        }

        /**
         * Show link dialog
         */
        showLinkDialog() {
            const selection = window.getSelection();
            let existingUrl = '';
            let existingText = selection.toString();
            
            // Check if selection is inside a link
            const parentLink = selection.anchorNode?.parentElement?.closest('a');
            if (parentLink) {
                existingUrl = parentLink.href;
                existingText = parentLink.textContent;
            }
            
            const dialog = this.createDialog('Insert Link', `
                <div class="richeditor-dialog-field">
                    <label>URL</label>
                    <input type="url" id="richeditor-link-url" placeholder="https://example.com" value="${existingUrl}">
                </div>
                <div class="richeditor-dialog-field">
                    <label>Text</label>
                    <input type="text" id="richeditor-link-text" placeholder="Link text" value="${existingText}">
                </div>
                <div class="richeditor-dialog-field">
                    <label>
                        <input type="checkbox" id="richeditor-link-target"> Open in new tab
                    </label>
                </div>
            `, () => {
                const url = document.getElementById('richeditor-link-url').value;
                const text = document.getElementById('richeditor-link-text').value || url;
                const newTab = document.getElementById('richeditor-link-target').checked;
                
                if (url) {
                    const target = newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
                    this.execCommand('insertHTML', `<a href="${url}"${target}>${text}</a>`);
                }
            });
        }

        /**
         * Show image dialog
         */
        showImageDialog() {
            const dialog = this.createDialog('Insert Image', `
                <div class="richeditor-dialog-tabs">
                    <button type="button" class="active" data-tab="url">URL</button>
                    <button type="button" data-tab="upload">Upload</button>
                </div>
                <div class="richeditor-dialog-tab-content" data-content="url">
                    <div class="richeditor-dialog-field">
                        <label>Image URL</label>
                        <input type="url" id="richeditor-image-url" placeholder="https://example.com/image.jpg">
                    </div>
                </div>
                <div class="richeditor-dialog-tab-content" data-content="upload" style="display: none;">
                    <div class="richeditor-dialog-field">
                        <label>Upload Image</label>
                        <input type="file" id="richeditor-image-upload" accept="image/*">
                    </div>
                </div>
                <div class="richeditor-dialog-field">
                    <label>Alt Text</label>
                    <input type="text" id="richeditor-image-alt" placeholder="Image description">
                </div>
                <div class="richeditor-dialog-field">
                    <label>Width (optional)</label>
                    <input type="text" id="richeditor-image-width" placeholder="e.g., 300px or 50%">
                </div>
            `, () => {
                const url = document.getElementById('richeditor-image-url').value;
                const alt = document.getElementById('richeditor-image-alt').value;
                const width = document.getElementById('richeditor-image-width').value;
                const fileInput = document.getElementById('richeditor-image-upload');
                
                if (fileInput.files.length > 0) {
                    this.handleImageFile(fileInput.files[0]);
                } else if (url) {
                    let style = width ? ` style="width: ${width}"` : '';
                    this.execCommand('insertHTML', `<img src="${url}" alt="${alt}"${style}>`);
                }
            });
            
            // Tab switching
            dialog.querySelectorAll('.richeditor-dialog-tabs button').forEach(btn => {
                btn.addEventListener('click', () => {
                    dialog.querySelectorAll('.richeditor-dialog-tabs button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    dialog.querySelectorAll('.richeditor-dialog-tab-content').forEach(c => {
                        c.style.display = c.dataset.content === btn.dataset.tab ? 'block' : 'none';
                    });
                });
            });
        }

        /**
         * Show video dialog
         */
        showVideoDialog() {
            const dialog = this.createDialog('Insert Video', `
                <div class="richeditor-dialog-field">
                    <label>Video URL (YouTube, Vimeo, or direct link)</label>
                    <input type="url" id="richeditor-video-url" placeholder="https://www.youtube.com/watch?v=...">
                </div>
                <div class="richeditor-dialog-field">
                    <label>Width</label>
                    <input type="text" id="richeditor-video-width" value="560" placeholder="560">
                </div>
                <div class="richeditor-dialog-field">
                    <label>Height</label>
                    <input type="text" id="richeditor-video-height" value="315" placeholder="315">
                </div>
            `, () => {
                let url = document.getElementById('richeditor-video-url').value;
                const width = document.getElementById('richeditor-video-width').value || 560;
                const height = document.getElementById('richeditor-video-height').value || 315;
                
                if (url) {
                    // Convert YouTube URLs to embed format
                    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
                    if (youtubeMatch) {
                        url = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
                    }
                    
                    // Convert Vimeo URLs to embed format
                    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                    if (vimeoMatch) {
                        url = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                    }
                    
                    const iframe = `<iframe width="${width}" height="${height}" src="${url}" frameborder="0" allowfullscreen></iframe>`;
                    this.execCommand('insertHTML', `<div class="richeditor-video-wrapper">${iframe}</div>`);
                }
            });
        }

        /**
         * Show table dialog
         */
        showTableDialog() {
            const dialog = this.createDialog('Insert Table', `
                <div class="richeditor-table-grid" id="richeditor-table-grid">
                    ${this.generateTableGrid()}
                </div>
                <div class="richeditor-table-size">
                    <span id="richeditor-table-size">1 x 1</span>
                </div>
                <div class="richeditor-dialog-field">
                    <label>Or enter size manually:</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="number" id="richeditor-table-rows" min="1" max="20" value="3" style="width: 70px;">
                        <span style="line-height: 32px;">x</span>
                        <input type="number" id="richeditor-table-cols" min="1" max="20" value="3" style="width: 70px;">
                    </div>
                </div>
            `, () => {
                const rows = parseInt(document.getElementById('richeditor-table-rows').value) || 3;
                const cols = parseInt(document.getElementById('richeditor-table-cols').value) || 3;
                this.insertTable(rows, cols);
            });
            
            // Grid hover handling
            const grid = document.getElementById('richeditor-table-grid');
            const sizeDisplay = document.getElementById('richeditor-table-size');
            const rowsInput = document.getElementById('richeditor-table-rows');
            const colsInput = document.getElementById('richeditor-table-cols');
            
            grid.querySelectorAll('.richeditor-table-cell').forEach(cell => {
                cell.addEventListener('mouseover', () => {
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    
                    grid.querySelectorAll('.richeditor-table-cell').forEach(c => {
                        const cRow = parseInt(c.dataset.row);
                        const cCol = parseInt(c.dataset.col);
                        c.classList.toggle('selected', cRow <= row && cCol <= col);
                    });
                    
                    sizeDisplay.textContent = `${row} x ${col}`;
                    rowsInput.value = row;
                    colsInput.value = col;
                });
            });
        }

        /**
         * Generate table grid for dialog
         */
        generateTableGrid() {
            let html = '';
            for (let i = 1; i <= 10; i++) {
                for (let j = 1; j <= 10; j++) {
                    html += `<div class="richeditor-table-cell" data-row="${i}" data-col="${j}"></div>`;
                }
            }
            return html;
        }

        /**
         * Insert a table
         */
        insertTable(rows, cols) {
            let html = '<table class="richeditor-table"><tbody>';
            for (let i = 0; i < rows; i++) {
                html += '<tr>';
                for (let j = 0; j < cols; j++) {
                    html += '<td><br></td>';
                }
                html += '</tr>';
            }
            html += '</tbody></table><p><br></p>';
            
            this.execCommand('insertHTML', html);
        }

        /**
         * Insert code block
         */
        insertCodeBlock() {
            const selection = window.getSelection();
            const text = selection.toString() || 'Code here...';
            this.execCommand('insertHTML', `<pre><code>${text}</code></pre><p><br></p>`);
        }

        /**
         * Insert image
         */
        insertImage(src, alt = '') {
            this.execCommand('insertHTML', `<img src="${src}" alt="${alt}">`);
        }

        /**
         * Show color picker
         */
        showColorPicker(command) {
            // Save selection before opening dialog (focus will be lost)
            this.saveSelection();
            
            const currentColor = command === 'foreColor' ? this.currentColor : this.currentBgColor;
            
            const dialog = this.createDialog(command === 'foreColor' ? 'Text Color' : 'Background Color', `
                <div class="richeditor-color-palette">
                    ${this.options.colorPalette.map(color => 
                        `<div class="richeditor-color-cell${color === currentColor ? ' selected' : ''}" 
                             style="background-color: ${color}" 
                             data-color="${color}"></div>`
                    ).join('')}
                </div>
                <div class="richeditor-dialog-field">
                    <label>Custom Color</label>
                    <input type="color" id="richeditor-custom-color" value="${currentColor}">
                </div>
            `, () => {
                const color = document.getElementById('richeditor-custom-color').value;
                this.restoreSelection();
                this.execCommand(command, color);
                if (command === 'foreColor') {
                    this.currentColor = color;
                } else {
                    this.currentBgColor = color;
                }
            });
            
            // Color cell click handling
            dialog.querySelectorAll('.richeditor-color-cell').forEach(cell => {
                cell.addEventListener('click', () => {
                    const color = cell.dataset.color;
                    document.getElementById('richeditor-custom-color').value = color;
                    dialog.querySelectorAll('.richeditor-color-cell').forEach(c => c.classList.remove('selected'));
                    cell.classList.add('selected');
                });
            });
        }

        /**
         * Create a dialog
         */
        createDialog(title, content, onConfirm) {
            // Remove existing dialog
            const existing = document.querySelector('.richeditor-dialog-overlay');
            if (existing) existing.remove();
            
            const overlay = Utils.createElement('div', { className: 'richeditor-dialog-overlay' });
            const dialog = Utils.createElement('div', { className: 'richeditor-dialog' });
            
            dialog.innerHTML = `
                <div class="richeditor-dialog-header">
                    <h3>${title}</h3>
                    <button type="button" class="richeditor-dialog-close">&times;</button>
                </div>
                <div class="richeditor-dialog-body">
                    ${content}
                </div>
                <div class="richeditor-dialog-footer">
                    <button type="button" class="richeditor-btn richeditor-btn-secondary richeditor-dialog-cancel">Cancel</button>
                    <button type="button" class="richeditor-btn richeditor-btn-primary richeditor-dialog-confirm">OK</button>
                </div>
            `;
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            // Focus first input
            setTimeout(() => {
                const input = dialog.querySelector('input:not([type="hidden"]):not([type="checkbox"])');
                if (input) input.focus();
            }, 100);
            
            // Event handlers
            const closeDialog = () => overlay.remove();
            
            dialog.querySelector('.richeditor-dialog-close').addEventListener('click', closeDialog);
            dialog.querySelector('.richeditor-dialog-cancel').addEventListener('click', closeDialog);
            dialog.querySelector('.richeditor-dialog-confirm').addEventListener('click', () => {
                onConfirm();
                closeDialog();
            });
            
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeDialog();
            });
            
            // Enter key to confirm
            dialog.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    onConfirm();
                    closeDialog();
                }
                if (e.key === 'Escape') {
                    closeDialog();
                }
            });
            
            return dialog;
        }

        /**
         * Clear all formatting
         */
        clearAllFormatting() {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const text = selection.toString();
                this.execCommand('insertText', text);
            }
        }

        /**
         * Toggle source view
         */
        toggleSourceView() {
            this.isSourceView = !this.isSourceView;
            
            if (this.isSourceView) {
                this.sourceEditor.value = this.formatHTML(this.editor.innerHTML);
                this.editor.style.display = 'none';
                this.sourceEditor.style.display = 'block';
                this.toolbar.classList.add('disabled');
            } else {
                this.editor.innerHTML = this.sourceEditor.value;
                this.editor.style.display = 'block';
                this.sourceEditor.style.display = 'none';
                this.toolbar.classList.remove('disabled');
                this.syncContent();
            }
            
            this.updateToolbarButton('sourceCode', this.isSourceView);
        }

        /**
         * Format HTML for display
         */
        formatHTML(html) {
            let formatted = '';
            let indent = 0;
            const tab = '  ';
            
            html.split(/>\s*</).forEach(element => {
                if (element.match(/^\/\w/)) {
                    indent--;
                }
                formatted += tab.repeat(Math.max(0, indent)) + '<' + element + '>\n';
                if (element.match(/^<?\w[^>]*[^\/]$/) && !element.startsWith('input') && !element.startsWith('br') && !element.startsWith('hr') && !element.startsWith('img')) {
                    indent++;
                }
            });
            
            return formatted.substring(1, formatted.length - 2);
        }

        /**
         * Toggle fullscreen mode
         */
        toggleFullscreen() {
            this.isFullscreen = !this.isFullscreen;
            this.wrapper.classList.toggle('fullscreen', this.isFullscreen);
            document.body.style.overflow = this.isFullscreen ? 'hidden' : '';
            
            this.updateToolbarButton('fullscreen', this.isFullscreen);
        }

        /**
         * Print content
         */
        print() {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        img { max-width: 100%; }
                        table { border-collapse: collapse; width: 100%; }
                        td, th { border: 1px solid #ccc; padding: 8px; }
                    </style>
                </head>
                <body>
                    ${this.editor.innerHTML}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }

        /**
         * Update toolbar button state
         */
        updateToolbarButton(name, active) {
            const btn = this.toolbar.querySelector(`[data-name="${name}"]`);
            if (btn) {
                btn.classList.toggle('active', active);
            }
        }

        /**
         * Update toolbar state based on selection
         */
        updateToolbarState() {
            const commands = ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'];
            
            commands.forEach(cmd => {
                const isActive = document.queryCommandState(cmd === 'strikethrough' ? 'strikeThrough' : cmd);
                this.updateToolbarButton(cmd, isActive);
            });
            
            // Alignment
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].forEach(cmd => {
                const btnName = cmd.replace('justify', 'align').replace('Full', 'Justify');
                this.updateToolbarButton(btnName.charAt(0).toLowerCase() + btnName.slice(1), document.queryCommandState(cmd));
            });
            
            // Lists
            this.updateToolbarButton('orderedList', document.queryCommandState('insertOrderedList'));
            this.updateToolbarButton('unorderedList', document.queryCommandState('insertUnorderedList'));
        }

        /**
         * Sync content to original element
         */
        syncContent() {
            const content = this.editor.innerHTML;
            if (this.originalElement.tagName === 'TEXTAREA' || this.originalElement.tagName === 'INPUT') {
                this.originalElement.value = content;
            } else {
                this.originalElement.innerHTML = content;
            }
        }

        /**
         * Sync from source editor
         */
        syncFromSource() {
            // Don't update editor while in source view
            if (this.isSourceView) return;
            this.editor.innerHTML = this.sourceEditor.value;
            this.syncContent();
        }

        /**
         * Update word count
         */
        updateWordCount() {
            if (!this.wordCount) return;
            
            const text = this.editor.innerText || '';
            const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
            const chars = text.length;
            
            this.wordCount.textContent = `Words: ${words} | Characters: ${chars}`;
        }

        /**
         * Save current state for undo
         */
        saveState() {
            this.undoStack.push(this.editor.innerHTML);
            if (this.undoStack.length > 100) {
                this.undoStack.shift();
            }
            this.redoStack = [];
        }

        /**
         * Undo
         */
        undo() {
            if (this.undoStack.length > 0) {
                this.redoStack.push(this.editor.innerHTML);
                this.editor.innerHTML = this.undoStack.pop();
                this.syncContent();
            }
        }

        /**
         * Redo
         */
        redo() {
            if (this.redoStack.length > 0) {
                this.undoStack.push(this.editor.innerHTML);
                this.editor.innerHTML = this.redoStack.pop();
                this.syncContent();
            }
        }

        /**
         * Setup auto-save
         */
        setupAutoSave() {
            this.autoSaveTimer = setInterval(() => {
                localStorage.setItem(this.options.autoSave.key, this.getContent());
            }, this.options.autoSave.interval);
        }

        /**
         * Load auto-saved content
         */
        loadAutoSave() {
            const saved = localStorage.getItem(this.options.autoSave.key);
            if (saved) {
                this.setContent(saved);
            }
        }

        /**
         * Clear auto-save
         */
        clearAutoSave() {
            localStorage.removeItem(this.options.autoSave.key);
        }

        /**
         * Trigger event callback
         */
        triggerEvent(eventName, data = {}) {
            if (this.options.events[eventName]) {
                this.options.events[eventName](data);
            }
        }

        /**
         * Load plugins
         */
        loadPlugins() {
            this.options.plugins.forEach(plugin => {
                if (typeof plugin === 'function') {
                    const instance = new plugin(this);
                    this.plugins[instance.name] = instance;
                }
            });
        }

        /**
         * Inject CSS styles
         */
        injectStyles() {
            if (document.getElementById('richeditor-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'richeditor-styles';
            style.textContent = this.getStyles();
            document.head.appendChild(style);
            
            // Inject custom CSS
            if (this.options.customCSS) {
                const customStyle = document.createElement('style');
                customStyle.textContent = this.options.customCSS;
                document.head.appendChild(customStyle);
            }
        }

        /**
         * Get editor styles
         */
        getStyles() {
            return `
                /* RichEditor Styles */
                .richeditor-wrapper {
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background: #fff;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                
                .richeditor-wrapper.focused {
                    border-color: #0066cc;
                    box-shadow: 0 0 0 2px rgba(0,102,204,0.2);
                }
                
                .richeditor-wrapper.fullscreen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    width: 100% !important;
                    height: 100% !important;
                    z-index: 99999;
                    border-radius: 0;
                    display: flex;
                    flex-direction: column;
                }
                
                .richeditor-wrapper.fullscreen .richeditor-container {
                    flex: 1;
                }
                
                .richeditor-wrapper.fullscreen .richeditor-content {
                    min-height: 100% !important;
                    max-height: none !important;
                }
                
                /* Menu Bar (TinyMCE style) */
                .richeditor-menubar {
                    display: flex;
                    padding: 0;
                    border-bottom: 1px solid #eee;
                    background: #fff;
                }
                
                .richeditor-menu-item {
                    position: relative;
                }
                
                .richeditor-menu-btn {
                    padding: 8px 12px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    font-size: 14px;
                    color: #333;
                    transition: background 0.15s;
                }
                
                .richeditor-menu-btn:hover,
                .richeditor-menu-item.open .richeditor-menu-btn {
                    background: #e8e8e8;
                }
                
                .richeditor-menu-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    min-width: 200px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 0 0 4px 4px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1001;
                    display: none;
                }
                
                .richeditor-menu-item.open .richeditor-menu-dropdown {
                    display: block;
                }
                
                .richeditor-menu-option {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 16px;
                    cursor: pointer;
                    transition: background 0.15s;
                    font-size: 14px;
                    color: #333;
                }
                
                .richeditor-menu-option:hover {
                    background: #f0f0f0;
                }
                
                .richeditor-menu-label {
                    flex: 1;
                }
                
                .richeditor-menu-shortcut {
                    color: #888;
                    font-size: 12px;
                    margin-left: 20px;
                }
                
                .richeditor-menu-separator {
                    height: 1px;
                    background: #e0e0e0;
                    margin: 4px 0;
                }
                
                /* Submenu */
                .richeditor-submenu-wrapper {
                    position: relative;
                }
                
                .richeditor-has-submenu {
                    padding-right: 24px !important;
                }
                
                .richeditor-submenu-arrow {
                    position: absolute;
                    right: 12px;
                    font-size: 10px;
                    color: #666;
                }
                
                .richeditor-submenu {
                    position: absolute;
                    left: 100%;
                    top: 0;
                    min-width: 180px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1002;
                    display: none;
                }
                
                .richeditor-submenu-wrapper:hover > .richeditor-submenu {
                    display: block;
                }
                
                /* Font menu styling */
                .richeditor-font-menu {
                    min-width: 180px;
                }
                
                .richeditor-font-menu .richeditor-dropdown-item {
                    padding: 6px 12px;
                }
                
                .richeditor-fontsize-menu {
                    min-width: 80px;
                }
                
                .richeditor-lineheight-menu {
                    min-width: 80px;
                }
                
                /* Toolbar */
                .richeditor-toolbar {
                    display: flex;
                    flex-wrap: wrap;
                    padding: 8px;
                    border-bottom: 1px solid #eee;
                    background: #fafafa;
                    gap: 4px;
                }
                
                .richeditor-toolbar.disabled .richeditor-toolbar-btn:not([data-action="toggleSourceView"]) {
                    opacity: 0.5;
                    pointer-events: none;
                }
                
                .richeditor-toolbar-group {
                    display: flex;
                    gap: 2px;
                    padding-right: 8px;
                    border-right: 1px solid #e0e0e0;
                    margin-right: 4px;
                }
                
                .richeditor-toolbar-group:last-child {
                    border-right: none;
                    margin-right: 0;
                    padding-right: 0;
                }
                
                .richeditor-toolbar-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    border: none;
                    background: transparent;
                    border-radius: 4px;
                    cursor: pointer;
                    color: #444;
                    transition: all 0.15s ease;
                }
                
                .richeditor-toolbar-btn:hover {
                    background: #e8e8e8;
                }
                
                .richeditor-toolbar-btn.active {
                    background: #0066cc;
                    color: white;
                }
                
                .richeditor-toolbar-btn svg {
                    flex-shrink: 0;
                }
                
                /* Dropdown */
                .richeditor-dropdown {
                    position: relative;
                }
                
                .richeditor-dropdown-btn {
                    width: auto !important;
                    padding: 0 8px !important;
                    gap: 4px;
                    font-size: 13px;
                }
                
                .richeditor-dropdown-label {
                    min-width: 80px;
                    text-align: left;
                }
                
                .richeditor-dropdown-menu {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    min-width: 150px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1000;
                    display: none;
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .richeditor-dropdown-menu.show {
                    display: block;
                }
                
                .richeditor-dropdown-item {
                    padding: 8px 12px;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                
                .richeditor-dropdown-item:hover {
                    background: #f5f5f5;
                }
                
                .richeditor-dropdown-item h1,
                .richeditor-dropdown-item h2,
                .richeditor-dropdown-item h3,
                .richeditor-dropdown-item h4,
                .richeditor-dropdown-item h5,
                .richeditor-dropdown-item h6 {
                    margin: 0;
                    font-weight: normal;
                }
                
                /* Editor content */
                .richeditor-container {
                    position: relative;
                }
                
                .richeditor-content {
                    padding: 16px;
                    outline: none;
                    overflow-y: auto;
                    line-height: 1.6;
                }
                
                .richeditor-content:empty:before {
                    content: attr(data-placeholder);
                    color: #999;
                    pointer-events: none;
                }
                
                .richeditor-content p {
                    margin: 0 0 1em 0;
                }
                
                .richeditor-content img {
                    max-width: 100%;
                    height: auto;
                    cursor: pointer;
                }
                
                .richeditor-content img:hover {
                    outline: 2px solid #0066cc;
                }
                
                .richeditor-content blockquote {
                    margin: 1em 0;
                    padding: 10px 20px;
                    border-left: 4px solid #0066cc;
                    background: #f9f9f9;
                }
                
                .richeditor-content pre {
                    background: #2d2d2d;
                    color: #f8f8f2;
                    padding: 16px;
                    border-radius: 4px;
                    overflow-x: auto;
                    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
                }
                
                .richeditor-content code {
                    background: #f4f4f4;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
                    font-size: 0.9em;
                }
                
                .richeditor-content pre code {
                    background: transparent;
                    padding: 0;
                }
                
                .richeditor-content table,
                .richeditor-table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1em 0;
                }
                
                .richeditor-content td,
                .richeditor-content th,
                .richeditor-table td,
                .richeditor-table th {
                    border: 1px solid #ddd;
                    padding: 8px 12px;
                    min-width: 50px;
                }
                
                .richeditor-content th,
                .richeditor-table th {
                    background: #f5f5f5;
                    font-weight: 600;
                }
                
                .richeditor-video-wrapper {
                    position: relative;
                    padding-bottom: 56.25%;
                    height: 0;
                    overflow: hidden;
                    margin: 1em 0;
                }
                
                .richeditor-video-wrapper iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                
                /* Source editor */
                .richeditor-source {
                    width: 100%;
                    padding: 16px;
                    border: none;
                    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
                    font-size: 13px;
                    line-height: 1.5;
                    resize: none;
                    box-sizing: border-box;
                }
                
                /* Status bar */
                .richeditor-statusbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 4px 12px;
                    border-top: 1px solid #eee;
                    background: #fafafa;
                    font-size: 12px;
                    color: #666;
                }
                
                .richeditor-resize {
                    width: 16px;
                    height: 16px;
                    cursor: ns-resize;
                    background: linear-gradient(135deg, transparent 50%, #ccc 50%, #ccc 60%, transparent 60%, transparent 70%, #ccc 70%, #ccc 80%, transparent 80%);
                }
                
                /* Dialog */
                .richeditor-dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100000;
                }
                
                .richeditor-dialog {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    min-width: 400px;
                    max-width: 90vw;
                    max-height: 90vh;
                    overflow: auto;
                }
                
                .richeditor-dialog-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid #eee;
                }
                
                .richeditor-dialog-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }
                
                .richeditor-dialog-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #999;
                    line-height: 1;
                    padding: 0;
                }
                
                .richeditor-dialog-close:hover {
                    color: #333;
                }
                
                .richeditor-dialog-body {
                    padding: 20px;
                }
                
                .richeditor-dialog-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    padding: 16px 20px;
                    border-top: 1px solid #eee;
                    background: #fafafa;
                }
                
                .richeditor-dialog-field {
                    margin-bottom: 16px;
                }
                
                .richeditor-dialog-field:last-child {
                    margin-bottom: 0;
                }
                
                .richeditor-dialog-field label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    font-size: 14px;
                }
                
                .richeditor-dialog-field input[type="text"],
                .richeditor-dialog-field input[type="url"],
                .richeditor-dialog-field input[type="number"],
                .richeditor-dialog-field select {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                    box-sizing: border-box;
                }
                
                .richeditor-dialog-field input:focus,
                .richeditor-dialog-field select:focus {
                    border-color: #0066cc;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(0,102,204,0.2);
                }
                
                .richeditor-dialog-tabs {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 16px;
                }
                
                .richeditor-dialog-tabs button {
                    padding: 8px 16px;
                    border: 1px solid #ddd;
                    background: #f5f5f5;
                    cursor: pointer;
                    border-radius: 4px;
                }
                
                .richeditor-dialog-tabs button.active {
                    background: #0066cc;
                    color: white;
                    border-color: #0066cc;
                }
                
                /* Buttons */
                .richeditor-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.15s;
                }
                
                .richeditor-btn-primary {
                    background: #0066cc;
                    color: white;
                }
                
                .richeditor-btn-primary:hover {
                    background: #0052a3;
                }
                
                .richeditor-btn-secondary {
                    background: #e8e8e8;
                    color: #333;
                }
                
                .richeditor-btn-secondary:hover {
                    background: #d8d8d8;
                }
                
                /* Color palette */
                .richeditor-color-palette {
                    display: grid;
                    grid-template-columns: repeat(10, 1fr);
                    gap: 2px;
                    margin-bottom: 16px;
                }
                
                .richeditor-color-cell {
                    width: 24px;
                    height: 24px;
                    border: 1px solid #ddd;
                    cursor: pointer;
                    border-radius: 2px;
                }
                
                .richeditor-color-cell:hover {
                    transform: scale(1.2);
                    z-index: 1;
                }
                
                .richeditor-color-cell.selected {
                    outline: 2px solid #0066cc;
                    outline-offset: 1px;
                }
                
                /* Table grid */
                .richeditor-table-grid {
                    display: grid;
                    grid-template-columns: repeat(10, 1fr);
                    gap: 2px;
                    margin-bottom: 8px;
                }
                
                .richeditor-table-cell {
                    width: 20px;
                    height: 20px;
                    border: 1px solid #ddd;
                    background: white;
                    cursor: pointer;
                }
                
                .richeditor-table-cell.selected {
                    background: #0066cc;
                    border-color: #0066cc;
                }
                
                .richeditor-table-size {
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 16px;
                }
                
                /* Dark theme */
                .richeditor-theme-dark {
                    background: #1e1e1e;
                    border-color: #333;
                }
                
                .richeditor-theme-dark .richeditor-toolbar {
                    background: #2d2d2d;
                    border-color: #333;
                }
                
                .richeditor-theme-dark .richeditor-toolbar-group {
                    border-color: #444;
                }
                
                .richeditor-theme-dark .richeditor-toolbar-btn {
                    color: #ccc;
                }
                
                .richeditor-theme-dark .richeditor-toolbar-btn:hover {
                    background: #444;
                }
                
                .richeditor-theme-dark .richeditor-content {
                    background: #1e1e1e;
                    color: #e0e0e0;
                }
                
                .richeditor-theme-dark .richeditor-content blockquote {
                    background: #2d2d2d;
                    border-color: #0066cc;
                }
                
                .richeditor-theme-dark .richeditor-content code {
                    background: #2d2d2d;
                }
                
                .richeditor-theme-dark .richeditor-statusbar {
                    background: #2d2d2d;
                    border-color: #333;
                    color: #999;
                }
                
                .richeditor-theme-dark .richeditor-dropdown-menu {
                    background: #2d2d2d;
                    border-color: #444;
                }
                
                .richeditor-theme-dark .richeditor-dropdown-item:hover {
                    background: #3d3d3d;
                }
                
                .richeditor-theme-dark .richeditor-source {
                    background: #1e1e1e;
                    color: #e0e0e0;
                }
            `;
        }

        // ============================================
        // PUBLIC API METHODS
        // ============================================

        /**
         * Get editor content as HTML
         */
        getContent() {
            return this.editor.innerHTML;
        }

        /**
         * Set editor content
         */
        setContent(html) {
            this.editor.innerHTML = html;
            this.syncContent();
            this.updateWordCount();
        }

        /**
         * Get content as plain text
         */
        getText() {
            return this.editor.innerText;
        }

        /**
         * Insert content at cursor position
         */
        insertContent(html) {
            this.execCommand('insertHTML', html);
        }

        /**
         * Focus the editor
         */
        focus() {
            this.editor.focus();
        }

        /**
         * Blur the editor
         */
        blur() {
            this.editor.blur();
        }

        /**
         * Check if editor is empty
         */
        isEmpty() {
            return this.editor.innerText.trim() === '';
        }

        /**
         * Clear editor content
         */
        clear() {
            this.setContent('<p><br></p>');
        }

        /**
         * Enable the editor
         */
        enable() {
            this.editor.setAttribute('contenteditable', 'true');
            this.wrapper.classList.remove('disabled');
        }

        /**
         * Disable the editor
         */
        disable() {
            this.editor.setAttribute('contenteditable', 'false');
            this.wrapper.classList.add('disabled');
        }

        /**
         * Destroy the editor
         */
        destroy() {
            // Clear auto-save timer
            if (this.autoSaveTimer) {
                clearInterval(this.autoSaveTimer);
            }
            
            // Show original element
            this.originalElement.style.display = '';
            
            // Remove wrapper
            this.wrapper.remove();
        }

        /**
         * Get word count
         */
        getWordCount() {
            const text = this.editor.innerText || '';
            return text.trim().split(/\s+/).filter(w => w.length > 0).length;
        }

        /**
         * Get character count
         */
        getCharCount() {
            return (this.editor.innerText || '').length;
        }

        /**
         * Set theme
         */
        setTheme(theme) {
            this.wrapper.classList.remove(`richeditor-theme-${this.options.theme}`);
            this.options.theme = theme;
            this.wrapper.classList.add(`richeditor-theme-${theme}`);
        }

        /**
         * Register a plugin
         */
        registerPlugin(plugin) {
            if (typeof plugin === 'function') {
                const instance = new plugin(this);
                this.plugins[instance.name] = instance;
            }
        }

        /**
         * Add custom toolbar button
         */
        addToolbarButton(name, config) {
            this.options.toolbarButtons[name] = config;
            const button = this.createToolbarButton(name, config);
            
            // Add to last group or create new group
            const lastGroup = this.toolbar.querySelector('.richeditor-toolbar-group:last-child');
            if (lastGroup) {
                lastGroup.appendChild(button);
            } else {
                const group = Utils.createElement('div', { className: 'richeditor-toolbar-group' });
                group.appendChild(button);
                this.toolbar.appendChild(group);
            }
        }

        /**
         * Execute callback on selection change
         */
        onSelectionChange(callback) {
            document.addEventListener('selectionchange', () => {
                if (document.activeElement === this.editor) {
                    const selection = window.getSelection();
                    callback(selection);
                }
            });
        }
    }

    // ============================================
    // PLUGIN BASE CLASS
    // ============================================
    class RichEditorPlugin {
        constructor(editor) {
            this.editor = editor;
            this.name = 'unnamed';
            this.init();
        }

        init() {
            // Override in subclass
        }

        destroy() {
            // Override in subclass
        }
    }

    // ============================================
    // BUILT-IN PLUGINS
    // ============================================

    // Find and Replace Plugin
    class FindReplacePlugin extends RichEditorPlugin {
        constructor(editor) {
            super(editor);
            this.name = 'findReplace';
        }

        init() {
            this.editor.addToolbarButton('findReplace', {
                icon: 'findReplace',
                title: 'Find & Replace (Ctrl+H)',
                action: 'openFindReplace'
            });

            // Override action
            const originalExecAction = this.editor.execAction.bind(this.editor);
            this.editor.execAction = (action, value) => {
                if (action === 'openFindReplace') {
                    this.showDialog();
                } else {
                    originalExecAction(action, value);
                }
            };
        }

        showDialog() {
            this.editor.createDialog('Find & Replace', `
                <div class="richeditor-dialog-field">
                    <label>Find</label>
                    <input type="text" id="richeditor-find-text" placeholder="Text to find">
                </div>
                <div class="richeditor-dialog-field">
                    <label>Replace with</label>
                    <input type="text" id="richeditor-replace-text" placeholder="Replacement text">
                </div>
                <div class="richeditor-dialog-field">
                    <label>
                        <input type="checkbox" id="richeditor-match-case"> Match case
                    </label>
                </div>
            `, () => {
                const findText = document.getElementById('richeditor-find-text').value;
                const replaceText = document.getElementById('richeditor-replace-text').value;
                const matchCase = document.getElementById('richeditor-match-case').checked;

                if (findText) {
                    this.replaceAll(findText, replaceText, matchCase);
                }
            });
        }

        replaceAll(find, replace, matchCase) {
            let content = this.editor.editor.innerHTML;
            const flags = matchCase ? 'g' : 'gi';
            const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
            content = content.replace(regex, replace);
            this.editor.setContent(content);
        }
    }

    // Word Count Plugin (Enhanced)
    class WordCountPlugin extends RichEditorPlugin {
        constructor(editor) {
            super(editor);
            this.name = 'wordCountEnhanced';
        }

        init() {
            this.editor.addToolbarButton('wordCountDialog', {
                icon: 'wordCount',
                title: 'Word Statistics',
                action: 'showWordStats'
            });

            const originalExecAction = this.editor.execAction.bind(this.editor);
            this.editor.execAction = (action, value) => {
                if (action === 'showWordStats') {
                    this.showStats();
                } else {
                    originalExecAction(action, value);
                }
            };
        }

        showStats() {
            const text = this.editor.getText();
            const words = text.trim().split(/\s+/).filter(w => w.length > 0);
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

            this.editor.createDialog('Document Statistics', `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #0066cc;">${words.length}</div>
                        <div style="color: #666;">Words</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #0066cc;">${text.length}</div>
                        <div style="color: #666;">Characters</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #0066cc;">${sentences.length}</div>
                        <div style="color: #666;">Sentences</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #0066cc;">${paragraphs.length}</div>
                        <div style="color: #666;">Paragraphs</div>
                    </div>
                </div>
                <div style="margin-top: 16px; padding: 12px; background: #f9f9f9; border-radius: 4px;">
                    <strong>Reading Time:</strong> ~${Math.ceil(words.length / 200)} min
                </div>
            `, () => {});
        }
    }

    // Emoji Plugin
    class EmojiPlugin extends RichEditorPlugin {
        constructor(editor) {
            super(editor);
            this.name = 'emoji';
            this.emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '👍', '👎', '👋', '✌️', '🤞', '🙏', '❤️', '💔', '💯', '✅', '❌', '⭐', '🔥', '💡', '📌', '📎', '🎉', '🎊'];
        }

        init() {
            this.editor.addToolbarButton('emoji', {
                icon: 'emoji',
                title: 'Insert Emoji',
                action: 'showEmojiPicker'
            });

            const originalExecAction = this.editor.execAction.bind(this.editor);
            this.editor.execAction = (action, value) => {
                if (action === 'showEmojiPicker') {
                    this.showPicker();
                } else {
                    originalExecAction(action, value);
                }
            };
        }

        showPicker() {
            this.editor.createDialog('Insert Emoji', `
                <div style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; max-height: 300px; overflow-y: auto;">
                    ${this.emojis.map(emoji => `
                        <button type="button" class="emoji-btn" data-emoji="${emoji}" 
                                style="font-size: 24px; padding: 8px; border: none; background: none; cursor: pointer; border-radius: 4px;">
                            ${emoji}
                        </button>
                    `).join('')}
                </div>
            `, () => {});

            // Add click handlers
            document.querySelectorAll('.emoji-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.editor.insertContent(btn.dataset.emoji);
                    document.querySelector('.richeditor-dialog-overlay').remove();
                });
                btn.addEventListener('mouseover', () => {
                    btn.style.background = '#f0f0f0';
                });
                btn.addEventListener('mouseout', () => {
                    btn.style.background = 'none';
                });
            });
        }
    }

    // Special Characters Plugin
    class SpecialCharsPlugin extends RichEditorPlugin {
        constructor(editor) {
            super(editor);
            this.name = 'specialChars';
            this.chars = [
                { char: '©', name: 'Copyright' },
                { char: '®', name: 'Registered' },
                { char: '™', name: 'Trademark' },
                { char: '€', name: 'Euro' },
                { char: '£', name: 'Pound' },
                { char: '¥', name: 'Yen' },
                { char: '¢', name: 'Cent' },
                { char: '°', name: 'Degree' },
                { char: '±', name: 'Plus/Minus' },
                { char: '×', name: 'Multiply' },
                { char: '÷', name: 'Divide' },
                { char: '¼', name: 'Quarter' },
                { char: '½', name: 'Half' },
                { char: '¾', name: '3/4' },
                { char: '∞', name: 'Infinity' },
                { char: '≠', name: 'Not Equal' },
                { char: '≤', name: 'Less/Equal' },
                { char: '≥', name: 'Greater/Equal' },
                { char: '←', name: 'Left Arrow' },
                { char: '→', name: 'Right Arrow' },
                { char: '↑', name: 'Up Arrow' },
                { char: '↓', name: 'Down Arrow' },
                { char: '↔', name: 'Left-Right' },
                { char: '•', name: 'Bullet' },
                { char: '…', name: 'Ellipsis' },
                { char: '—', name: 'Em Dash' },
                { char: '–', name: 'En Dash' },
                { char: '§', name: 'Section' },
                { char: '¶', name: 'Paragraph' },
                { char: '†', name: 'Dagger' },
                { char: '‡', name: 'Double Dagger' },
                { char: '‰', name: 'Per Mille' }
            ];
        }

        init() {
            this.editor.addToolbarButton('specialChar', {
                icon: 'specialChar',
                title: 'Special Characters',
                action: 'showSpecialChars'
            });

            const originalExecAction = this.editor.execAction.bind(this.editor);
            this.editor.execAction = (action, value) => {
                if (action === 'showSpecialChars') {
                    this.showPicker();
                } else {
                    originalExecAction(action, value);
                }
            };
        }

        showPicker() {
            this.editor.createDialog('Special Characters', `
                <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px;">
                    ${this.chars.map(item => `
                        <button type="button" class="special-char-btn" data-char="${item.char}" title="${item.name}"
                                style="font-size: 20px; padding: 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px;">
                            ${item.char}
                        </button>
                    `).join('')}
                </div>
            `, () => {});

            document.querySelectorAll('.special-char-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.editor.insertContent(btn.dataset.char);
                    document.querySelector('.richeditor-dialog-overlay').remove();
                });
                btn.addEventListener('mouseover', () => {
                    btn.style.background = '#f0f0f0';
                });
                btn.addEventListener('mouseout', () => {
                    btn.style.background = 'white';
                });
            });
        }
    }

    // Export to global scope
    global.RichEditor = RichEditor;
    global.RichEditorPlugin = RichEditorPlugin;
    global.RichEditorPlugins = {
        FindReplace: FindReplacePlugin,
        WordCount: WordCountPlugin,
        Emoji: EmojiPlugin,
        SpecialChars: SpecialCharsPlugin
    };

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define('RichEditor', [], function() {
            return RichEditor;
        });
    }

    // CommonJS support
    if (typeof module === 'object' && module.exports) {
        module.exports = RichEditor;
        module.exports.RichEditorPlugin = RichEditorPlugin;
        module.exports.RichEditorPlugins = global.RichEditorPlugins;
    }

})(typeof window !== 'undefined' ? window : this);

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   RichEditor v1.0.0 | © 2025 Bhargav Battula | MIT License
 * ═══════════════════════════════════════════════════════════════════════════
 */
