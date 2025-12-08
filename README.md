# 🖊️ RichEditor

A free, open-source WYSIWYG (What You See Is What You Get) rich text editor similar to TinyMCE - built with vanilla JavaScript, no dependencies required.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)

---

## ✨ Features

- 📝 **Rich Text Formatting** - Bold, italic, underline, strikethrough, subscript, superscript
- 🎨 **TinyMCE-Style Menu Bar** - Edit, Insert, Format, Table menus
- 🔤 **15+ Font Families** - Arial, Georgia, Times New Roman, Comic Sans MS, and more
- 📏 **7 Font Sizes** - From 8pt to 36pt
- ↕️ **Line Height Control** - Adjustable line spacing (1, 1.15, 1.5, 2, 2.5, 3)
- 🎨 **Text & Background Colors** - Full color palette with custom color picker
- 📋 **Lists** - Ordered and unordered lists
- ↔️ **Text Alignment** - Left, center, right, justify
- 🔗 **Links & Media** - Insert links, images, and embed videos
- 📊 **Table Support** - Create and manage tables with row/column controls
- 💻 **Code Blocks** - Syntax-highlighted code blocks and inline code
- ↩️ **Undo/Redo** - Full history support
- 📄 **Source Code View** - View and edit raw HTML
- 🖥️ **Fullscreen Mode** - Distraction-free editing
- 🖨️ **Print Support** - Print editor content directly
- 🔌 **Plugin Architecture** - Extend functionality with plugins
- ⚙️ **Customizable Toolbar** - Show/hide any toolbar button
- 🔧 **Feature Toggles** - Enable/disable specific features
- 💾 **Auto-Save** - Automatic content saving
- 🔄 **RTL Support** - Right-to-left language support

---

## 📦 Installation

### Option 1: Direct Download
Download `richeditor.js` and include it in your HTML:

```html
<script src="richeditor.js"></script>
```

### Option 2: CDN (Coming Soon)
```html
<script src="https://cdn.example.com/richeditor/1.0.0/richeditor.min.js"></script>
```

---

## 🚀 Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Editor</title>
</head>
<body>
    <div id="editor"></div>
    
    <script src="richeditor.js"></script>
    <script>
        const editor = new RichEditor('#editor');
    </script>
</body>
</html>
```

### With Options

```javascript
const editor = new RichEditor('#editor', {
    height: 400,
    placeholder: 'Start writing...',
    showMenuBar: true,
    initialContent: '<p>Hello World!</p>'
});
```

---

## ⚙️ Configuration Options

### Editor Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `height` | Number/String | `400` | Editor height in pixels or CSS value |
| `minHeight` | Number | `200` | Minimum height in pixels |
| `maxHeight` | Number | `null` | Maximum height in pixels |
| `width` | Number/String | `'100%'` | Editor width in pixels or CSS value |
| `placeholder` | String | `'Start typing...'` | Placeholder text |
| `initialContent` | String | `''` | Initial HTML content |
| `showMenuBar` | Boolean | `true` | Show/hide TinyMCE-style menu bar |
| `spellcheck` | Boolean | `true` | Enable browser spellcheck |
| `rtl` | Boolean | `false` | Right-to-left mode |

### Example

```javascript
const editor = new RichEditor('#editor', {
    height: 500,
    minHeight: 300,
    maxHeight: 800,
    width: '100%',
    placeholder: 'Write your content here...',
    showMenuBar: true,
    spellcheck: true
});
```

---

## 🔧 Feature Toggles

You can enable or disable specific features using these options:

| Option | Default | Description |
|--------|---------|-------------|
| `enableLinks` | `true` | Enable/disable link insertion |
| `enableImages` | `true` | Enable/disable image insertion |
| `enableVideos` | `true` | Enable/disable video embedding |
| `enableTables` | `true` | Enable/disable table creation |
| `enableColors` | `true` | Enable/disable text & background colors |
| `enableLists` | `true` | Enable/disable ordered & unordered lists |
| `enableAlignment` | `true` | Enable/disable text alignment buttons |
| `enableIndent` | `true` | Enable/disable indent/outdent |
| `enableHeadings` | `true` | Enable/disable heading formats (H1-H6) |
| `enableFonts` | `true` | Enable/disable font family selector |
| `enableFontSizes` | `true` | Enable/disable font size selector |
| `enableLineHeight` | `true` | Enable/disable line height control |

### Examples

#### Disable Links and Media
```javascript
const editor = new RichEditor('#editor', {
    enableLinks: false,
    enableImages: false,
    enableVideos: false
});
```

#### Disable Tables
```javascript
const editor = new RichEditor('#editor', {
    enableTables: false
});
```

#### Simple Text Editor (No Media, No Tables)
```javascript
const editor = new RichEditor('#editor', {
    enableLinks: false,
    enableImages: false,
    enableVideos: false,
    enableTables: false,
    showMenuBar: false
});
```

#### Basic Formatting Only
```javascript
const editor = new RichEditor('#editor', {
    enableLinks: false,
    enableImages: false,
    enableVideos: false,
    enableTables: false,
    enableColors: false,
    enableFonts: false,
    enableFontSizes: false,
    enableLineHeight: false,
    enableHeadings: false,
    showMenuBar: false
});
```

#### Full Featured (All Options Enabled)
```javascript
const editor = new RichEditor('#editor', {
    height: 500,
    showMenuBar: true,
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
    enableLineHeight: true
});
```

---

## 🔤 Font Configuration

### Default Font Settings

Set the default font family, size, and line height for the editor:

```javascript
const editor = new RichEditor('#editor', {
    defaultFontFamily: 'Georgia, serif',
    defaultFontSize: '16px',
    defaultLineHeight: '1.6'
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultFontFamily` | String | `'Arial, sans-serif'` | Default font for the editor |
| `defaultFontSize` | String | `'14px'` | Default font size (use px, pt, em, rem) |
| `defaultLineHeight` | String | `'1.5'` | Default line height |

### Adding Custom Fonts

You can customize the font dropdown by providing your own `fontFamilies` array:

```javascript
const editor = new RichEditor('#editor', {
    fontFamilies: [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: 'Times New Roman, serif', label: 'Times New Roman' },
        // Add your custom fonts
        { value: 'Roboto, sans-serif', label: 'Roboto' },
        { value: 'Open Sans, sans-serif', label: 'Open Sans' },
        { value: 'Lato, sans-serif', label: 'Lato' },
        { value: 'Montserrat, sans-serif', label: 'Montserrat' },
        { value: 'Poppins, sans-serif', label: 'Poppins' }
    ]
});
```

### Using Google Fonts

To use Google Fonts, first include the font in your HTML, then add it to the `fontFamilies` array:

**Step 1: Include Google Font in HTML**
```html
<head>
    <!-- Add Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Poppins:wght@400;700&display=swap" rel="stylesheet">
</head>
```

**Step 2: Add to fontFamilies**
```javascript
const editor = new RichEditor('#editor', {
    defaultFontFamily: 'Roboto, sans-serif',
    fontFamilies: [
        // System fonts
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: 'Times New Roman, serif', label: 'Times New Roman' },
        { value: 'Courier New, monospace', label: 'Courier New' },
        
        // Google Fonts
        { value: 'Roboto, sans-serif', label: 'Roboto' },
        { value: 'Open Sans, sans-serif', label: 'Open Sans' },
        { value: 'Poppins, sans-serif', label: 'Poppins' },
        { value: 'Lato, sans-serif', label: 'Lato' },
        { value: 'Montserrat, sans-serif', label: 'Montserrat' },
        { value: 'Playfair Display, serif', label: 'Playfair Display' },
        { value: 'Merriweather, serif', label: 'Merriweather' },
        { value: 'Source Code Pro, monospace', label: 'Source Code Pro' }
    ]
});
```

### Custom Font Sizes

Customize the available font sizes:

```javascript
const editor = new RichEditor('#editor', {
    fontSizes: [
        { value: '10px', label: '10px' },
        { value: '12px', label: '12px' },
        { value: '14px', label: '14px' },
        { value: '16px', label: '16px' },
        { value: '18px', label: '18px' },
        { value: '20px', label: '20px' },
        { value: '24px', label: '24px' },
        { value: '28px', label: '28px' },
        { value: '32px', label: '32px' },
        { value: '48px', label: '48px' }
    ]
});
```

### Custom Line Heights

Customize the available line heights:

```javascript
const editor = new RichEditor('#editor', {
    lineHeights: [
        { value: '1', label: 'Single' },
        { value: '1.15', label: '1.15' },
        { value: '1.5', label: '1.5' },
        { value: '1.75', label: '1.75' },
        { value: '2', label: 'Double' },
        { value: '2.5', label: '2.5' },
        { value: '3', label: 'Triple' }
    ]
});
```

### Complete Font Configuration Example

```javascript
const editor = new RichEditor('#editor', {
    // Set defaults
    defaultFontFamily: 'Roboto, sans-serif',
    defaultFontSize: '16px',
    defaultLineHeight: '1.6',
    
    // Custom font families
    fontFamilies: [
        { value: 'Roboto, sans-serif', label: 'Roboto' },
        { value: 'Open Sans, sans-serif', label: 'Open Sans' },
        { value: 'Lato, sans-serif', label: 'Lato' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: 'Arial, sans-serif', label: 'Arial' }
    ],
    
    // Custom font sizes
    fontSizes: [
        { value: '12px', label: 'Small' },
        { value: '16px', label: 'Normal' },
        { value: '20px', label: 'Large' },
        { value: '24px', label: 'X-Large' },
        { value: '32px', label: 'XX-Large' }
    ],
    
    // Custom line heights
    lineHeights: [
        { value: '1', label: 'Tight' },
        { value: '1.5', label: 'Normal' },
        { value: '2', label: 'Relaxed' }
    ]
});
```

### Default Font Families (Built-in)

RichEditor comes with 15 built-in fonts:

| Font Family | Type |
|-------------|------|
| Andale Mono | Monospace |
| Arial | Sans-serif |
| Arial Black | Sans-serif |
| Book Antiqua | Serif |
| Comic Sans MS | Cursive |
| Courier New | Monospace |
| Georgia | Serif |
| Helvetica | Sans-serif |
| Impact | Sans-serif |
| Symbol | Symbol |
| Tahoma | Sans-serif |
| Terminal | Monospace |
| Times New Roman | Serif |
| Trebuchet MS | Sans-serif |
| Verdana | Sans-serif |

### Using Custom Font Files (.ttf, .woff, .woff2, .otf)

If you have your own font files, you can add them to the editor in two steps:

#### Step 1: Load the Font with CSS @font-face

Add the `@font-face` rule in your HTML or CSS file:

```html
<style>
    @font-face {
        font-family: 'MyCustomFont';
        src: url('fonts/MyCustomFont.woff2') format('woff2'),
             url('fonts/MyCustomFont.woff') format('woff'),
             url('fonts/MyCustomFont.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
    }
    
    /* If you have bold version */
    @font-face {
        font-family: 'MyCustomFont';
        src: url('fonts/MyCustomFont-Bold.woff2') format('woff2'),
             url('fonts/MyCustomFont-Bold.woff') format('woff'),
             url('fonts/MyCustomFont-Bold.ttf') format('truetype');
        font-weight: bold;
        font-style: normal;
    }
    
    /* If you have italic version */
    @font-face {
        font-family: 'MyCustomFont';
        src: url('fonts/MyCustomFont-Italic.woff2') format('woff2'),
             url('fonts/MyCustomFont-Italic.woff') format('woff'),
             url('fonts/MyCustomFont-Italic.ttf') format('truetype');
        font-weight: normal;
        font-style: italic;
    }
</style>
```

#### Step 2: Add to Editor Configuration

```javascript
const editor = new RichEditor('#editor', {
    // Set as default font (optional)
    defaultFontFamily: 'MyCustomFont, sans-serif',
    
    // Add to font dropdown
    fontFamilies: [
        { value: 'MyCustomFont, sans-serif', label: 'My Custom Font' },
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: 'Times New Roman, serif', label: 'Times New Roman' },
        { value: 'Courier New, monospace', label: 'Courier New' }
    ]
});
```

#### Complete Example with Custom Font File

```html
<!DOCTYPE html>
<html>
<head>
    <title>Editor with Custom Font</title>
    
    <!-- Load custom font file -->
    <style>
        @font-face {
            font-family: 'MyCustomFont';
            src: url('fonts/MyCustomFont.woff2') format('woff2'),
                 url('fonts/MyCustomFont.woff') format('woff'),
                 url('fonts/MyCustomFont.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
        }
    </style>
</head>
<body>
    <div id="editor"></div>
    
    <script src="richeditor.js"></script>
    <script>
        const editor = new RichEditor('#editor', {
            defaultFontFamily: 'MyCustomFont, sans-serif',
            fontFamilies: [
                { value: 'MyCustomFont, sans-serif', label: 'My Custom Font' },
                { value: 'Arial, sans-serif', label: 'Arial' },
                { value: 'Georgia, serif', label: 'Georgia' },
                { value: 'Times New Roman, serif', label: 'Times New Roman' },
                { value: 'Courier New, monospace', label: 'Courier New' }
            ]
        });
    </script>
</body>
</html>
```

#### Font File Formats

| Format | Extension | Browser Support | Recommendation |
|--------|-----------|-----------------|----------------|
| WOFF2 | .woff2 | Modern browsers | ✅ Best (smallest size) |
| WOFF | .woff | All browsers | ✅ Good fallback |
| TrueType | .ttf | All browsers | ⚠️ Larger file size |
| OpenType | .otf | All browsers | ⚠️ Larger file size |

**Best Practice:** Use WOFF2 as primary with WOFF as fallback for optimal performance and compatibility.

#### Multiple Custom Fonts Example

```html
<style>
    /* Font 1: Brand Font */
    @font-face {
        font-family: 'BrandFont';
        src: url('fonts/BrandFont.woff2') format('woff2'),
             url('fonts/BrandFont.woff') format('woff');
    }
    
    /* Font 2: Heading Font */
    @font-face {
        font-family: 'HeadingFont';
        src: url('fonts/HeadingFont.woff2') format('woff2'),
             url('fonts/HeadingFont.woff') format('woff');
    }
    
    /* Font 3: Code Font */
    @font-face {
        font-family: 'CodeFont';
        src: url('fonts/CodeFont.woff2') format('woff2'),
             url('fonts/CodeFont.woff') format('woff');
    }
</style>

<script>
    const editor = new RichEditor('#editor', {
        defaultFontFamily: 'BrandFont, sans-serif',
        fontFamilies: [
            { value: 'BrandFont, sans-serif', label: 'Brand Font' },
            { value: 'HeadingFont, serif', label: 'Heading Font' },
            { value: 'CodeFont, monospace', label: 'Code Font' },
            { value: 'Arial, sans-serif', label: 'Arial' },
            { value: 'Georgia, serif', label: 'Georgia' }
        ]
    });
</script>
```

#### Folder Structure Example

```
your-project/
├── index.html
├── richeditor.js
└── fonts/
    ├── MyCustomFont.woff2
    ├── MyCustomFont.woff
    ├── MyCustomFont.ttf
    ├── MyCustomFont-Bold.woff2
    ├── MyCustomFont-Bold.woff
    └── MyCustomFont-Italic.woff2
```

---

## 📚 API Methods

### Content Methods

```javascript
// Get HTML content
const html = editor.getContent();

// Get plain text (no HTML tags)
const text = editor.getText();

// Set content
editor.setContent('<p>New content</p>');

// Insert content at cursor position
editor.insertContent('<strong>Inserted text</strong>');

// Clear all content
editor.clearContent();
```

### Editor State

```javascript
// Check if content is empty
const isEmpty = editor.isEmpty();

// Get word count
const words = editor.getWordCount();

// Get character count
const chars = editor.getCharCount();
```

### Editor Controls

```javascript
// Enable/disable editor
editor.enable();
editor.disable();

// Focus the editor
editor.focus();

// Undo/Redo
editor.undo();
editor.redo();
```

### View Modes

```javascript
// Toggle fullscreen
editor.toggleFullscreen();

// Toggle source code view
editor.toggleSourceView();

// Print content
editor.print();
```

### Destroy

```javascript
// Remove editor and clean up
editor.destroy();
```

---

## 🎯 Events

```javascript
const editor = new RichEditor('#editor', {
    onChange: (data) => {
        console.log('Content changed:', data.content);
    },
    onFocus: () => {
        console.log('Editor focused');
    },
    onBlur: () => {
        console.log('Editor blurred');
    },
    onKeydown: (data) => {
        console.log('Key pressed:', data.event.key);
    },
    onKeyup: (data) => {
        console.log('Key released:', data.event.key);
    },
    onImageUpload: (data) => {
        console.log('Image uploaded:', data.file);
    }
});
```

---

## 🔌 Plugins

RichEditor comes with built-in plugins:

### Word Count Plugin
```javascript
const editor = new RichEditor('#editor', {
    plugins: [RichEditorPlugins.WordCount]
});
```

### Find & Replace Plugin
```javascript
const editor = new RichEditor('#editor', {
    plugins: [RichEditorPlugins.FindReplace]
});
```

### Emoji Plugin
```javascript
const editor = new RichEditor('#editor', {
    plugins: [RichEditorPlugins.Emoji]
});
```

### Special Characters Plugin
```javascript
const editor = new RichEditor('#editor', {
    plugins: [RichEditorPlugins.SpecialChars]
});
```

### Multiple Plugins
```javascript
const editor = new RichEditor('#editor', {
    plugins: [
        RichEditorPlugins.WordCount,
        RichEditorPlugins.FindReplace,
        RichEditorPlugins.Emoji,
        RichEditorPlugins.SpecialChars
    ]
});
```

---

## 🎨 Custom Toolbar

You can customize the toolbar by specifying which buttons to show:

```javascript
const editor = new RichEditor('#editor', {
    toolbar: [
        ['undo', 'redo'],
        ['bold', 'italic', 'underline'],
        ['alignLeft', 'alignCenter', 'alignRight'],
        ['link', 'image'],
        ['sourceCode', 'fullscreen']
    ]
});
```

### Available Toolbar Buttons

| Button | Description |
|--------|-------------|
| `undo` | Undo last action |
| `redo` | Redo last action |
| `bold` | Bold text |
| `italic` | Italic text |
| `underline` | Underline text |
| `strikethrough` | Strikethrough text |
| `subscript` | Subscript text |
| `superscript` | Superscript text |
| `alignLeft` | Align left |
| `alignCenter` | Align center |
| `alignRight` | Align right |
| `alignJustify` | Justify text |
| `orderedList` | Numbered list |
| `unorderedList` | Bullet list |
| `indent` | Increase indent |
| `outdent` | Decrease indent |
| `link` | Insert link |
| `unlink` | Remove link |
| `image` | Insert image |
| `video` | Insert video |
| `table` | Insert table |
| `horizontalRule` | Insert horizontal line |
| `blockquote` | Block quote |
| `codeBlock` | Code block |
| `fontColor` | Text color |
| `backgroundColor` | Background color |
| `removeFormat` | Remove formatting |
| `clearFormatting` | Clear all formatting |
| `sourceCode` | View/edit source |
| `fullscreen` | Fullscreen mode |
| `print` | Print content |
| `formatBlock` | Heading/paragraph dropdown |
| `fontFamily` | Font family dropdown |
| `fontSize` | Font size dropdown |
| `lineHeight` | Line height dropdown |

---

## 💾 Auto-Save

Enable auto-save to automatically save content to localStorage:

```javascript
const editor = new RichEditor('#editor', {
    autoSave: {
        enabled: true,
        interval: 30000,  // Save every 30 seconds
        key: 'my-editor-content'  // localStorage key
    }
});
```

---

## 🖼️ Image Upload

### Using Base64 (Default)
Images are converted to base64 by default.

### Custom Upload Handler
```javascript
const editor = new RichEditor('#editor', {
    imageUpload: {
        maxSize: 5 * 1024 * 1024,  // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
        handler: (file, callback) => {
            // Upload to your server
            const formData = new FormData();
            formData.append('image', file);
            
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                callback(data.url);  // Pass the image URL
            });
        }
    }
});
```

---

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Opera (latest)

---

## 📄 License

MIT License

Copyright (c) 2025 Bhargav Battula

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 👨‍💻 Author

**Bhargav Battula**

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⭐ Support

If you find this project useful, please give it a star on GitHub!

---

## 📝 Changelog

### Version 1.0.0 (2025)
- Initial release
- Full-featured WYSIWYG editor
- TinyMCE-style menu bar
- 15+ font families
- Table support
- Plugin architecture
- Feature toggles
- Auto-save support
