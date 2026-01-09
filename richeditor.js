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
 * ║   A comprehensive, free, and open-source rich text editor with all        ║
 * ║   standard features and plugin support. Built with vanilla JavaScript     ║
 * ║   - no dependencies required.                                             ║
 * ║                                                                           ║
 * ║   Features:                                                               ║
 * ║   • Professional menu bar (Edit, Insert, Format, Table)                   ║
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
         * Clean HTML pasted from Microsoft Word while preserving formatting
         */
        cleanWordHTML: function(html) {
            // Check if this is Word content
            const isWordContent = html.includes('mso-') || 
                                  html.includes('MsoNormal') || 
                                  html.includes('urn:schemas-microsoft-com') ||
                                  html.includes('xmlns:w=') ||
                                  html.includes('xmlns:o=');
            
            if (!isWordContent) {
                return html;
            }
            
            let cleaned = html;
            
            // Remove Word XML tags and namespaces
            cleaned = cleaned.replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi, '');
            cleaned = cleaned.replace(/<w:[^>]*>[\s\S]*?<\/w:[^>]*>/gi, '');
            cleaned = cleaned.replace(/<m:[^>]*>[\s\S]*?<\/m:[^>]*>/gi, '');
            cleaned = cleaned.replace(/<st1:[^>]*>[\s\S]*?<\/st1:[^>]*>/gi, '');
            
            // Remove XML declarations and namespaces
            cleaned = cleaned.replace(/<\?xml[^>]*>/gi, '');
            cleaned = cleaned.replace(/xmlns[^=]*="[^"]*"/gi, '');
            
            // Remove conditional comments
            cleaned = cleaned.replace(/<!--\[if[^>]*>[\s\S]*?<!\[endif\]-->/gi, '');
            cleaned = cleaned.replace(/<!--\[if[^>]*>[\s\S]*?-->/gi, '');
            cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
            
            // Remove Word-specific tags but keep content
            cleaned = cleaned.replace(/<\/?(meta|link|style|xml|font)[^>]*>/gi, '');
            
            // Parse and process
            const doc = new DOMParser().parseFromString(cleaned, 'text/html');
            
            // Process all elements
            const processElement = (el) => {
                // Remove Word-specific classes
                if (el.className) {
                    el.className = el.className.replace(/Mso[a-zA-Z]+/g, '').trim();
                    if (!el.className) {
                        el.removeAttribute('class');
                    }
                }
                
                // Get computed/inline styles to preserve
                const style = el.getAttribute('style') || '';
                const preservedStyles = [];
                
                // Extract important style properties
                const styleMap = {
                    'font-family': /font-family:\s*([^;]+)/i,
                    'font-size': /font-size:\s*([^;]+)/i,
                    'color': /(?:^|;)\s*color:\s*([^;]+)/i,
                    'background-color': /background-color:\s*([^;]+)/i,
                    'background': /(?:^|;)\s*background:\s*([^;]+)/i,
                    'font-weight': /font-weight:\s*([^;]+)/i,
                    'font-style': /font-style:\s*([^;]+)/i,
                    'text-decoration': /text-decoration:\s*([^;]+)/i,
                    'text-align': /text-align:\s*([^;]+)/i,
                    'line-height': /line-height:\s*([^;]+)/i,
                    'margin-left': /margin-left:\s*([^;]+)/i,
                    'padding-left': /padding-left:\s*([^;]+)/i
                };
                
                for (const [prop, regex] of Object.entries(styleMap)) {
                    const match = style.match(regex);
                    if (match) {
                        let value = match[1].trim();
                        
                        // Clean up font-family
                        if (prop === 'font-family') {
                            // Remove quotes and normalize
                            value = value.replace(/["']/g, '');
                            // Map common Word fonts
                            if (value.toLowerCase().includes('calibri')) {
                                value = 'Calibri, Arial, sans-serif';
                            } else if (value.toLowerCase().includes('times')) {
                                value = 'Times New Roman, serif';
                            } else if (value.toLowerCase().includes('arial')) {
                                value = 'Arial, sans-serif';
                            }
                        }
                        
                        // Convert font-size from pt to match editor
                        if (prop === 'font-size') {
                            // Keep pt values, convert px if needed
                            if (value.includes('pt')) {
                                // Round to nearest standard size
                                const ptVal = parseFloat(value);
                                const standardSizes = [8, 10, 12, 14, 18, 24, 36];
                                const closest = standardSizes.reduce((prev, curr) => 
                                    Math.abs(curr - ptVal) < Math.abs(prev - ptVal) ? curr : prev
                                );
                                value = closest + 'pt';
                            }
                        }
                        
                        // Skip mso-* properties
                        if (!value.includes('mso-')) {
                            preservedStyles.push(`${prop}: ${value}`);
                        }
                    }
                }
                
                // Set cleaned style
                if (preservedStyles.length > 0) {
                    el.setAttribute('style', preservedStyles.join('; '));
                } else {
                    el.removeAttribute('style');
                }
                
                // Remove Word-specific attributes
                const attrsToRemove = [];
                for (const attr of el.attributes) {
                    if (attr.name.startsWith('v:') || 
                        attr.name.startsWith('o:') ||
                        attr.name === 'lang' ||
                        attr.name === 'xml:lang') {
                        attrsToRemove.push(attr.name);
                    }
                }
                attrsToRemove.forEach(attr => el.removeAttribute(attr));
            };
            
            // Process all elements
            doc.body.querySelectorAll('*').forEach(processElement);
            
            // Convert <b> to <strong> and <i> to <em> for consistency
            doc.body.querySelectorAll('b').forEach(el => {
                const strong = document.createElement('strong');
                strong.innerHTML = el.innerHTML;
                if (el.getAttribute('style')) {
                    strong.setAttribute('style', el.getAttribute('style'));
                }
                el.parentNode.replaceChild(strong, el);
            });
            
            doc.body.querySelectorAll('i').forEach(el => {
                const em = document.createElement('em');
                em.innerHTML = el.innerHTML;
                if (el.getAttribute('style')) {
                    em.setAttribute('style', el.getAttribute('style'));
                }
                el.parentNode.replaceChild(em, el);
            });
            
            // Remove empty spans
            doc.body.querySelectorAll('span').forEach(span => {
                if (!span.getAttribute('style') && !span.className && span.innerHTML === span.textContent) {
                    span.outerHTML = span.innerHTML;
                }
            });
            
            // Clean up empty paragraphs with only &nbsp;
            doc.body.querySelectorAll('p').forEach(p => {
                if (p.innerHTML.trim() === '&nbsp;' || p.innerHTML.trim() === '') {
                    p.innerHTML = '<br>';
                }
            });
            
            // Get cleaned HTML
            let result = doc.body.innerHTML;
            
            // Final cleanup
            result = result.replace(/\s+/g, ' '); // Normalize whitespace
            result = result.replace(/>\s+</g, '><'); // Remove whitespace between tags
            result = result.replace(/<p><\/p>/gi, ''); // Remove empty paragraphs
            result = result.replace(/<span><\/span>/gi, ''); // Remove empty spans
            
            return result;
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
        disabled: false,        // Start editor in disabled/readonly mode
        
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
            ['codeBlock', 'horizontalRule'],
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
            { value: 'div', label: 'Div' },
            { value: 'pre', label: 'Pre' }
        ],
        
        // Show menu bar (professional style)
        showMenuBar: true,
        
        // Enforce inline styles on all elements (for compatibility with external renderers)
        enforceInlineStyles: true,
        
        // Default text color
        defaultColor: '#000000',
        
        // Default font family (applied to editor on init)
        defaultFontFamily: 'Arial, sans-serif',
        
        // Default font size (applied to editor on init) - use pt to match dropdown options
        defaultFontSize: '14pt',
        
        // Default line height
        defaultLineHeight: '1.5',
        
        // Font families (matching RichEditor)
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
        
        // Font sizes (matching RichEditor - in pt)
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
        // pasteMode options:
        //   'plainText' - Always paste as plain text (default)
        //   'formattedAndPlainText' - Show dialog to choose between formatted or plain text
        pasteMode: 'plainText',
        pasteSettings: {
            cleanPaste: true,
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
        showHtmlCount: true, // Show HTML character count in status bar
        maxCharacters: 10000, // Maximum character limit (0 = no limit)
        
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
            this.lastSelected = {};  // Track last selected font/size/lineHeight for toolbar dropdowns
            this.lastSelectedTime = 0;
            this.lastSelectedFormat = {};  // Track last selected for Format menu submenus
            
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
            
            // Initialize selection at start of editor
            this.initializeSelection();
            
            // Auto-save setup
            if (this.options.autoSave.enabled) {
                this.setupAutoSave();
            }
            
            // Initialize disabled state
            this.disabled = false;
            if (this.options.disabled) {
                this.disable();
            }
            
            // Trigger init event
            this.triggerEvent('onInit', { editor: this });
        }

        /**
         * Initialize selection at start of editor
         */
        initializeSelection() {
            // Set cursor at start of first element
            const firstElement = this.editor.querySelector('p, div, span') || this.editor.firstChild;
            if (firstElement) {
                try {
                    const range = document.createRange();
                    range.setStart(firstElement, 0);
                    range.collapse(true);
                    this.savedSelection = range;
                } catch (e) {
                    // Ignore errors
                }
            }
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
         * Create the menu bar (professional style)
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
                        { label: 'Heading 1', action: () => this.execCommand('formatBlock', 'h1'), style: 'font-size: 1.8em; font-weight: bold;' },
                        { label: 'Heading 2', action: () => this.execCommand('formatBlock', 'h2'), style: 'font-size: 1.5em; font-weight: bold;' },
                        { label: 'Heading 3', action: () => this.execCommand('formatBlock', 'h3'), style: 'font-size: 1.25em; font-weight: bold;' },
                        { label: 'Heading 4', action: () => this.execCommand('formatBlock', 'h4'), style: 'font-size: 1.1em; font-weight: bold;' },
                        { label: 'Heading 5', action: () => this.execCommand('formatBlock', 'h5'), style: 'font-size: 1em; font-weight: bold;' },
                        { label: 'Heading 6', action: () => this.execCommand('formatBlock', 'h6'), style: 'font-size: 0.9em; font-weight: bold;' }
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
                        type: 'fontFamily',
                        value: opt.value,
                        action: () => this.execCommand('fontName', opt.value)
                    }))
                });
            }
            if (this.options.enableFontSizes) {
                formatItems.push({
                    label: 'Font sizes',
                    submenu: this.options.fontSizes.map(opt => ({
                        label: opt.label,
                        type: 'fontSize',
                        value: opt.value,
                        action: () => this.applyFontSize(opt.value)
                    }))
                });
            }
            if (this.options.enableAlignment) {
                formatItems.push({
                    label: 'Align',
                    submenu: this.options.alignOptions.map(opt => ({
                        label: opt.label,
                        type: 'align',
                        value: opt.command,
                        command: opt.command
                    }))
                });
            }
            if (this.options.enableLineHeight) {
                formatItems.push({
                    label: 'Line height',
                    submenu: this.options.lineHeights.map(opt => ({
                        label: opt.label,
                        type: 'lineHeight',
                        value: opt.value,
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
                        {
                            label: 'Paste Mode',
                            submenu: [
                                { 
                                    label: 'Plain Text', 
                                    type: 'radio',
                                    id: 'pasteModePlainText',
                                    checked: this.options.pasteMode === 'plainText',
                                    action: () => this.setPasteMode('plainText')
                                },
                                { 
                                    label: 'Formatted and Plain Text', 
                                    type: 'radio',
                                    id: 'pasteModeFormatted',
                                    checked: this.options.pasteMode === 'formattedAndPlainText',
                                    action: () => this.setPasteMode('formattedAndPlainText')
                                }
                            ]
                        },
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
                } else if (item.type === 'toggle') {
                    // Toggle menu item with checkbox
                    const menuOption = Utils.createElement('div', { 
                        className: 'richeditor-menu-option richeditor-menu-toggle' 
                    });
                    
                    // Checkbox indicator
                    const checkSpan = Utils.createElement('span', { 
                        className: 'richeditor-menu-check',
                        innerHTML: item.checked ? '✓' : ''
                    });
                    if (item.id) {
                        checkSpan.id = 'richeditor-toggle-' + item.id;
                    }
                    menuOption.appendChild(checkSpan);
                    
                    const labelSpan = Utils.createElement('span', { 
                        className: 'richeditor-menu-label',
                        textContent: item.label 
                    });
                    menuOption.appendChild(labelSpan);
                    
                    menuOption.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (item.action) {
                            item.action();
                        }
                        // Update checkmark
                        const isChecked = checkSpan.innerHTML === '✓';
                        checkSpan.innerHTML = isChecked ? '' : '✓';
                        this.closeAllMenus();
                    });
                    
                    dropdown.appendChild(menuOption);
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
                    
                    // Add data attributes for active state tracking
                    if (subItem.type) {
                        subOption.dataset.type = subItem.type;
                        
                        // Add checkmark span for active indication
                        const checkSpan = Utils.createElement('span', { 
                            className: 'richeditor-menu-check',
                            innerHTML: ''
                        });
                        subOption.appendChild(checkSpan);
                    }
                    if (subItem.value) {
                        subOption.dataset.value = subItem.value;
                    }
                    
                    const subLabelSpan = Utils.createElement('span', { 
                        className: 'richeditor-menu-label',
                        textContent: subItem.label 
                    });
                    
                    if (subItem.style) {
                        subLabelSpan.style.cssText = subItem.style;
                    }
                    
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
                        
                        // Track the selected value for immediate UI updates
                        if (subItem.type && subItem.value) {
                            // Store for Format menu submenu
                            this.lastSelectedFormat = this.lastSelectedFormat || {};
                            this.lastSelectedFormat[subItem.type] = {
                                value: subItem.value,
                                time: Date.now()
                            };
                            
                            // Also store for toolbar dropdown sync
                            this.lastSelected = this.lastSelected || {};
                            this.lastSelected[subItem.type] = subItem.value;
                            this.lastSelectedTime = Date.now();
                        }
                        
                        // Immediately update active state in this submenu
                        submenu.querySelectorAll('.richeditor-menu-option[data-type]').forEach(opt => {
                            opt.classList.remove('active');
                            const checkSpan = opt.querySelector('.richeditor-menu-check');
                            if (checkSpan) checkSpan.innerHTML = '';
                        });
                        subOption.classList.add('active');
                        const checkSpan = subOption.querySelector('.richeditor-menu-check');
                        if (checkSpan) checkSpan.innerHTML = '✓';
                        
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
            
            // Update active state when submenu is shown
            submenuTrigger.addEventListener('mouseenter', () => {
                this.updateSubmenuActiveState(submenu);
            });
            
            submenuWrapper.appendChild(submenuTrigger);
            submenuWrapper.appendChild(submenu);
            
            return submenuWrapper;
        }

        /**
         * Update active state of submenu items based on current selection
         */
        updateSubmenuActiveState(submenu) {
            // Get the type of items in this submenu
            const firstItem = submenu.querySelector('.richeditor-menu-option[data-type]');
            const submenuType = firstItem ? firstItem.dataset.type : null;
            
            // Check if we have a recent selection for this type (within last 10 seconds)
            let recentSelection = null;
            if (submenuType && this.lastSelectedFormat && this.lastSelectedFormat[submenuType]) {
                const sel = this.lastSelectedFormat[submenuType];
                if (Date.now() - sel.time < 10000) {
                    recentSelection = sel.value;
                }
            }
            
            // Use saved selection if available (since menu opening loses focus)
            let node = null;
            
            if (this.savedSelection) {
                node = this.savedSelection.startContainer;
                if (node && node.nodeType === Node.TEXT_NODE) {
                    node = node.parentElement;
                }
            } else {
                const selection = window.getSelection();
                if (selection.rangeCount) {
                    node = selection.anchorNode;
                    if (node && node.nodeType === Node.TEXT_NODE) {
                        node = node.parentElement;
                    }
                }
            }
            
            if (!node || !this.editor.contains(node)) {
                node = this.editor;
            }
            
            const computedStyle = window.getComputedStyle(node);
            
            // Get current values from computed style
            const currentFont = computedStyle.fontFamily.toLowerCase().replace(/['"]/g, '');
            const currentFontSize = this.getInlineFontSize(node) || computedStyle.fontSize;
            const currentLineHeight = computedStyle.lineHeight;
            
            // Convert font size to pt for comparison
            let currentPt = null;
            if (currentFontSize) {
                if (currentFontSize.includes('pt')) {
                    currentPt = parseFloat(currentFontSize);
                } else {
                    currentPt = Math.round(parseFloat(currentFontSize) * 0.75);
                }
            }
            
            // Update each menu item
            submenu.querySelectorAll('.richeditor-menu-option[data-type]').forEach(item => {
                item.classList.remove('active');
                const checkSpan = item.querySelector('.richeditor-menu-check');
                if (checkSpan) checkSpan.innerHTML = '';
                
                const type = item.dataset.type;
                const value = item.dataset.value;
                
                if (!type || !value) return;
                
                let isActive = false;
                
                // First priority: check if this matches the recent selection
                if (recentSelection && value === recentSelection) {
                    isActive = true;
                } else if (!recentSelection) {
                    // No recent selection - check computed styles
                    if (type === 'fontFamily') {
                        const fontValue = value.toLowerCase().replace(/['"]/g, '').split(',')[0].trim();
                        const currentFontPrimary = currentFont.split(',')[0].trim();
                        // Use exact match to avoid "Arial" matching "Arial Black"
                        if (currentFontPrimary === fontValue || fontValue === currentFontPrimary) {
                            isActive = true;
                        }
                    } else if (type === 'fontSize') {
                        const sizePt = parseFloat(value);
                        if (currentPt && Math.abs(sizePt - currentPt) <= 1) {
                            isActive = true;
                        }
                    } else if (type === 'lineHeight') {
                        const lhValue = parseFloat(value);
                        let currentLH = parseFloat(currentLineHeight);
                        if (currentLineHeight === 'normal') {
                            currentLH = 1.2;
                        } else if (currentLineHeight.includes('px')) {
                            const fontSize = parseFloat(computedStyle.fontSize);
                            currentLH = parseFloat(currentLineHeight) / fontSize;
                        }
                        if (Math.abs(lhValue - currentLH) < 0.15) {
                            isActive = true;
                        }
                    } else if (type === 'align') {
                        if (document.queryCommandState(value)) {
                            isActive = true;
                        }
                    }
                }
                
                if (isActive) {
                    item.classList.add('active');
                    if (checkSpan) checkSpan.innerHTML = '✓';
                }
            });
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
            
            // Get default cell style
            const cellStyle = this.getTableCellStyle();
            
            switch (action) {
                case 'insertRowBefore':
                    if (row) {
                        const newRow = row.cloneNode(true);
                        Array.from(newRow.cells).forEach(c => {
                            c.innerHTML = '<br>';
                            c.setAttribute('style', cellStyle);
                        });
                        row.parentNode.insertBefore(newRow, row);
                        this.updateTableColgroup(table);
                    }
                    break;
                    
                case 'insertRowAfter':
                    if (row) {
                        const newRow = row.cloneNode(true);
                        Array.from(newRow.cells).forEach(c => {
                            c.innerHTML = '<br>';
                            c.setAttribute('style', cellStyle);
                        });
                        row.parentNode.insertBefore(newRow, row.nextSibling);
                        this.updateTableColgroup(table);
                    }
                    break;
                    
                case 'insertColBefore':
                    if (cell) {
                        const cellIndex = cell.cellIndex;
                        Array.from(table.rows).forEach(r => {
                            const newCell = r.insertCell(cellIndex);
                            newCell.innerHTML = '<br>';
                            newCell.setAttribute('style', cellStyle);
                        });
                        this.updateTableColgroup(table);
                    }
                    break;
                    
                case 'insertColAfter':
                    if (cell) {
                        const cellIndex = cell.cellIndex + 1;
                        Array.from(table.rows).forEach(r => {
                            const newCell = r.insertCell(cellIndex);
                            newCell.innerHTML = '<br>';
                            newCell.setAttribute('style', cellStyle);
                        });
                        this.updateTableColgroup(table);
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
                        this.updateTableColgroup(table);
                    }
                    break;
                    
                case 'deleteTable':
                    table.remove();
                    break;
            }
            
            this.syncContent();
        }

        /**
         * Get default table cell style
         */
        getTableCellStyle() {
            // Extract just the primary font name (e.g., "Arial" from "Arial, sans-serif")
            let fontFamily = this.options.defaultFontFamily || 'Arial, sans-serif';
            const primaryFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
            const fontSize = this.options.defaultFontSize || '14pt';
            return `border: 1px solid rgb(0, 0, 0); padding: 4px; font-family: ${primaryFont}; font-size: ${fontSize};`;
        }

        /**
         * Update table colgroup to reflect current column count
         */
        updateTableColgroup(table) {
            const cols = table.rows[0] ? table.rows[0].cells.length : 0;
            if (cols === 0) return;
            
            const colWidth = (100 / cols).toFixed(4);
            
            // Find or create colgroup
            let colgroup = table.querySelector('colgroup');
            if (!colgroup) {
                colgroup = document.createElement('colgroup');
                table.insertBefore(colgroup, table.firstChild);
            }
            
            // Rebuild col elements
            colgroup.innerHTML = '';
            for (let i = 0; i < cols; i++) {
                const col = document.createElement('col');
                col.style.width = colWidth + '%';
                colgroup.appendChild(col);
            }
        }

        /**
         * Get default paragraph style string (for inline styles)
         */
        getDefaultParagraphStyle() {
            const fontFamily = this.options.defaultFontFamily || 'Arial, sans-serif';
            const primaryFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
            const fontSize = this.options.defaultFontSize || '14pt';
            const color = this.options.defaultColor || '#000000';
            return `font-family: ${primaryFont}; font-size: ${fontSize}; color: ${color};`;
        }

        /**
         * Get default style for heading elements (no font-size to preserve semantic sizing)
         */
        getDefaultHeadingStyle() {
            const fontFamily = this.options.defaultFontFamily || 'Arial, sans-serif';
            const primaryFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
            const color = this.options.defaultColor || '#000000';
            // No font-size for headings - they should use their natural semantic sizes
            return `font-family: ${primaryFont}; color: ${color};`;
        }

        /**
         * Apply inline styles to all block elements that don't have them
         */
        applyInlineStylesToContent() {
            if (!this.options.enforceInlineStyles) return;
            
            const defaultStyle = this.getDefaultParagraphStyle();
            const headingStyle = this.getDefaultHeadingStyle();
            
            // Apply to non-heading block elements
            const blockElements = this.editor.querySelectorAll('p, li, blockquote, div:not(.richeditor-video-wrapper)');
            blockElements.forEach(el => {
                if (!el.style.fontFamily) {
                    const currentStyle = el.getAttribute('style') || '';
                    if (currentStyle) {
                        el.setAttribute('style', currentStyle + ' ' + defaultStyle);
                    } else {
                        el.setAttribute('style', defaultStyle);
                    }
                }
            });
            
            // Apply to heading elements (without font-size)
            const headingElements = this.editor.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headingElements.forEach(el => {
                if (!el.style.fontFamily) {
                    const currentStyle = el.getAttribute('style') || '';
                    // Remove any font-size that might have been added
                    const cleanedStyle = currentStyle.replace(/font-size:\s*[^;]+;?/gi, '').trim();
                    if (cleanedStyle) {
                        el.setAttribute('style', cleanedStyle + ' ' + headingStyle);
                    } else {
                        el.setAttribute('style', headingStyle);
                    }
                } else {
                    // If heading has font-family but also has font-size, remove the font-size
                    const currentStyle = el.getAttribute('style') || '';
                    if (currentStyle.includes('font-size')) {
                        const cleanedStyle = currentStyle.replace(/font-size:\s*[^;]+;?/gi, '').trim();
                        el.setAttribute('style', cleanedStyle);
                    }
                }
            });
        }

        /**
         * Remove font-size from all headings and their child elements
         * This ensures headings use their natural semantic sizes
         */
        removeHeadingFontSize() {
            const headingElements = this.editor.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const fontFamily = this.options.defaultFontFamily || 'Arial, sans-serif';
            const primaryFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
            const color = this.options.defaultColor || '#000000';
            
            headingElements.forEach(heading => {
                // Remove font-size from the heading itself
                const currentStyle = heading.getAttribute('style') || '';
                if (currentStyle) {
                    // Remove font-size property
                    let cleanedStyle = currentStyle.replace(/font-size:\s*[^;]+;?/gi, '').trim();
                    // Ensure font-family and color are present
                    if (!cleanedStyle.includes('font-family')) {
                        cleanedStyle += ` font-family: ${primaryFont};`;
                    }
                    if (!cleanedStyle.includes('color')) {
                        cleanedStyle += ` color: ${color};`;
                    }
                    heading.setAttribute('style', cleanedStyle.trim());
                } else {
                    heading.setAttribute('style', `font-family: ${primaryFont}; color: ${color};`);
                }
                
                // Also remove font-size from any spans inside the heading
                const spans = heading.querySelectorAll('span, font');
                spans.forEach(span => {
                    const spanStyle = span.getAttribute('style') || '';
                    if (spanStyle.includes('font-size')) {
                        const cleanedSpanStyle = spanStyle.replace(/font-size:\s*[^;]+;?/gi, '').trim();
                        if (cleanedSpanStyle) {
                            span.setAttribute('style', cleanedSpanStyle);
                        } else {
                            span.removeAttribute('style');
                        }
                    }
                    // Remove size attribute from font tags
                    if (span.tagName === 'FONT' && span.hasAttribute('size')) {
                        span.removeAttribute('size');
                    }
                });
            });
        }

        /**
         * Create a new paragraph with default inline styles
         */
        createStyledParagraph(content = '<br>') {
            const p = document.createElement('p');
            if (this.options.enforceInlineStyles) {
                p.setAttribute('style', this.getDefaultParagraphStyle());
            }
            p.innerHTML = content;
            return p;
        }

        /**
         * Ensure content has inline styles on all paragraphs
         */
        ensureInlineStyles() {
            if (!this.options.enforceInlineStyles) return;
            
            // Get all direct children of editor
            const children = Array.from(this.editor.childNodes);
            
            // If editor is empty or has only text, wrap in styled paragraph
            if (children.length === 0 || (children.length === 1 && children[0].nodeType === Node.TEXT_NODE)) {
                const content = this.editor.innerHTML || '<br>';
                this.editor.innerHTML = '';
                const p = this.createStyledParagraph(content);
                this.editor.appendChild(p);
                return;
            }
            
            // Apply styles to block elements
            this.applyInlineStylesToContent();
            
            // Always ensure headings don't have font-size
            this.removeHeadingFontSize();
            
            // Wrap orphan text nodes in styled paragraphs
            children.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
                    const p = this.createStyledParagraph(child.textContent);
                    this.editor.replaceChild(p, child);
                }
            });
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
            
            // Set default label based on dropdown type and config defaults
            let defaultLabel = 'Paragraph';
            if (name === 'fontFamily') {
                // Find the label for the default font family - use exact match on primary font
                const defaultPrimary = this.options.defaultFontFamily.split(',')[0].toLowerCase().trim().replace(/['"]/g, '');
                const defaultFont = this.options.fontFamilies.find(f => {
                    const fontPrimary = f.value.toLowerCase().split(',')[0].trim().replace(/['"]/g, '');
                    return fontPrimary === defaultPrimary;
                });
                defaultLabel = defaultFont ? defaultFont.label : 'Font';
            } else if (name === 'fontSize') {
                // Find the label for the default font size (both should be in pt)
                const defaultSize = this.options.fontSizes.find(s => s.value === this.options.defaultFontSize);
                defaultLabel = defaultSize ? defaultSize.label : this.options.defaultFontSize;
            } else if (name === 'lineHeight') {
                // Find the label for the default line height
                const defaultLH = this.options.lineHeights.find(lh => 
                    Math.abs(parseFloat(lh.value) - parseFloat(this.options.defaultLineHeight)) < 0.1
                );
                defaultLabel = defaultLH ? defaultLH.label : this.options.defaultLineHeight;
            }
            
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
                    // Mark paragraph as active by default
                    if (opt.value === 'p') {
                        item.classList.add('active');
                    }
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
                    item.dataset.value = opt.value;  // Add data-value for active state tracking
                    // Mark default font as active - use exact match on primary font
                    const optPrimary = opt.value.toLowerCase().split(',')[0].trim().replace(/['"]/g, '');
                    const defaultPrimary = this.options.defaultFontFamily.split(',')[0].toLowerCase().trim().replace(/['"]/g, '');
                    if (optPrimary === defaultPrimary) {
                        item.classList.add('active');
                    }
                    item.addEventListener('click', () => {
                        this.restoreSelection();
                        this.execCommand('fontName', opt.value);
                        
                        // Track selection for menu sync (both toolbar and Format menu)
                        this.lastSelected = this.lastSelected || {};
                        this.lastSelected.fontFamily = opt.value;
                        this.lastSelectedTime = Date.now();
                        
                        this.lastSelectedFormat = this.lastSelectedFormat || {};
                        this.lastSelectedFormat.fontFamily = { value: opt.value, time: Date.now() };
                        
                        // Update dropdown label immediately
                        label.textContent = opt.label;
                        // Update active state on all items immediately
                        menu.querySelectorAll('.richeditor-dropdown-item').forEach(i => {
                            i.classList.remove('active');
                        });
                        item.classList.add('active');
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
                    // Mark default size as active (both should be in pt)
                    if (opt.value === this.options.defaultFontSize) {
                        item.classList.add('active');
                    }
                    item.addEventListener('click', () => {
                        this.restoreSelection();
                        this.applyFontSize(opt.value);
                        
                        // Track selection for menu sync (both toolbar and Format menu)
                        this.lastSelected = this.lastSelected || {};
                        this.lastSelected.fontSize = opt.value;
                        this.lastSelectedTime = Date.now();
                        
                        this.lastSelectedFormat = this.lastSelectedFormat || {};
                        this.lastSelectedFormat.fontSize = { value: opt.value, time: Date.now() };
                        
                        // Update dropdown label immediately
                        label.textContent = opt.label;
                        // Update active state on all items immediately
                        menu.querySelectorAll('.richeditor-dropdown-item').forEach(i => {
                            i.classList.remove('active');
                        });
                        item.classList.add('active');
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
                    // Mark default line height as active
                    if (Math.abs(parseFloat(opt.value) - parseFloat(this.options.defaultLineHeight)) < 0.1) {
                        item.classList.add('active');
                    }
                    item.addEventListener('click', () => {
                        this.restoreSelection();
                        this.applyLineHeight(opt.value);
                        
                        // Track selection for menu sync (both toolbar and Format menu)
                        this.lastSelected = this.lastSelected || {};
                        this.lastSelected.lineHeight = opt.value;
                        this.lastSelectedTime = Date.now();
                        
                        this.lastSelectedFormat = this.lastSelectedFormat || {};
                        this.lastSelectedFormat.lineHeight = { value: opt.value, time: Date.now() };
                        
                        // Update dropdown label immediately
                        label.textContent = opt.label;
                        // Update active state on all items immediately
                        menu.querySelectorAll('.richeditor-dropdown-item').forEach(i => {
                            i.classList.remove('active');
                        });
                        item.classList.add('active');
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
                
                // Update active state before showing dropdown
                if (!menu.classList.contains('show')) {
                    this.updateDropdownActiveState(name, menu);
                }
                
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
         * Update dropdown menu active state based on current selection
         */
        updateDropdownActiveState(name, menu) {
            // Check if we have recently selected values (within last 5 seconds)
            const recentlySelected = this.lastSelected && this.lastSelectedTime && 
                                    (Date.now() - this.lastSelectedTime) < 5000;
            
            // Use saved selection if available (since dropdown opening may lose focus)
            let node = null;
            
            if (this.savedSelection) {
                node = this.savedSelection.startContainer;
                if (node && node.nodeType === Node.TEXT_NODE) {
                    node = node.parentElement;
                }
            } else {
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                node = selection.anchorNode;
                if (node && node.nodeType === Node.TEXT_NODE) {
                    node = node.parentElement;
                }
            }
            
            if (!node || !this.editor.contains(node)) {
                // Fallback to editor element itself for default styles
                node = this.editor;
            }
            
            const computedStyle = window.getComputedStyle(node);
            
            if (name === 'fontFamily') {
                const lastSelectedFont = recentlySelected ? this.lastSelected.fontFamily : null;
                const currentFont = computedStyle.fontFamily.toLowerCase().replace(/['"]/g, '');
                
                menu.querySelectorAll('.richeditor-dropdown-item').forEach(item => {
                    item.classList.remove('active');
                    const itemValue = item.dataset.value || '';
                    
                    // Check lastSelected first
                    if (lastSelectedFont && itemValue === lastSelectedFont) {
                        item.classList.add('active');
                    } else if (!lastSelectedFont) {
                        // Fall back to computed style check
                        const itemValueLower = itemValue.toLowerCase().replace(/['"]/g, '');
                        const primaryFont = itemValueLower.split(',')[0].trim();
                        if (currentFont.includes(primaryFont)) {
                            item.classList.add('active');
                        }
                    }
                });
            } else if (name === 'fontSize') {
                const lastSelectedSize = recentlySelected ? this.lastSelected.fontSize : null;
                const currentFontSize = this.getInlineFontSize(node) || computedStyle.fontSize;
                let currentPt = null;
                
                if (currentFontSize) {
                    if (currentFontSize.includes('pt')) {
                        currentPt = parseFloat(currentFontSize);
                    } else {
                        currentPt = Math.round(parseFloat(currentFontSize) * 0.75);
                    }
                }
                
                menu.querySelectorAll('.richeditor-dropdown-item').forEach(item => {
                    item.classList.remove('active');
                    const itemValue = item.dataset.value;
                    
                    // Check lastSelected first
                    if (lastSelectedSize && itemValue === lastSelectedSize) {
                        item.classList.add('active');
                    } else if (!lastSelectedSize) {
                        // Fall back to computed style check
                        const itemPt = parseFloat(itemValue);
                        if (currentPt && Math.abs(itemPt - currentPt) <= 1) {
                            item.classList.add('active');
                        }
                    }
                });
            } else if (name === 'lineHeight') {
                const lastSelectedLH = recentlySelected ? this.lastSelected.lineHeight : null;
                const currentLineHeight = computedStyle.lineHeight;
                let currentLH = parseFloat(currentLineHeight);
                
                if (currentLineHeight === 'normal') {
                    currentLH = 1.2;
                } else if (currentLineHeight.includes('px')) {
                    const fontSize = parseFloat(computedStyle.fontSize);
                    currentLH = parseFloat(currentLineHeight) / fontSize;
                }
                
                menu.querySelectorAll('.richeditor-dropdown-item').forEach(item => {
                    item.classList.remove('active');
                    const itemValue = item.dataset.value;
                    
                    // Check lastSelected first
                    if (lastSelectedLH && itemValue === lastSelectedLH) {
                        item.classList.add('active');
                    } else if (!lastSelectedLH) {
                        // Fall back to computed style check
                        const itemLH = parseFloat(itemValue);
                        if (Math.abs(itemLH - currentLH) < 0.1) {
                            item.classList.add('active');
                        }
                    }
                });
            }
        }

        /**
         * Create the editor content area
         */
        createEditorArea() {
            // Create editor container
            this.editorContainer = Utils.createElement('div', { className: 'richeditor-container' });
            
            // Create contenteditable area with styled initial paragraph
            const initialParagraph = this.options.enforceInlineStyles 
                ? `<p style="${this.getDefaultParagraphStyle()}"><br></p>`
                : '<p><br></p>';
            
            this.editor = Utils.createElement('div', {
                className: 'richeditor-content',
                innerHTML: initialParagraph
            });
            this.editor.setAttribute('contenteditable', 'true');
            this.editor.setAttribute('spellcheck', this.options.spellcheck);
            this.editor.setAttribute('data-placeholder', this.options.placeholder);
            
            // Apply default font styles to container (fallback)
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
            
            // Left section: Words and Characters
            const leftSection = Utils.createElement('div', { className: 'richeditor-statusbar-left' });
            
            if (this.options.showWordCount) {
                this.wordCount = Utils.createElement('span', { 
                    className: 'richeditor-wordcount',
                    textContent: 'Words: 0 | Characters: 0'
                });
                leftSection.appendChild(this.wordCount);
            }
            
            this.statusBar.appendChild(leftSection);
            
            // Right section: HTML count
            const rightSection = Utils.createElement('div', { className: 'richeditor-statusbar-right' });
            
            if (this.options.showHtmlCount) {
                this.htmlCount = Utils.createElement('span', { 
                    className: 'richeditor-htmlcount',
                    textContent: 'HTML: 0'
                });
                rightSection.appendChild(this.htmlCount);
            }
            
            const resizeHandle = Utils.createElement('div', { className: 'richeditor-resize' });
            rightSection.appendChild(resizeHandle);
            
            this.statusBar.appendChild(rightSection);
            
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
                // Apply inline styles to elements that don't have them
                this.ensureInlineStyles();
                
                this.syncContent();
                this.updateWordCount();
                this.triggerEvent('onChange', { content: this.getContent() });
            }, 100));
            
            // Focus/blur events
            this.editor.addEventListener('focus', () => {
                this.wrapper.classList.add('focused');
                this.triggerEvent('onFocus');
            });
            
            // Save selection when clicking in editor
            this.editor.addEventListener('click', () => {
                // Small delay to let selection settle
                setTimeout(() => this.saveSelection(), 10);
            });
            
            // Also save selection on mouseup (for drag selections)
            this.editor.addEventListener('mouseup', () => {
                setTimeout(() => this.saveSelection(), 10);
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
            // Character limit enforcement
            if (this.options.maxCharacters > 0) {
                const currentChars = this.getCharacterCount();
                
                // Check if this is a character-adding key (not control keys)
                const isCharacterKey = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
                
                // Allow: backspace, delete, arrow keys, home, end, tab, escape, enter
                const isAllowedKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 
                                      'Home', 'End', 'Tab', 'Escape', 'Enter'].includes(e.key);
                
                // Allow keyboard shortcuts (Ctrl/Cmd + key)
                const isShortcut = e.ctrlKey || e.metaKey;
                
                if (isCharacterKey && !isAllowedKey && !isShortcut && currentChars >= this.options.maxCharacters) {
                    e.preventDefault();
                    this.showCharacterLimitWarning();
                    return;
                }
            }
            
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
            
            // Enter key handling for inline styles
            if (e.key === 'Enter' && !e.shiftKey && this.options.enforceInlineStyles) {
                // Let browser handle Enter normally, then apply styles after
                setTimeout(() => {
                    this.ensureInlineStyles();
                }, 0);
            }
        }

        /**
         * Handle paste events
         */
        handlePaste(e) {
            if (!this.options.pasteSettings.cleanPaste) return;
            
            e.preventDefault();
            
            if (e.clipboardData) {
                // Get both HTML and plain text content
                const html = e.clipboardData.getData('text/html');
                let text = e.clipboardData.getData('text/plain');
                
                // Character limit enforcement for paste
                if (this.options.maxCharacters > 0) {
                    const currentChars = this.getCharacterCount();
                    const remainingChars = this.options.maxCharacters - currentChars;
                    
                    if (remainingChars <= 0) {
                        this.showCharacterLimitWarning();
                        return;
                    }
                    
                    // Truncate pasted text if it would exceed the limit
                    if (text.length > remainingChars) {
                        text = text.substring(0, remainingChars);
                        this.showCharacterLimitWarning();
                    }
                }
                
                // Check if content is from Word/external source (has HTML formatting)
                const hasFormatting = html && (
                    html.includes('mso-') || 
                    html.includes('MsoNormal') || 
                    html.includes('<b>') || 
                    html.includes('<i>') || 
                    html.includes('<strong>') ||
                    html.includes('<em>') ||
                    html.includes('style=') ||
                    html.includes('<font') ||
                    html.includes('<span')
                );
                
                // Handle paste based on pasteMode setting
                if (this.options.pasteMode === 'formattedAndPlainText' && hasFormatting) {
                    // Show paste options dialog
                    this.showPasteOptionsDialog(html, text);
                } else {
                    // plainText mode - always paste as plain text
                    this.executePaste(html, text, false);
                }
            }
        }

        /**
         * Show paste options dialog (like Word/Outlook)
         */
        showPasteOptionsDialog(html, text) {
            // Save current selection
            this.saveSelection();
            
            // Remove existing dialog if any
            const existing = document.querySelector('.richeditor-paste-dialog');
            if (existing) existing.remove();
            
            // Get cursor position before creating dialog
            let cursorRect = null;
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                cursorRect = range.getBoundingClientRect();
            }
            
            // If no valid cursor position, use editor position
            if (!cursorRect || cursorRect.top === 0) {
                cursorRect = this.editor.getBoundingClientRect();
            }
            
            // Create dialog
            const dialog = Utils.createElement('div', { className: 'richeditor-paste-dialog' });
            
            dialog.innerHTML = `
                <div class="richeditor-paste-dialog-content">
                    <div class="richeditor-paste-dialog-title">Paste Options</div>
                    <div class="richeditor-paste-options">
                        <button type="button" class="richeditor-paste-option" data-mode="formatted" title="Keep Source Formatting">
                            <div class="richeditor-paste-option-icon">
                                <svg viewBox="0 0 24 24" width="32" height="32">
                                    <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                </svg>
                            </div>
                            <div class="richeditor-paste-option-label">Keep Source Formatting</div>
                        </button>
                        <button type="button" class="richeditor-paste-option" data-mode="plain" title="Paste as Plain Text">
                            <div class="richeditor-paste-option-icon">
                                <svg viewBox="0 0 24 24" width="32" height="32">
                                    <path fill="currentColor" d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"/>
                                </svg>
                            </div>
                            <div class="richeditor-paste-option-label">Plain Text</div>
                        </button>
                    </div>
                    <div class="richeditor-paste-dialog-footer">
                        <button type="button" class="richeditor-paste-cancel">Cancel</button>
                    </div>
                </div>
            `;
            
            // Append to wrapper for proper positioning context
            this.wrapper.appendChild(dialog);
            
            // Position dialog near cursor
            const dialogContent = dialog.querySelector('.richeditor-paste-dialog-content');
            const wrapperRect = this.wrapper.getBoundingClientRect();
            
            // Calculate position relative to wrapper
            let top = cursorRect.bottom - wrapperRect.top + 10;
            let left = cursorRect.left - wrapperRect.left;
            
            // Ensure dialog stays within viewport
            const dialogWidth = 320; // Approximate width
            const dialogHeight = 180; // Approximate height
            
            // Adjust if would go off right edge
            if (left + dialogWidth > wrapperRect.width) {
                left = Math.max(10, wrapperRect.width - dialogWidth - 10);
            }
            
            // Adjust if would go off bottom - show above cursor instead
            if (top + dialogHeight > wrapperRect.height) {
                top = cursorRect.top - wrapperRect.top - dialogHeight - 10;
                if (top < 0) top = 10;
            }
            
            dialogContent.style.position = 'absolute';
            dialogContent.style.top = top + 'px';
            dialogContent.style.left = left + 'px';
            dialogContent.style.margin = '0';
            
            // Handle option clicks
            dialog.querySelectorAll('.richeditor-paste-option').forEach(option => {
                option.addEventListener('click', () => {
                    const mode = option.dataset.mode;
                    
                    // Close dialog
                    dialog.remove();
                    
                    // Restore selection and paste
                    this.restoreSelection();
                    this.executePaste(html, text, mode === 'formatted');
                });
            });
            
            // Handle cancel
            dialog.querySelector('.richeditor-paste-cancel').addEventListener('click', () => {
                dialog.remove();
            });
            
            // Close on click outside
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    dialog.remove();
                }
            });
            
            // Close on Escape
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    dialog.remove();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        }

        /**
         * Execute paste with specified mode
         */
        executePaste(html, text, keepFormatting) {
            let content = '';
            
            if (keepFormatting && html && this.options.pasteSettings.keepStructure) {
                // Paste with formatting - clean Word-specific markup
                content = Utils.cleanWordHTML(html);
                
                // Then sanitize for security
                content = Utils.sanitizeHTML(content, this.options.allowedTags);
                
                // Apply inline styles to pasted content if enforceInlineStyles is enabled
                if (this.options.enforceInlineStyles) {
                    content = this.applyInlineStylesToHTML(content);
                }
            } else {
                // Paste as plain text with inline styles
                content = this.convertPlainTextToHTML(text);
            }
            
            this.execCommand('insertHTML', content);
            
            // Ensure all elements have inline styles after paste
            if (this.options.enforceInlineStyles) {
                setTimeout(() => this.ensureInlineStyles(), 0);
            }
            
            this.triggerEvent('onPaste', { content, keepFormatting });
        }

        /**
         * Apply inline styles to HTML string
         */
        applyInlineStylesToHTML(html) {
            const temp = document.createElement('div');
            temp.innerHTML = html;
            
            const defaultStyle = this.getDefaultParagraphStyle();
            const blockElements = temp.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');
            
            blockElements.forEach(el => {
                // Only add styles if element doesn't have font-family
                if (!el.style.fontFamily) {
                    const currentStyle = el.getAttribute('style') || '';
                    if (currentStyle) {
                        el.setAttribute('style', currentStyle + ' ' + defaultStyle);
                    } else {
                        el.setAttribute('style', defaultStyle);
                    }
                }
            });
            
            return temp.innerHTML;
        }

        /**
         * Convert plain text to HTML with proper paragraphs
         * Applies inline styles for compatibility with external renderers
         */
        convertPlainTextToHTML(text) {
            if (!text) return '';
            
            // Escape HTML entities
            const escapeHTML = (str) => {
                return str
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            };
            
            // Get paragraph style
            const pStyle = this.options.enforceInlineStyles ? ` style="${this.getDefaultParagraphStyle()}"` : '';
            
            // Split by double newlines for paragraphs
            const paragraphs = text.split(/\n\n+/);
            
            // Return paragraphs with inline styles
            return paragraphs.map(p => {
                // Convert single newlines to <br>
                const escaped = escapeHTML(p);
                const withBreaks = escaped.replace(/\n/g, '<br>');
                return `<p${pStyle}>${withBreaks}</p>`;
            }).join('');
        }

        /**
         * Toggle paste options dialog on/off
         */
        /**
         * Set paste mode
         * @param {string} mode - 'plainText' or 'formattedAndPlainText'
         */
        setPasteMode(mode) {
            if (mode !== 'plainText' && mode !== 'formattedAndPlainText') {
                console.warn('Invalid paste mode. Use "plainText" or "formattedAndPlainText"');
                return;
            }
            
            this.options.pasteMode = mode;
            
            // Update menu radio buttons
            const plainTextRadio = document.getElementById('richeditor-toggle-pasteModePlainText');
            const formattedRadio = document.getElementById('richeditor-toggle-pasteModeFormatted');
            
            if (plainTextRadio) {
                plainTextRadio.innerHTML = mode === 'plainText' ? '●' : '';
            }
            if (formattedRadio) {
                formattedRadio.innerHTML = mode === 'formattedAndPlainText' ? '●' : '';
            }
            
            const modeText = mode === 'plainText' ? 'Plain Text' : 'Formatted and Plain Text';
            this.showNotification(`Paste mode: ${modeText}`);
            
            this.triggerEvent('onPasteModeChange', { mode });
        }

        /**
         * Get current paste mode
         * @returns {string} 'plainText' or 'formattedAndPlainText'
         */
        getPasteMode() {
            return this.options.pasteMode;
        }

        /**
         * Show a temporary notification
         */
        showNotification(message, duration = 2000) {
            // Remove existing notification if any
            const existing = this.wrapper.querySelector('.richeditor-notification');
            if (existing) {
                existing.remove();
            }
            
            const notification = Utils.createElement('div', {
                className: 'richeditor-notification',
                textContent: message
            });
            
            this.wrapper.appendChild(notification);
            
            // Fade in
            setTimeout(() => notification.classList.add('show'), 10);
            
            // Remove after duration
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, duration);
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
            
            // Focus editor first
            this.editor.focus();
            
            // Check current selection
            let selection = window.getSelection();
            
            // If no selection in editor, try to restore saved one
            if (!selection.rangeCount || !this.editor.contains(selection.anchorNode)) {
                if (this.savedSelection) {
                    try {
                        selection.removeAllRanges();
                        selection.addRange(this.savedSelection);
                    } catch (e) {
                        this.savedSelection = null;
                    }
                }
            }
            
            if (command === 'formatBlock' && value) {
                // Normalize value - remove angle brackets if present
                const targetTag = value.replace(/[<>]/g, '').toLowerCase();
                
                // Special handling for 'pre' - wraps ALL content in single pre
                if (targetTag === 'pre') {
                    this.applyPreFormat();
                    this.syncContent();
                    this.updateToolbarState();
                    return;
                }
                
                // For all other block formats, check if we're inside a pre first
                const selection = window.getSelection();
                if (selection.rangeCount) {
                    const range = selection.getRangeAt(0);
                    let node = range.commonAncestorContainer;
                    if (node.nodeType === Node.TEXT_NODE) {
                        node = node.parentElement;
                    }
                    
                    // Find if we're inside a pre element
                    let preElement = null;
                    let current = node;
                    while (current && current !== this.editor) {
                        if (current.tagName === 'PRE') {
                            preElement = current;
                            break;
                        }
                        current = current.parentElement;
                    }
                    
                    if (preElement) {
                        // Convert ENTIRE pre to the target format
                        this.convertPreToBlock(preElement, targetTag);
                        this.syncContent();
                        this.updateToolbarState();
                        return;
                    }
                }
                
                value = `<${targetTag}>`;
            }
            
            // Special handling for text formatting in table cells
            // execCommand can wrap entire tables, so use DOM manipulation instead
            if (this.isSelectionInTable() && 
                (command === 'bold' || command === 'italic' || command === 'underline' || command === 'strikeThrough')) {
                
                // Check if we're actually in a cell (not just near a table)
                const cell = this.getSelectionCell();
                
                if (cell) {
                    let handled = false;
                    
                    if (command === 'underline') {
                        if (this.isInsideTextDecoration('underline')) {
                            handled = this.removeTextDecoration('underline');
                        } else {
                            handled = this.applyFormattingInCell('u');
                        }
                    } else if (command === 'strikeThrough') {
                        if (this.isInsideTextDecoration('strikeThrough')) {
                            handled = this.removeTextDecoration('strikeThrough');
                        } else {
                            handled = this.applyFormattingInCell('strike');
                        }
                    } else if (command === 'bold') {
                        if (this.isInsideFormatting('bold')) {
                            handled = this.removeFormatting('bold');
                        } else {
                            handled = this.applyFormattingInCell('b');
                        }
                    } else if (command === 'italic') {
                        if (this.isInsideFormatting('italic')) {
                            handled = this.removeFormatting('italic');
                        } else {
                            handled = this.applyFormattingInCell('i');
                        }
                    }
                }
                
                // Always return for table-related formatting - never fall through to execCommand
                // This prevents execCommand from wrapping tables
                selection = window.getSelection();
                if (selection.rangeCount > 0 && this.editor.contains(selection.anchorNode)) {
                    this.savedSelection = selection.getRangeAt(0).cloneRange();
                }
                this.syncContent();
                this.updateToolbarState();
                return;
            }
            
            // Execute the command
            document.execCommand(command, false, value);
            
            // Special handling after formatBlock to apply correct inline styles
            if (command === 'formatBlock' && this.options.enforceInlineStyles) {
                // For headings, we need to remove any font-size that was inherited
                const targetTag = value ? value.replace(/[<>]/g, '').toLowerCase() : '';
                if (/^h[1-6]$/.test(targetTag)) {
                    // Find and fix the heading that was just created
                    setTimeout(() => {
                        this.removeHeadingFontSize();
                    }, 0);
                } else {
                    // Apply inline styles to the newly created block element
                    setTimeout(() => {
                        this.applyInlineStylesToContent();
                    }, 0);
                }
            }
            
            // Immediately update font dropdown when fontName is used
            if (command === 'fontName' && value) {
                this.updateFontDropdownImmediate(value);
            }
            
            // Update saved selection to reflect new DOM state
            selection = window.getSelection();
            if (selection.rangeCount > 0 && this.editor.contains(selection.anchorNode)) {
                this.savedSelection = selection.getRangeAt(0).cloneRange();
            }
            
            this.syncContent();
            this.updateToolbarState();
        }

        /**
         * Apply preformatted text formatting - wraps ALL editor content in a single pre tag like TinyMCE
         * TinyMCE behavior: Pre format applies to entire editor content, not individual blocks
         */
        applyPreFormat() {
            // Get default font settings
            let fontFamily = this.options.defaultFontFamily || 'Arial, sans-serif';
            const primaryFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
            const fontSize = this.options.defaultFontSize || '14pt';
            
            // Check if editor is already entirely a pre
            if (this.editor.children.length === 1 && 
                this.editor.firstElementChild && 
                this.editor.firstElementChild.tagName === 'PRE') {
                // Already a single pre - do nothing
                return;
            }
            
            // Get ALL text content from the editor, preserving line breaks
            const textContent = this.editor.innerText || this.editor.textContent || '';
            
            // Create new pre element with inline styles
            const pre = document.createElement('pre');
            pre.style.fontFamily = primaryFont;
            pre.style.fontSize = fontSize;
            
            // Create inner span like TinyMCE does
            const span = document.createElement('span');
            span.setAttribute('data-teams', 'true');
            span.style.fontFamily = primaryFont;
            span.style.fontSize = fontSize;
            
            // Convert newlines to <br> for proper display
            const lines = textContent.split('\n');
            lines.forEach((line, index) => {
                if (index > 0) {
                    span.appendChild(document.createElement('br'));
                }
                // Use non-breaking space for empty lines to preserve them
                if (line) {
                    span.appendChild(document.createTextNode(line));
                } else if (index < lines.length - 1) {
                    // Empty line in the middle - add nbsp to preserve it
                    span.appendChild(document.createTextNode('\u00A0'));
                }
            });
            
            pre.appendChild(span);
            
            // Replace ALL editor content with the single pre
            this.editor.innerHTML = '';
            this.editor.appendChild(pre);
            
            // Set cursor at the end of the pre
            try {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(pre);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (e) {
                // Ignore selection errors
            }
        }

        /**
         * Convert pre element to another block format (div, p, etc.)
         */
        convertPreToBlock(preElement, targetTag) {
            // Get the text content from the pre
            const textContent = preElement.innerText || preElement.textContent;
            
            // Get font settings
            let fontFamily = this.options.defaultFontFamily || 'Arial, sans-serif';
            const primaryFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
            const fontSize = this.options.defaultFontSize || '14pt';
            const color = this.options.defaultColor || '#000000';
            
            // Check if target is a heading (headings shouldn't have font-size)
            const isHeading = /^h[1-6]$/i.test(targetTag);
            
            // Split by line breaks
            const allLines = textContent.split('\n');
            // Filter out completely empty lines but keep lines with just whitespace
            const lines = allLines.filter((line, index, arr) => {
                // Keep if not empty, or if it's the only line
                return line.trim() !== '' || arr.length === 1;
            });
            
            // Create a document fragment to hold all new elements
            const fragment = document.createDocumentFragment();
            
            if (lines.length === 0) {
                // Empty content - create single empty block
                const block = document.createElement(targetTag);
                block.style.fontFamily = primaryFont;
                if (!isHeading) {
                    block.style.fontSize = fontSize;
                }
                block.style.color = color;
                block.innerHTML = '<br>';
                fragment.appendChild(block);
            } else {
                // Create a block element for each line
                lines.forEach(line => {
                    const block = document.createElement(targetTag);
                    block.style.fontFamily = primaryFont;
                    if (!isHeading) {
                        block.style.fontSize = fontSize;
                    }
                    block.style.color = color;
                    block.textContent = line || '\u00A0'; // Use nbsp for empty lines
                    fragment.appendChild(block);
                });
            }
            
            // Replace the pre element with the new blocks
            preElement.parentNode.replaceChild(fragment, preElement);
        }

        /**
         * Check if current selection is inside a table cell
         */
        isSelectionInTable() {
            const selection = window.getSelection();
            if (!selection.rangeCount) return false;
            
            const range = selection.getRangeAt(0);
            
            // Check multiple possible nodes
            const nodesToCheck = [
                selection.anchorNode,
                selection.focusNode,
                range.commonAncestorContainer,
                range.startContainer,
                range.endContainer
            ];
            
            for (const startNode of nodesToCheck) {
                if (!startNode) continue;
                
                let node = startNode;
                // If it's a text node, start from parent
                if (node.nodeType === Node.TEXT_NODE) {
                    node = node.parentElement;
                }
                
                // Walk up to find table-related elements
                while (node && node !== this.editor) {
                    const tagName = node.tagName;
                    if (tagName === 'TD' || tagName === 'TH') {
                        return true;
                    }
                    // Also check if we're at TR or TABLE level (cursor might be between cells)
                    if (tagName === 'TR' || tagName === 'TBODY' || tagName === 'THEAD' || tagName === 'TABLE') {
                        return true;
                    }
                    node = node.parentElement;
                }
            }
            return false;
        }

        /**
         * Get the table cell containing the current selection, or null if not in a cell
         */
        getSelectionCell() {
            const selection = window.getSelection();
            if (!selection.rangeCount) return null;
            
            let node = selection.anchorNode;
            if (node && node.nodeType === Node.TEXT_NODE) {
                node = node.parentElement;
            }
            
            while (node && node !== this.editor) {
                if (node.tagName === 'TD' || node.tagName === 'TH') {
                    return node;
                }
                node = node.parentElement;
            }
            return null;
        }

        /**
         * Constrain selection to stay within the current table cell
         * This prevents formatting commands from wrapping entire tables
         */
        constrainSelectionToCell() {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            
            // Find the table cell containing the selection
            let cell = null;
            let node = range.commonAncestorContainer;
            if (node.nodeType === Node.TEXT_NODE) {
                node = node.parentElement;
            }
            
            while (node && node !== this.editor) {
                if (node.tagName === 'TD' || node.tagName === 'TH') {
                    cell = node;
                    break;
                }
                node = node.parentElement;
            }
            
            if (!cell) return;
            
            // Check if the selection extends beyond this cell
            // If so, constrain it to the cell contents
            const cellRange = document.createRange();
            cellRange.selectNodeContents(cell);
            
            // Check if start is before cell start
            let startNode = range.startContainer;
            let startOffset = range.startOffset;
            if (range.compareBoundaryPoints(Range.START_TO_START, cellRange) < 0) {
                startNode = cellRange.startContainer;
                startOffset = cellRange.startOffset;
            }
            
            // Check if end is after cell end
            let endNode = range.endContainer;
            let endOffset = range.endOffset;
            if (range.compareBoundaryPoints(Range.END_TO_END, cellRange) > 0) {
                endNode = cellRange.endContainer;
                endOffset = cellRange.endOffset;
            }
            
            // Apply constrained selection
            try {
                const newRange = document.createRange();
                newRange.setStart(startNode, startOffset);
                newRange.setEnd(endNode, endOffset);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } catch (e) {
                // If something goes wrong, just select the cell contents
                selection.removeAllRanges();
                selection.addRange(cellRange);
            }
        }

        /**
         * Check if cursor is inside text decoration (underline/strikethrough)
         */
        isInsideTextDecoration(command) {
            const selection = window.getSelection();
            if (!selection.rangeCount) return false;
            
            const tagName = command === 'underline' ? 'U' : 'STRIKE';
            const altTagName = command === 'underline' ? 'U' : 'S';
            const decorationType = command === 'underline' ? 'underline' : 'line-through';
            
            let node = selection.anchorNode;
            if (node.nodeType === Node.TEXT_NODE) {
                node = node.parentElement;
            }
            
            while (node && node !== this.editor) {
                if (node.tagName === tagName || node.tagName === altTagName) {
                    return true;
                }
                if (node.style && node.style.textDecoration) {
                    if (node.style.textDecoration.toLowerCase().includes(decorationType)) {
                        return true;
                    }
                }
                node = node.parentElement;
            }
            return false;
        }

        /**
         * Check if cursor is inside bold/italic formatting
         */
        isInsideFormatting(command) {
            const selection = window.getSelection();
            if (!selection.rangeCount) return false;
            
            const tagName = command === 'bold' ? 'B' : 'I';
            const altTagName = command === 'bold' ? 'STRONG' : 'EM';
            const styleProp = command === 'bold' ? 'fontWeight' : 'fontStyle';
            
            let node = selection.anchorNode;
            if (node.nodeType === Node.TEXT_NODE) {
                node = node.parentElement;
            }
            
            while (node && node !== this.editor) {
                if (node.tagName === tagName || node.tagName === altTagName) {
                    return true;
                }
                if (node.style && node.style[styleProp]) {
                    const value = node.style[styleProp].toLowerCase();
                    if ((command === 'bold' && (value === 'bold' || parseInt(value) >= 700)) ||
                        (command === 'italic' && value === 'italic')) {
                        return true;
                    }
                }
                node = node.parentElement;
            }
            return false;
        }

        /**
         * Remove text decoration (underline/strikethrough) in table cells
         */
        removeTextDecoration(command) {
            const selection = window.getSelection();
            if (!selection.rangeCount) return false;
            
            const range = selection.getRangeAt(0);
            const tagName = command === 'underline' ? 'U' : 'STRIKE';
            const altTagName = command === 'underline' ? 'U' : 'S';
            const decorationType = command === 'underline' ? 'underline' : 'line-through';
            
            // Find the formatting element
            let parentFormatEl = null;
            let isStyleBased = false;
            let node = range.commonAncestorContainer;
            
            if (node.nodeType === Node.TEXT_NODE) {
                node = node.parentElement;
            }
            
            // Walk up to find formatting element (but stop at table cell)
            while (node && node !== this.editor && node.tagName !== 'TD' && node.tagName !== 'TH') {
                if (node.tagName === tagName || node.tagName === altTagName) {
                    parentFormatEl = node;
                    break;
                }
                if (node.style && node.style.textDecoration) {
                    const decoration = node.style.textDecoration.toLowerCase();
                    if (decoration.includes(decorationType)) {
                        parentFormatEl = node;
                        isStyleBased = true;
                        break;
                    }
                }
                node = node.parentElement;
            }
            
            if (!parentFormatEl) return false;
            
            // Remove the formatting
            if (isStyleBased) {
                const currentDecoration = parentFormatEl.style.textDecoration;
                const newDecoration = currentDecoration
                    .replace(new RegExp(decorationType, 'gi'), '')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                if (newDecoration) {
                    parentFormatEl.style.textDecoration = newDecoration;
                } else {
                    parentFormatEl.style.textDecoration = '';
                    if (parentFormatEl.tagName === 'SPAN' && 
                        (!parentFormatEl.getAttribute('style') || parentFormatEl.getAttribute('style').trim() === '')) {
                        this.unwrapElement(parentFormatEl);
                    }
                }
            } else {
                this.unwrapElement(parentFormatEl);
            }
            
            return true;
        }

        /**
         * Remove bold/italic formatting in table cells
         */
        removeFormatting(command) {
            const selection = window.getSelection();
            if (!selection.rangeCount) return false;
            
            const range = selection.getRangeAt(0);
            const tagName = command === 'bold' ? 'B' : 'I';
            const altTagName = command === 'bold' ? 'STRONG' : 'EM';
            const styleProp = command === 'bold' ? 'fontWeight' : 'fontStyle';
            
            // Find the formatting element
            let parentFormatEl = null;
            let isStyleBased = false;
            let node = range.commonAncestorContainer;
            
            if (node.nodeType === Node.TEXT_NODE) {
                node = node.parentElement;
            }
            
            // Walk up to find formatting element (but stop at table cell)
            while (node && node !== this.editor && node.tagName !== 'TD' && node.tagName !== 'TH') {
                if (node.tagName === tagName || node.tagName === altTagName) {
                    parentFormatEl = node;
                    break;
                }
                if (node.style && node.style[styleProp]) {
                    const value = node.style[styleProp].toLowerCase();
                    if ((command === 'bold' && (value === 'bold' || parseInt(value) >= 700)) ||
                        (command === 'italic' && value === 'italic')) {
                        parentFormatEl = node;
                        isStyleBased = true;
                        break;
                    }
                }
                node = node.parentElement;
            }
            
            if (!parentFormatEl) return false;
            
            // Remove the formatting
            if (isStyleBased) {
                parentFormatEl.style[styleProp] = '';
                if (parentFormatEl.tagName === 'SPAN' && 
                    (!parentFormatEl.getAttribute('style') || parentFormatEl.getAttribute('style').trim() === '')) {
                    this.unwrapElement(parentFormatEl);
                }
            } else {
                this.unwrapElement(parentFormatEl);
            }
            
            return true;
        }

        /**
         * Unwrap an element, keeping its children
         */
        unwrapElement(element) {
            const parent = element.parentNode;
            if (!parent) return;
            
            // Move all children before the element
            while (element.firstChild) {
                parent.insertBefore(element.firstChild, element);
            }
            
            // Remove the now-empty element
            parent.removeChild(element);
            
            // Normalize to merge adjacent text nodes
            parent.normalize();
        }

        /**
         * Apply formatting in a table cell using DOM manipulation
         * This avoids execCommand which can wrap entire tables
         */
        applyFormattingInCell(tagName) {
            // Find the cell containing the selection
            const cell = this.getSelectionCell();
            if (!cell) return false;
            
            // Check if cell has meaningful text content (not just <br>)
            const textContent = cell.textContent;
            const hasContent = textContent && textContent.trim().length > 0;
            
            if (!hasContent) {
                // Empty cell - nothing to format
                return false;
            }
            
            // Create wrapper element
            const wrapper = document.createElement(tagName);
            
            // Move all cell contents into wrapper
            while (cell.firstChild) {
                wrapper.appendChild(cell.firstChild);
            }
            cell.appendChild(wrapper);
            
            // Set cursor at end of wrapper
            try {
                const selection = window.getSelection();
                const newRange = document.createRange();
                newRange.selectNodeContents(wrapper);
                newRange.collapse(false); // Collapse to end
                selection.removeAllRanges();
                selection.addRange(newRange);
            } catch (e) {
                // Ignore selection errors
            }
            
            return true;
        }

        /**
         * Immediately update font dropdown label and active state
         * (Don't rely on computed styles which may not have updated yet)
         */
        updateFontDropdownImmediate(fontValue) {
            const fontFamilyDropdown = this.toolbar.querySelector('[data-dropdown-type="fontFamily"]');
            if (!fontFamilyDropdown) return;
            
            const label = fontFamilyDropdown.querySelector('.richeditor-dropdown-label');
            const menu = fontFamilyDropdown.querySelector('.richeditor-dropdown-menu');
            
            // Find matching font in options
            const matchedFont = this.options.fontFamilies.find(f => {
                return f.value.toLowerCase().replace(/['"]/g, '') === fontValue.toLowerCase().replace(/['"]/g, '');
            });
            
            if (matchedFont) {
                if (label) {
                    label.textContent = matchedFont.label;
                }
                if (menu) {
                    menu.querySelectorAll('.richeditor-dropdown-item').forEach(item => {
                        item.classList.remove('active');
                        if (item.dataset.value === matchedFont.value) {
                            item.classList.add('active');
                        }
                    });
                }
            }
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
                // Check if selection is entirely within a single span with font-size
                const commonAncestor = range.commonAncestorContainer;
                let parentSpan = null;
                
                // Check if we're selecting all content of a span with font-size
                if (commonAncestor.nodeType === Node.ELEMENT_NODE && 
                    commonAncestor.tagName === 'SPAN' && 
                    commonAncestor.style.fontSize) {
                    parentSpan = commonAncestor;
                } else if (commonAncestor.nodeType === Node.TEXT_NODE &&
                           commonAncestor.parentElement &&
                           commonAncestor.parentElement.tagName === 'SPAN' &&
                           commonAncestor.parentElement.style.fontSize) {
                    parentSpan = commonAncestor.parentElement;
                }
                
                // If entire selection is within a font-size span, just update it
                if (parentSpan) {
                    const spanRange = document.createRange();
                    spanRange.selectNodeContents(parentSpan);
                    
                    // Check if selection covers the entire span content
                    if (range.toString() === spanRange.toString()) {
                        parentSpan.style.fontSize = size;
                        this.syncContent();
                        this.updateFontSizeDropdownImmediate(size);
                        this.updateToolbarState();
                        return;
                    }
                }
                
                // Extract contents and remove any existing font-size styling
                const fragment = range.extractContents();
                
                // Remove font-size from any child spans
                const childSpans = fragment.querySelectorAll('span[style*="font-size"]');
                childSpans.forEach(span => {
                    span.style.fontSize = '';
                    // If span has no other styles, unwrap it
                    if (!span.getAttribute('style') || span.getAttribute('style').trim() === '') {
                        while (span.firstChild) {
                            span.parentNode.insertBefore(span.firstChild, span);
                        }
                        span.parentNode.removeChild(span);
                    }
                });
                
                // Create new span with font size
                const span = document.createElement('span');
                span.style.fontSize = size;
                span.appendChild(fragment);
                
                // Insert the new span
                range.insertNode(span);
                
                // Clean up empty text nodes that might cause line breaks
                this.cleanEmptyNodes(span.parentNode);
                
                // Select the new content
                selection.removeAllRanges();
                const newRange = document.createRange();
                newRange.selectNodeContents(span);
                selection.addRange(newRange);
            }
            
            this.syncContent();
            this.updateFontSizeDropdownImmediate(size);
            this.updateToolbarState();
        }

        /**
         * Immediately update font size dropdown label and active state
         */
        updateFontSizeDropdownImmediate(sizeValue) {
            const fontSizeDropdown = this.toolbar.querySelector('[data-dropdown-type="fontSize"]');
            if (!fontSizeDropdown) return;
            
            const label = fontSizeDropdown.querySelector('.richeditor-dropdown-label');
            const menu = fontSizeDropdown.querySelector('.richeditor-dropdown-menu');
            
            // Find matching size in options
            const matchedSize = this.options.fontSizes.find(s => s.value === sizeValue);
            
            if (matchedSize) {
                if (label) {
                    label.textContent = matchedSize.label;
                }
                if (menu) {
                    menu.querySelectorAll('.richeditor-dropdown-item').forEach(item => {
                        item.classList.remove('active');
                        if (item.dataset.value === matchedSize.value) {
                            item.classList.add('active');
                        }
                    });
                }
            }
        }

        /**
         * Clean up empty text nodes and normalize
         */
        cleanEmptyNodes(element) {
            if (!element) return;
            
            // Remove empty text nodes
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            const emptyNodes = [];
            let node;
            while (node = walker.nextNode()) {
                if (node.textContent === '' || node.textContent === '\n') {
                    emptyNodes.push(node);
                }
            }
            
            emptyNodes.forEach(n => {
                if (n.parentNode) {
                    n.parentNode.removeChild(n);
                }
            });
            
            // Normalize to merge adjacent text nodes
            element.normalize();
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
            // Save selection before dialog opens
            this.saveSelection();
            
            let isLocked = false; // Track if selection is locked
            let selectedRows = 3;
            let selectedCols = 3;
            
            const self = this; // Save reference for callback
            
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
            `, function() {
                // OK button clicked - use the tracked selection values
                self.insertTable(selectedRows, selectedCols);
            });
            
            const grid = dialog.querySelector('#richeditor-table-grid');
            const sizeDisplay = dialog.querySelector('#richeditor-table-size');
            const rowsInput = dialog.querySelector('#richeditor-table-rows');
            const colsInput = dialog.querySelector('#richeditor-table-cols');
            
            if (!grid) return;
            
            // Sync input changes to tracked variables
            if (rowsInput) {
                rowsInput.addEventListener('change', () => {
                    selectedRows = parseInt(rowsInput.value) || 3;
                });
                rowsInput.addEventListener('input', () => {
                    selectedRows = parseInt(rowsInput.value) || 3;
                });
            }
            if (colsInput) {
                colsInput.addEventListener('change', () => {
                    selectedCols = parseInt(colsInput.value) || 3;
                });
                colsInput.addEventListener('input', () => {
                    selectedCols = parseInt(colsInput.value) || 3;
                });
            }
            
            // Function to update grid selection
            const updateSelection = (row, col) => {
                selectedRows = row;
                selectedCols = col;
                grid.querySelectorAll('.richeditor-table-cell').forEach(c => {
                    const cRow = parseInt(c.dataset.row);
                    const cCol = parseInt(c.dataset.col);
                    c.classList.toggle('selected', cRow <= row && cCol <= col);
                });
                if (sizeDisplay) sizeDisplay.textContent = `${row} x ${col}`;
                if (rowsInput) rowsInput.value = row;
                if (colsInput) colsInput.value = col;
            };
            
            grid.querySelectorAll('.richeditor-table-cell').forEach(cell => {
                // Mouseover to preview size (only if not locked)
                cell.addEventListener('mouseenter', () => {
                    if (isLocked) return; // Don't change if locked
                    
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    updateSelection(row, col);
                });
                
                // Click to lock the selection
                cell.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    
                    // Lock the selection
                    isLocked = true;
                    updateSelection(row, col);
                    
                    // Add locked indicator
                    grid.classList.add('locked');
                    if (sizeDisplay) sizeDisplay.innerHTML = `${row} x ${col} <span style="color: #28a745;">✓ Selected</span>`;
                });
            });
            
            // Click on grid again to unlock and reselect
            grid.addEventListener('dblclick', () => {
                isLocked = false;
                grid.classList.remove('locked');
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
            this.saveState();
            
            // Restore selection and focus editor
            this.restoreSelection();
            this.editor.focus();
            
            // Calculate equal column width percentage
            const colWidth = (100 / cols).toFixed(4);
            
            // Get editor default font settings
            let fontFamily = this.options.defaultFontFamily || 'Arial, sans-serif';
            const primaryFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
            const fontSize = this.options.defaultFontSize || '14pt';
            
            // Create table using DOM
            const table = document.createElement('table');
            table.border = '1';
            table.style.cssText = 'border-collapse: collapse; border: 1px solid rgb(0, 0, 0); width: 100%;';
            
            // Create colgroup
            const colgroup = document.createElement('colgroup');
            for (let j = 0; j < cols; j++) {
                const col = document.createElement('col');
                col.style.width = colWidth + '%';
                colgroup.appendChild(col);
            }
            table.appendChild(colgroup);
            
            // Create tbody and rows
            const tbody = document.createElement('tbody');
            for (let i = 0; i < rows; i++) {
                const tr = document.createElement('tr');
                for (let j = 0; j < cols; j++) {
                    const td = document.createElement('td');
                    td.style.cssText = 'border: 1px solid rgb(0, 0, 0); padding: 4px; font-family: ' + primaryFont + '; font-size: ' + fontSize + ';';
                    td.innerHTML = '<br>';
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            
            // Create paragraph after table with inline styles
            const p = document.createElement('p');
            if (this.options.enforceInlineStyles) {
                p.style.cssText = this.getDefaultParagraphStyle();
            }
            p.innerHTML = '<br>';
            
            // Get selection and insert
            const selection = window.getSelection();
            let inserted = false;
            
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                
                // Check if selection is inside the editor
                if (this.editor.contains(range.commonAncestorContainer)) {
                    range.deleteContents();
                    
                    // Insert paragraph first, then table (so table comes before paragraph)
                    const fragment = document.createDocumentFragment();
                    fragment.appendChild(table);
                    fragment.appendChild(p);
                    range.insertNode(fragment);
                    
                    // Move cursor into first cell
                    const firstCell = table.querySelector('td');
                    if (firstCell) {
                        const newRange = document.createRange();
                        newRange.setStart(firstCell, 0);
                        newRange.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                    }
                    inserted = true;
                }
            }
            
            // Fallback: append to editor
            if (!inserted) {
                this.editor.appendChild(table);
                this.editor.appendChild(p);
                
                // Move cursor into first cell
                const firstCell = table.querySelector('td');
                if (firstCell) {
                    const range = document.createRange();
                    range.setStart(firstCell, 0);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
            
            this.syncContent();
            this.updateToolbarState();
        }

        /**
         * Insert code block
         */
        insertCodeBlock() {
            const selection = window.getSelection();
            const text = selection.toString() || 'Code here...';
            const pStyle = this.options.enforceInlineStyles ? ` style="${this.getDefaultParagraphStyle()}"` : '';
            const fontSize = this.options.defaultFontSize || '14pt';
            // Code blocks use monospace font
            this.execCommand('insertHTML', `<pre style="font-family: 'Monaco', 'Menlo', 'Courier New', monospace; font-size: ${fontSize}; white-space: pre; margin: 0;"><code>${text}</code></pre><p${pStyle}><br></p>`);
        }

        /**
         * Insert image
         */
        insertImage(src, alt = '') {
            const pStyle = this.options.enforceInlineStyles ? ` style="${this.getDefaultParagraphStyle()}"` : '';
            this.execCommand('insertHTML', `<img src="${src}" alt="${alt}"><p${pStyle}><br></p>`);
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
            
            // Update font family dropdown
            this.updateFontDropdowns();
        }

        /**
         * Update font family, font size, and line height dropdowns to show current values
         */
        updateFontDropdowns() {
            // Check if we have recently selected values (within last 5 seconds)
            const recentlySelected = this.lastSelected && this.lastSelectedTime && 
                                    (Date.now() - this.lastSelectedTime) < 5000;
            
            const selection = window.getSelection();
            if (!selection.rangeCount && !recentlySelected) return;
            
            // Get the element at cursor position
            let node = selection.rangeCount ? selection.anchorNode : null;
            if (node && node.nodeType === Node.TEXT_NODE) {
                node = node.parentElement;
            }
            
            if (!node || !this.editor.contains(node)) {
                if (!recentlySelected) return;
                node = this.editor; // Fallback
            }
            
            // Get computed styles
            const computedStyle = window.getComputedStyle(node);
            
            // Update font family dropdown
            const fontFamilyDropdown = this.toolbar.querySelector('[data-dropdown-type="fontFamily"]');
            if (fontFamilyDropdown) {
                const label = fontFamilyDropdown.querySelector('.richeditor-dropdown-label');
                const menu = fontFamilyDropdown.querySelector('.richeditor-dropdown-menu');
                
                // Check lastSelected first
                if (recentlySelected && this.lastSelected.fontFamily) {
                    const lastFont = this.options.fontFamilies.find(f => f.value === this.lastSelected.fontFamily);
                    if (lastFont) {
                        if (label) label.textContent = lastFont.label;
                        if (menu) {
                            menu.querySelectorAll('.richeditor-dropdown-item').forEach(item => {
                                item.classList.remove('active');
                                if (item.dataset.value === lastFont.value) {
                                    item.classList.add('active');
                                }
                            });
                        }
                    }
                } else {
                    // Fall back to computed style
                    const currentFont = computedStyle.fontFamily;
                    const currentPrimary = currentFont.toLowerCase().replace(/['"]/g, '').split(',')[0].trim();
                    const matchedFont = this.options.fontFamilies.find(f => {
                        const fontValue = f.value.toLowerCase().replace(/['"]/g, '').split(',')[0].trim();
                        // Use exact match to avoid "Arial" matching "Arial Black"
                        return currentPrimary === fontValue;
                    });
                    
                    if (matchedFont) {
                        if (label) label.textContent = matchedFont.label;
                        if (menu) {
                            menu.querySelectorAll('.richeditor-dropdown-item').forEach(item => {
                                item.classList.remove('active');
                                if (item.dataset.value === matchedFont.value) {
                                    item.classList.add('active');
                                }
                            });
                        }
                    }
                }
            }
            
            // Update font size dropdown
            const fontSizeDropdown = this.toolbar.querySelector('[data-dropdown-type="fontSize"]');
            if (fontSizeDropdown) {
                const label = fontSizeDropdown.querySelector('.richeditor-dropdown-label');
                const menu = fontSizeDropdown.querySelector('.richeditor-dropdown-menu');
                
                // Check lastSelected first
                if (recentlySelected && this.lastSelected.fontSize) {
                    const lastSize = this.options.fontSizes.find(s => s.value === this.lastSelected.fontSize);
                    if (lastSize) {
                        if (label) label.textContent = lastSize.label;
                        if (menu) {
                            menu.querySelectorAll('.richeditor-dropdown-item').forEach(item => {
                                item.classList.remove('active');
                                if (item.dataset.value === lastSize.value) {
                                    item.classList.add('active');
                                }
                            });
                        }
                    }
                } else {
                    // Fall back to computed/inline style
                    let inlineSize = this.getInlineFontSize(node);
                    let matchedSize = null;
                    let displayPt = null;
                    
                    if (inlineSize) {
                        const unit = inlineSize.replace(/[\d.]/g, '');
                        if (unit === 'pt') {
                            matchedSize = this.options.fontSizes.find(s => s.value === inlineSize);
                            displayPt = parseFloat(inlineSize);
                        } else {
                            const pxValue = parseFloat(inlineSize);
                            displayPt = Math.round(pxValue * 0.75);
                            matchedSize = this.options.fontSizes.find(s => {
                                const optPt = parseFloat(s.value);
                                return Math.abs(optPt - displayPt) <= 1;
                            });
                        }
                    } else {
                        const computedSize = computedStyle.fontSize;
                        const pxValue = parseFloat(computedSize);
                        displayPt = Math.round(pxValue * 0.75);
                        matchedSize = this.options.fontSizes.find(s => {
                            const optPt = parseFloat(s.value);
                            return Math.abs(optPt - displayPt) <= 1;
                        });
                    }
                    
                    if (label) label.textContent = matchedSize ? matchedSize.label : `${displayPt}pt`;
                    if (menu) {
                        menu.querySelectorAll('.richeditor-dropdown-item').forEach(item => {
                            item.classList.remove('active');
                            if (matchedSize && item.dataset.value === matchedSize.value) {
                                item.classList.add('active');
                            }
                        });
                    }
                }
            }
            
            // Update line height dropdown
            const lineHeightDropdown = this.toolbar.querySelector('[data-dropdown-type="lineHeight"]');
            if (lineHeightDropdown) {
                const currentLineHeight = computedStyle.lineHeight;
                const label = lineHeightDropdown.querySelector('.richeditor-dropdown-label');
                const menu = lineHeightDropdown.querySelector('.richeditor-dropdown-menu');
                let matchedLH = null;
                let displayValue = 'Line Height';
                
                if (currentLineHeight !== 'normal') {
                    // Convert to number if it's in px
                    const fontSize = parseFloat(computedStyle.fontSize);
                    const lineHeightPx = parseFloat(currentLineHeight);
                    const ratio = (lineHeightPx / fontSize).toFixed(2);
                    
                    // Find matching line height in options
                    matchedLH = this.options.lineHeights.find(lh => {
                        return Math.abs(parseFloat(lh.value) - parseFloat(ratio)) < 0.1;
                    });
                    
                    displayValue = matchedLH ? matchedLH.label : ratio;
                }
                
                if (label) {
                    label.textContent = displayValue;
                }
                
                // Highlight active item in dropdown
                if (menu) {
                    menu.querySelectorAll('.richeditor-dropdown-item').forEach(item => {
                        item.classList.remove('active');
                        if (matchedLH && item.dataset.value === matchedLH.value) {
                            item.classList.add('active');
                        }
                    });
                }
            }
            
            // Update format block dropdown
            const formatBlockDropdown = this.toolbar.querySelector('[data-dropdown-type="formatBlock"]');
            if (formatBlockDropdown) {
                const label = formatBlockDropdown.querySelector('.richeditor-dropdown-label');
                const menu = formatBlockDropdown.querySelector('.richeditor-dropdown-menu');
                let matchedFormat = null;
                
                // Find the block element
                let blockNode = node;
                while (blockNode && blockNode !== this.editor) {
                    const tagName = blockNode.tagName ? blockNode.tagName.toLowerCase() : '';
                    matchedFormat = this.options.formatBlockOptions.find(f => f.value === tagName);
                    if (matchedFormat) {
                        if (label) {
                            label.textContent = matchedFormat.label;
                        }
                        break;
                    }
                    blockNode = blockNode.parentElement;
                }
                
                // Highlight active item in dropdown
                if (menu) {
                    menu.querySelectorAll('.richeditor-dropdown-item').forEach(item => {
                        item.classList.remove('active');
                        if (matchedFormat && item.dataset.value === matchedFormat.value) {
                            item.classList.add('active');
                        }
                    });
                }
            }
        }

        /**
         * Get inline font-size from element or its parents
         */
        getInlineFontSize(node) {
            while (node && node !== this.editor) {
                if (node.style && node.style.fontSize) {
                    return node.style.fontSize;
                }
                node = node.parentElement;
            }
            return null;
        }

        /**
         * Sync content to original element
         */
        syncContent() {
            // Clean up any invalid nesting before syncing
            this.cleanupInvalidNesting();
            
            // Ensure headings don't have font-size
            if (this.options.enforceInlineStyles) {
                this.removeHeadingFontSize();
            }
            
            const content = this.editor.innerHTML;
            if (this.originalElement.tagName === 'TEXTAREA' || this.originalElement.tagName === 'INPUT') {
                this.originalElement.value = content;
            } else {
                this.originalElement.innerHTML = content;
            }
        }

        /**
         * Clean up invalid HTML nesting (e.g., pre inside p, div inside p)
         */
        cleanupInvalidNesting() {
            // Find pre elements that are nested inside other block elements
            const invalidPreElements = this.editor.querySelectorAll('p > pre, div > pre, h1 > pre, h2 > pre, h3 > pre, h4 > pre, h5 > pre, h6 > pre');
            
            invalidPreElements.forEach(pre => {
                const parent = pre.parentElement;
                if (parent && parent !== this.editor) {
                    // Move the pre out of its parent
                    // If parent has content before the pre, keep it
                    // If parent has content after the pre, keep it
                    
                    const grandparent = parent.parentElement;
                    if (grandparent) {
                        // Check if there's other content in the parent besides this pre
                        const siblings = Array.from(parent.childNodes).filter(n => n !== pre);
                        const hasOtherContent = siblings.some(n => {
                            if (n.nodeType === Node.TEXT_NODE) return n.textContent.trim() !== '';
                            return true;
                        });
                        
                        if (!hasOtherContent) {
                            // Parent only contains this pre - replace parent with pre
                            grandparent.replaceChild(pre, parent);
                        } else {
                            // Parent has other content - insert pre after parent
                            grandparent.insertBefore(pre, parent.nextSibling);
                        }
                    }
                }
            });
            
            // Also clean up empty block elements that might be left behind
            const emptyBlocks = this.editor.querySelectorAll('p:empty, div:empty');
            emptyBlocks.forEach(block => {
                if (block.parentElement) {
                    block.remove();
                }
            });
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
            
            // Get text content, normalizing whitespace
            let text = this.editor.innerText || '';
            
            // Normalize whitespace: replace multiple spaces/newlines/tabs with single space
            text = text.replace(/[\s\n\r\t]+/g, ' ').trim();
            
            // Count words (non-empty strings after splitting on whitespace)
            const words = text.split(/\s+/).filter(w => w.length > 0).length;
            
            // Count text characters (excluding extra whitespace)
            const chars = text.length;
            
            // Count HTML characters
            const htmlChars = (this.editor.innerHTML || '').length;
            
            // Format the display
            // Left side: Words: X | Characters: Y of Z (if maxCharacters is set)
            if (this.options.maxCharacters > 0) {
                const maxChars = this.options.maxCharacters.toLocaleString();
                this.wordCount.textContent = `Words: ${words.toLocaleString()} | Characters: ${chars.toLocaleString()} of ${maxChars}`;
                
                // Visual warning when approaching or at limit
                const percentUsed = (chars / this.options.maxCharacters) * 100;
                if (chars >= this.options.maxCharacters) {
                    this.wordCount.classList.add('limit-reached');
                    this.wordCount.classList.remove('limit-warning');
                } else if (percentUsed >= 90) {
                    this.wordCount.classList.add('limit-warning');
                    this.wordCount.classList.remove('limit-reached');
                } else {
                    this.wordCount.classList.remove('limit-warning', 'limit-reached');
                }
            } else {
                this.wordCount.textContent = `Words: ${words.toLocaleString()} | Characters: ${chars.toLocaleString()}`;
                this.wordCount.classList.remove('limit-warning', 'limit-reached');
            }
            
            // Right side: HTML count
            if (this.htmlCount) {
                this.htmlCount.textContent = `HTML: ${htmlChars.toLocaleString()}`;
            }
        }

        /**
         * Get current character count (text only, not HTML)
         */
        getCharacterCount() {
            let text = this.editor.innerText || '';
            text = text.replace(/[\s\n\r\t]+/g, ' ').trim();
            return text.length;
        }

        /**
         * Show character limit warning
         */
        showCharacterLimitWarning() {
            // Flash the word count to indicate limit reached
            if (this.wordCount) {
                this.wordCount.classList.add('limit-flash');
                setTimeout(() => {
                    this.wordCount.classList.remove('limit-flash');
                }, 300);
            }
            
            // Also briefly show a tooltip/message
            this.showLimitTooltip();
        }

        /**
         * Show limit reached tooltip
         */
        showLimitTooltip() {
            // Remove existing tooltip
            const existing = this.statusBar.querySelector('.richeditor-limit-tooltip');
            if (existing) existing.remove();
            
            const tooltip = Utils.createElement('div', {
                className: 'richeditor-limit-tooltip',
                textContent: `Character limit reached (${this.options.maxCharacters.toLocaleString()} max)`
            });
            
            // Append to status bar for proper positioning
            this.statusBar.appendChild(tooltip);
            
            // Show tooltip
            setTimeout(() => {
                tooltip.classList.add('show');
            }, 10);
            
            // Remove after 2 seconds
            setTimeout(() => {
                tooltip.classList.remove('show');
                setTimeout(() => tooltip.remove(), 300);
            }, 2000);
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
                    position: relative;
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
                
                /* Menu Bar (professional style) */
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
                    border: none !important;
                    border-bottom: none !important;
                }
                
                .richeditor-menu-option:hover {
                    background: #f0f0f0;
                }
                
                .richeditor-menu-option.active {
                    background: #e3f2fd;
                    color: #1976d2;
                    font-weight: 500;
                }
                
                .richeditor-menu-option.active .richeditor-menu-check {
                    color: #1976d2;
                }
                
                .richeditor-menu-option.active:hover {
                    background: #bbdefb;
                }
                
                /* Menu option with check space */
                .richeditor-menu-option[data-type] {
                    padding-left: 8px;
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
                
                /* Toggle menu item */
                .richeditor-menu-toggle {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .richeditor-menu-check {
                    width: 16px;
                    min-width: 16px;
                    height: 16px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    color: #1976d2;
                    font-weight: bold;
                    margin-right: 4px;
                }
                
                /* Notification */
                .richeditor-notification {
                    position: absolute;
                    bottom: 50px;
                    left: 50%;
                    transform: translateX(-50%) translateY(10px);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-size: 14px;
                    opacity: 0;
                    transition: opacity 0.3s, transform 0.3s;
                    z-index: 10000;
                    pointer-events: none;
                }
                
                .richeditor-notification.show {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                
                /* Paste Options Dialog */
                .richeditor-paste-dialog {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.2);
                    z-index: 10000;
                }
                
                .richeditor-paste-dialog-content {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
                    padding: 20px;
                    min-width: 280px;
                    max-width: 350px;
                    z-index: 10001;
                }
                
                .richeditor-paste-dialog-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 16px;
                    text-align: center;
                }
                
                .richeditor-paste-options {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    margin-bottom: 16px;
                }
                
                .richeditor-paste-option {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 16px 20px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    background: #fafafa;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 120px;
                }
                
                .richeditor-paste-option:hover {
                    border-color: #0066cc;
                    background: #f0f7ff;
                }
                
                .richeditor-paste-option:active {
                    transform: scale(0.98);
                }
                
                .richeditor-paste-option-icon {
                    color: #666;
                }
                
                .richeditor-paste-option:hover .richeditor-paste-option-icon {
                    color: #0066cc;
                }
                
                .richeditor-paste-option-label {
                    font-size: 12px;
                    color: #555;
                    text-align: center;
                    font-weight: 500;
                }
                
                .richeditor-paste-dialog-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 12px;
                    border-top: 1px solid #eee;
                }
                
                .richeditor-paste-remember {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: #666;
                    cursor: pointer;
                }
                
                .richeditor-paste-remember input {
                    cursor: pointer;
                }
                
                .richeditor-paste-cancel {
                    padding: 6px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background: white;
                    color: #666;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .richeditor-paste-cancel:hover {
                    background: #f5f5f5;
                    border-color: #ccc;
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
                
                /* Read Only Banner */
                .richeditor-readonly-banner {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
                    border-bottom: 1px solid #ffcc80;
                    color: #e65100;
                    font-size: 13px;
                    font-weight: 500;
                }
                
                .richeditor-readonly-banner svg {
                    flex-shrink: 0;
                }
                
                /* Disabled/Readonly States */
                .richeditor-wrapper.disabled .richeditor-menubar {
                    opacity: 0.6;
                    pointer-events: none;
                }
                
                .richeditor-wrapper.disabled .richeditor-toolbar {
                    opacity: 0.6;
                    pointer-events: none;
                }
                
                .richeditor-wrapper.disabled .richeditor-editor {
                    background: #f9f9f9;
                    color: #666;
                }
                
                .richeditor-wrapper.disabled .richeditor-statusbar {
                    opacity: 0.7;
                }
                
                .richeditor-wrapper.disabled .richeditor-resize {
                    pointer-events: none;
                    opacity: 0.3;
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
                
                .richeditor-dropdown-item.active {
                    background: #e3f2fd;
                    color: #1976d2;
                    font-weight: 500;
                }
                
                .richeditor-dropdown-item.active:hover {
                    background: #bbdefb;
                }
                
                .richeditor-dropdown-item h1,
                .richeditor-dropdown-item h2,
                .richeditor-dropdown-item h3,
                .richeditor-dropdown-item h4,
                .richeditor-dropdown-item h5,
                .richeditor-dropdown-item h6 {
                    margin: 0 !important;
                    border: none !important;
                    padding: 0 !important;
                    border-bottom: none !important;
                }
                
                .richeditor-dropdown-item h1 {
                    font-size: 1.8em;
                    font-weight: bold;
                }
                
                .richeditor-dropdown-item h2 {
                    font-size: 1.5em;
                    font-weight: bold;
                    border-bottom: none !important;
                }
                
                .richeditor-dropdown-item h3 {
                    font-size: 1.25em;
                    font-weight: bold;
                }
                
                .richeditor-dropdown-item h4 {
                    font-size: 1.1em;
                    font-weight: bold;
                }
                
                .richeditor-dropdown-item h5 {
                    font-size: 1em;
                    font-weight: bold;
                }
                
                .richeditor-dropdown-item h6 {
                    font-size: 0.9em;
                    font-weight: bold;
                }
                
                /* Editor content */
                .richeditor-container {
                    position: relative;
                }
                
                .richeditor-content {
                    padding: 16px;
                    outline: none;
                    overflow-y: auto;
                    overflow-x: auto;
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
                
                .richeditor-content h1,
                .richeditor-content h2,
                .richeditor-content h3,
                .richeditor-content h4,
                .richeditor-content h5,
                .richeditor-content h6 {
                    margin: 0.5em 0;
                    border: none;
                    padding: 0;
                }
                
                .richeditor-content h1 { font-size: 2em; }
                .richeditor-content h2 { font-size: 1.5em; border-bottom: none; }
                .richeditor-content h3 { font-size: 1.17em; }
                .richeditor-content h4 { font-size: 1em; }
                .richeditor-content h5 { font-size: 0.83em; }
                .richeditor-content h6 { font-size: 0.67em; }
                
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
                    white-space: pre;
                    margin: 0;
                    padding: 0;
                }
                
                .richeditor-content code {
                    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
                }
                
                .richeditor-content pre code {
                    background: transparent;
                    padding: 0;
                }
                
                /* Tables - fallback styles for tables without inline styles */
                .richeditor-content table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1em 0;
                }
                
                .richeditor-content td,
                .richeditor-content th {
                    border: 1px solid #ddd;
                    padding: 8px 12px;
                    min-width: 50px;
                }
                
                .richeditor-content th {
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
                    position: relative;
                }
                
                .richeditor-statusbar-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .richeditor-statusbar-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .richeditor-wordcount,
                .richeditor-htmlcount {
                    white-space: nowrap;
                }
                
                /* Character limit warning styles */
                .richeditor-wordcount.limit-warning {
                    color: #e65100;
                    font-weight: 500;
                }
                
                .richeditor-wordcount.limit-reached {
                    color: #d32f2f;
                    font-weight: 600;
                }
                
                .richeditor-wordcount.limit-flash {
                    animation: limitFlash 0.3s ease;
                }
                
                @keyframes limitFlash {
                    0%, 100% { background-color: transparent; }
                    50% { background-color: #ffcdd2; }
                }
                
                .richeditor-limit-tooltip {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-bottom: 8px;
                    background: #d32f2f;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-size: 13px;
                    white-space: nowrap;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 1000;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }
                
                .richeditor-limit-tooltip.show {
                    opacity: 1;
                }
                
                .richeditor-limit-tooltip::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-top: 6px solid #d32f2f;
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
                
                .richeditor-table-grid.locked {
                    opacity: 0.9;
                }
                
                .richeditor-table-grid.locked .richeditor-table-cell.selected {
                    background: #28a745;
                    border-color: #28a745;
                }
                
                .richeditor-table-cell {
                    width: 20px;
                    height: 20px;
                    border: 1px solid #ddd;
                    background: white;
                    cursor: pointer;
                    transition: all 0.1s ease;
                }
                
                .richeditor-table-cell:hover {
                    border-color: #0066cc;
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
            // Ensure inline styles are applied before returning content
            this.ensureInlineStyles();
            return this.editor.innerHTML;
        }

        /**
         * Set editor content
         */
        setContent(html) {
            this.editor.innerHTML = html;
            // Apply inline styles to imported content
            this.ensureInlineStyles();
            this.syncContent();
            this.updateWordCount();
        }

        /**
         * Get content as plain text (with normalized whitespace)
         */
        getText() {
            let text = this.editor.innerText || '';
            // Normalize whitespace from table/block formatting
            return text.replace(/[\s\n\r\t]+/g, ' ').trim();
        }

        /**
         * Get raw text content (includes all whitespace from HTML formatting)
         */
        getRawText() {
            return this.editor.innerText || '';
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
            this.wrapper.classList.remove('disabled', 'readonly');
            
            // Remove readonly banner if exists
            const banner = this.wrapper.querySelector('.richeditor-readonly-banner');
            if (banner) {
                banner.remove();
            }
            
            // Re-enable toolbar
            if (this.toolbar) {
                this.toolbar.classList.remove('disabled');
            }
            
            // Re-enable menu bar
            if (this.menuBar) {
                this.menuBar.classList.remove('disabled');
            }
            
            // Re-enable status bar interactions
            if (this.statusBar) {
                this.statusBar.classList.remove('disabled');
            }
            
            this.disabled = false;
        }

        /**
         * Disable the editor (read-only mode)
         */
        disable() {
            this.editor.setAttribute('contenteditable', 'false');
            this.wrapper.classList.add('disabled', 'readonly');
            
            // Add readonly banner if not exists
            if (!this.wrapper.querySelector('.richeditor-readonly-banner')) {
                const banner = Utils.createElement('div', {
                    className: 'richeditor-readonly-banner'
                });
                banner.innerHTML = `
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    <span>Read Only</span>
                `;
                
                // Insert banner at the top of the container (after menu/toolbar, before editor)
                const container = this.wrapper.querySelector('.richeditor-container');
                if (container) {
                    container.insertBefore(banner, container.firstChild);
                } else {
                    this.wrapper.insertBefore(banner, this.editor);
                }
            }
            
            // Disable toolbar
            if (this.toolbar) {
                this.toolbar.classList.add('disabled');
            }
            
            // Disable menu bar
            if (this.menuBar) {
                this.menuBar.classList.add('disabled');
            }
            
            // Disable status bar interactions
            if (this.statusBar) {
                this.statusBar.classList.add('disabled');
            }
            
            this.disabled = true;
        }
        
        /**
         * Check if editor is disabled
         */
        isDisabled() {
            return this.disabled === true;
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
            let text = this.editor.innerText || '';
            // Normalize whitespace
            text = text.replace(/[\s\n\r\t]+/g, ' ').trim();
            return text.split(/\s+/).filter(w => w.length > 0).length;
        }

        /**
         * Get character count
         */
        getCharCount() {
            let text = this.editor.innerText || '';
            // Normalize whitespace - count spaces between words but not extra formatting whitespace
            text = text.replace(/[\s\n\r\t]+/g, ' ').trim();
            return text.length;
        }

        /**
         * Get HTML character count
         */
        getHtmlCharCount() {
            return (this.editor.innerHTML || '').length;
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
            const htmlContent = this.editor.getContent();
            const words = text.trim().split(/\s+/).filter(w => w.length > 0);
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

            this.editor.createDialog('Document Statistics', `
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                    <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #0066cc;">${words.length}</div>
                        <div style="color: #666;">Words</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #0066cc;">${text.length}</div>
                        <div style="color: #666;">Characters</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #0066cc;">${htmlContent.length}</div>
                        <div style="color: #666;">HTML Chars</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #0066cc;">${sentences.length}</div>
                        <div style="color: #666;">Sentences</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #0066cc;">${paragraphs.length}</div>
                        <div style="color: #666;">Paragraphs</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #0066cc;">~${Math.ceil(words.length / 200)}</div>
                        <div style="color: #666;">Min Read</div>
                    </div>
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
