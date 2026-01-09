# RichEditor

A full-featured, lightweight WYSIWYG rich text editor for web applications. Free and open-source alternative to commercial editors.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [API Methods](#api-methods)
- [Events](#events)
- [Toolbar Customization](#toolbar-customization)
- [Themes](#themes)
- [Plugins](#plugins)

---

## Installation

Include the RichEditor script in your HTML:

```html
<script src="richeditor.js"></script>
```

---

## Quick Start

```html
<textarea id="editor"></textarea>

<script>
const editor = new RichEditor('#editor', {
    height: 400,
    placeholder: 'Start typing...'
});
</script>
```

---

## Configuration Options

### Editor Dimensions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `height` | `number` | `400` | Editor height in pixels |
| `minHeight` | `number` | `200` | Minimum height in pixels |
| `maxHeight` | `number\|null` | `null` | Maximum height (`null` = no limit) |
| `width` | `string\|number` | `'100%'` | Editor width (CSS value or pixels) |

```javascript
new RichEditor('#editor', {
    height: 500,
    minHeight: 300,
    maxHeight: 800,
    width: '100%'
});
```

---

### Content & State

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `placeholder` | `string` | `'Start typing...'` | Placeholder text when editor is empty |
| `initialContent` | `string` | `''` | Initial HTML content |
| `disabled` | `boolean` | `false` | Start editor in read-only mode |
| `rtl` | `boolean` | `false` | Right-to-left text direction |
| `spellcheck` | `boolean` | `true` | Enable browser spell checking |

```javascript
new RichEditor('#editor', {
    placeholder: 'Write your content here...',
    initialContent: '<p>Hello World!</p>',
    disabled: false,
    rtl: false,
    spellcheck: true
});
```

---

### Feature Toggles

Enable or disable specific editor features:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enableLinks` | `boolean` | `true` | Enable link insertion |
| `enableImages` | `boolean` | `true` | Enable image insertion |
| `enableVideos` | `boolean` | `true` | Enable video embedding |
| `enableTables` | `boolean` | `true` | Enable table insertion |
| `enableColors` | `boolean` | `true` | Enable text/background colors |
| `enableLists` | `boolean` | `true` | Enable ordered/unordered lists |
| `enableAlignment` | `boolean` | `true` | Enable text alignment |
| `enableIndent` | `boolean` | `true` | Enable indent/outdent |
| `enableHeadings` | `boolean` | `true` | Enable heading formats |
| `enableFonts` | `boolean` | `true` | Enable font family selection |
| `enableFontSizes` | `boolean` | `true` | Enable font size selection |
| `enableLineHeight` | `boolean` | `true` | Enable line height selection |

```javascript
new RichEditor('#editor', {
    enableLinks: true,
    enableImages: true,
    enableVideos: false,      // Disable video embedding
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

### UI Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `showMenuBar` | `boolean` | `true` | Show the menu bar (Edit, Insert, Format, Table) |
| `showWordCount` | `boolean` | `true` | Show word/character count in status bar |
| `showHtmlCount` | `boolean` | `true` | Show HTML character count in status bar |
| `theme` | `string` | `'light'` | Theme: `'light'` or `'dark'` |

```javascript
new RichEditor('#editor', {
    showMenuBar: true,
    showWordCount: true,
    showHtmlCount: true,
    theme: 'light'
});
```

---

### Character Limit

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxCharacters` | `number` | `10000` | Maximum character limit (`0` = no limit) |

When enabled:
- Displays "Characters: X of Y" in status bar
- Shows orange warning at 90% capacity
- Shows red warning at 100% capacity
- Blocks typing when limit reached
- Truncates pasted content that exceeds limit

```javascript
new RichEditor('#editor', {
    maxCharacters: 5000    // Limit to 5000 characters
});

// No limit
new RichEditor('#editor', {
    maxCharacters: 0
});
```

---

### Paste Mode

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `pasteMode` | `string` | `'plainText'` | Paste behavior mode |

**Values:**
- `'plainText'` - Always paste as plain text (default)
- `'formattedAndPlainText'` - Show dialog to choose between formatted or plain text

```javascript
// Always paste as plain text (default)
new RichEditor('#editor', {
    pasteMode: 'plainText'
});

// Show paste options dialog
new RichEditor('#editor', {
    pasteMode: 'formattedAndPlainText'
});
```

---

### Paste Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `pasteSettings.cleanPaste` | `boolean` | `true` | Clean pasted content |
| `pasteSettings.keepStructure` | `boolean` | `true` | Keep document structure when pasting formatted |

```javascript
new RichEditor('#editor', {
    pasteMode: 'formattedAndPlainText',
    pasteSettings: {
        cleanPaste: true,
        keepStructure: true
    }
});
```

---

### Default Styles

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `defaultColor` | `string` | `'#000000'` | Default text color |
| `defaultFontFamily` | `string` | `'Arial, sans-serif'` | Default font family |
| `defaultFontSize` | `string` | `'14pt'` | Default font size |
| `defaultLineHeight` | `string` | `'1.5'` | Default line height |
| `enforceInlineStyles` | `boolean` | `true` | Apply inline styles to all elements |

```javascript
new RichEditor('#editor', {
    defaultColor: '#333333',
    defaultFontFamily: 'Georgia, serif',
    defaultFontSize: '12pt',
    defaultLineHeight: '1.6',
    enforceInlineStyles: true
});
```

---

### Font Families

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `fontFamilies` | `array` | See below | Available font families |

**Default fonts:**
- Andale Mono
- Arial
- Arial Black
- Book Antiqua
- Comic Sans MS
- Courier New
- Georgia
- Helvetica
- Impact
- Symbol
- Tahoma
- Terminal
- Times New Roman
- Trebuchet MS
- Verdana

```javascript
new RichEditor('#editor', {
    fontFamilies: [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: 'Courier New, monospace', label: 'Courier New' },
        // Add custom fonts
        { value: 'Roboto, sans-serif', label: 'Roboto' }
    ]
});
```

---

### Font Sizes

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `fontSizes` | `array` | See below | Available font sizes |

**Default sizes:** 8pt, 10pt, 12pt, 14pt, 18pt, 24pt, 36pt

```javascript
new RichEditor('#editor', {
    fontSizes: [
        { value: '10pt', label: '10pt' },
        { value: '12pt', label: '12pt' },
        { value: '14pt', label: '14pt' },
        { value: '16pt', label: '16pt' },
        { value: '18pt', label: '18pt' },
        { value: '24pt', label: '24pt' }
    ]
});
```

---

### Line Heights

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `lineHeights` | `array` | See below | Available line heights |

**Default values:** 1, 1.15, 1.5, 2, 2.5, 3

```javascript
new RichEditor('#editor', {
    lineHeights: [
        { value: '1', label: 'Single' },
        { value: '1.5', label: '1.5' },
        { value: '2', label: 'Double' }
    ]
});
```

---

### Color Palette

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `colorPalette` | `array` | 80 colors | Available colors for text/background |

```javascript
new RichEditor('#editor', {
    colorPalette: [
        '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
        '#ffff00', '#ff00ff', '#00ffff', '#808080', '#c0c0c0'
    ]
});
```

---

### Table Defaults

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `tableDefaults.rows` | `number` | `3` | Default number of rows |
| `tableDefaults.cols` | `number` | `3` | Default number of columns |
| `tableDefaults.width` | `string` | `'100%'` | Default table width |
| `tableDefaults.border` | `string` | `'1px solid #ccc'` | Default border style |

```javascript
new RichEditor('#editor', {
    tableDefaults: {
        rows: 4,
        cols: 4,
        width: '100%',
        border: '1px solid #ddd'
    }
});
```

---

### Image Upload

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `imageUpload.enabled` | `boolean` | `true` | Enable image uploads |
| `imageUpload.maxSize` | `number` | `10485760` | Max file size in bytes (10MB) |
| `imageUpload.allowedTypes` | `array` | `['image/jpeg', 'image/png', 'image/gif', 'image/webp']` | Allowed MIME types |
| `imageUpload.handler` | `function\|null` | `null` | Custom upload handler |

```javascript
new RichEditor('#editor', {
    imageUpload: {
        enabled: true,
        maxSize: 5 * 1024 * 1024,  // 5MB
        allowedTypes: ['image/jpeg', 'image/png'],
        handler: async (file, callback) => {
            // Upload to your server
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            callback(data.url);  // Pass the image URL back
        }
    }
});
```

---

### Auto-Save

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `autoSave.enabled` | `boolean` | `false` | Enable auto-save |
| `autoSave.interval` | `number` | `30000` | Save interval in milliseconds |
| `autoSave.key` | `string` | `'richeditor_autosave'` | LocalStorage key |

```javascript
new RichEditor('#editor', {
    autoSave: {
        enabled: true,
        interval: 60000,  // Save every minute
        key: 'my_editor_content'
    }
});
```

---

### Format Options

| Property | Type | Description |
|----------|------|-------------|
| `formatBlockOptions` | `array` | Block format options for toolbar dropdown |
| `blockFormatOptions` | `array` | Block format options for menu |
| `inlineFormatOptions` | `array` | Inline format options |
| `alignOptions` | `array` | Text alignment options |

```javascript
new RichEditor('#editor', {
    formatBlockOptions: [
        { value: 'p', label: 'Paragraph' },
        { value: 'h1', label: 'Heading 1' },
        { value: 'h2', label: 'Heading 2' },
        { value: 'h3', label: 'Heading 3' },
        { value: 'pre', label: 'Preformatted' }
    ]
});
```

---

### Custom CSS

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `customCSS` | `string` | `''` | Custom CSS to inject into editor |

```javascript
new RichEditor('#editor', {
    customCSS: `
        .richeditor-content {
            font-family: 'My Custom Font', sans-serif;
        }
        .richeditor-content h1 {
            color: #0066cc;
        }
    `
});
```

---

### Allowed Tags (Sanitization)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `allowedTags` | `array\|null` | `null` | Allowed HTML tags (`null` = use defaults) |

```javascript
new RichEditor('#editor', {
    allowedTags: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li']
});
```

---

### Plugins

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `plugins` | `array` | `[]` | Array of plugin classes to load |

```javascript
new RichEditor('#editor', {
    plugins: [EmojiPlugin, WordCountPlugin]
});
```

---

## API Methods

### Content Methods

```javascript
// Get HTML content
const html = editor.getContent();

// Set HTML content
editor.setContent('<p>Hello World!</p>');

// Get plain text (no HTML)
const text = editor.getText();

// Insert content at cursor position
editor.insertContent('<strong>Bold text</strong>');

// Clear all content
editor.clear();

// Check if editor is empty
const isEmpty = editor.isEmpty();
```

### Editor State

```javascript
// Enable editor
editor.enable();

// Disable editor (read-only mode with banner)
editor.disable();

// Check if disabled
const isDisabled = editor.isDisabled();

// Focus editor
editor.focus();

// Blur editor
editor.blur();
```

### Counts

```javascript
// Get word count
const words = editor.getWordCount();

// Get character count
const chars = editor.getCharCount();
```

### Paste Mode

```javascript
// Set paste mode
editor.setPasteMode('plainText');
editor.setPasteMode('formattedAndPlainText');

// Get current paste mode
const mode = editor.getPasteMode();
```

### Theme

```javascript
// Change theme
editor.setTheme('dark');
editor.setTheme('light');
```

### Commands

```javascript
// Execute formatting command
editor.execCommand('bold');
editor.execCommand('italic');
editor.execCommand('underline');
editor.execCommand('formatBlock', 'h1');
editor.execCommand('fontSize', '18pt');
```

### Undo/Redo

```javascript
// Undo last action
editor.undo();

// Redo last undone action
editor.redo();
```

### Custom Toolbar Buttons

```javascript
editor.addToolbarButton('myButton', {
    icon: '⭐',
    title: 'My Custom Button',
    action: 'myAction'
});
```

### Destroy

```javascript
// Destroy editor instance
editor.destroy();
```

---

## Events

Register event handlers in configuration:

```javascript
new RichEditor('#editor', {
    events: {
        onChange: (data) => {
            console.log('Content changed:', data.content);
        },
        onFocus: () => {
            console.log('Editor focused');
        },
        onBlur: () => {
            console.log('Editor blurred');
        },
        onInit: (data) => {
            console.log('Editor initialized:', data.editor);
        },
        onImageUpload: (data) => {
            console.log('Image uploaded:', data.url);
        },
        onPaste: (data) => {
            console.log('Content pasted:', data);
        },
        onKeydown: (event) => {
            console.log('Key pressed:', event.key);
        },
        onKeyup: (event) => {
            console.log('Key released:', event.key);
        },
        onPasteModeChange: (data) => {
            console.log('Paste mode changed:', data.mode);
        }
    }
});
```

---

## Toolbar Customization

### Default Toolbar

```javascript
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
]
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
| `subscript` | Subscript |
| `superscript` | Superscript |
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
| `horizontalRule` | Horizontal line |
| `codeBlock` | Code block |
| `removeFormat` | Remove formatting |
| `clearFormatting` | Clear all formatting |
| `fontColor` | Text color |
| `backgroundColor` | Background color |
| `sourceCode` | View/edit source |
| `fullscreen` | Toggle fullscreen |
| `print` | Print content |
| `formatBlock` | Block format dropdown |
| `fontFamily` | Font family dropdown |
| `fontSize` | Font size dropdown |
| `lineHeight` | Line height dropdown |

### Custom Toolbar Configuration

```javascript
new RichEditor('#editor', {
    toolbar: [
        ['undo', 'redo'],
        ['bold', 'italic', 'underline'],
        ['alignLeft', 'alignCenter', 'alignRight'],
        ['link', 'image'],
        ['sourceCode']
    ]
});
```

---

## Themes

### Light Theme (Default)

```javascript
new RichEditor('#editor', {
    theme: 'light'
});
```

### Dark Theme

```javascript
new RichEditor('#editor', {
    theme: 'dark'
});
```

### Change Theme at Runtime

```javascript
editor.setTheme('dark');
```

---

## Plugins

### Built-in Plugins

- **EmojiPlugin** - Emoji picker
- **WordCountPlugin** - Enhanced word statistics dialog

### Using Plugins

```javascript
new RichEditor('#editor', {
    plugins: [RichEditor.EmojiPlugin, RichEditor.WordCountPlugin]
});
```

### Creating Custom Plugins

```javascript
class MyPlugin extends RichEditor.RichEditorPlugin {
    constructor(editor) {
        super(editor);
        this.name = 'myPlugin';
    }

    init() {
        // Add toolbar button
        this.editor.addToolbarButton('myButton', {
            icon: '⭐',
            title: 'My Feature',
            action: 'myAction'
        });

        // Handle action
        const originalExecAction = this.editor.execAction.bind(this.editor);
        this.editor.execAction = (action, value) => {
            if (action === 'myAction') {
                this.doSomething();
            } else {
                originalExecAction(action, value);
            }
        };
    }

    doSomething() {
        // Your plugin logic
    }
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Ctrl+K` | Insert link |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+A` | Select all |
| `Ctrl+Shift+Z` | Redo |
| `Tab` | Indent (in lists) |
| `Shift+Tab` | Outdent (in lists) |

---

## Complete Example

```javascript
const editor = new RichEditor('#editor', {
    // Dimensions
    height: 500,
    minHeight: 300,
    width: '100%',
    
    // Content
    placeholder: 'Start writing your content...',
    initialContent: '',
    
    // Features
    enableLinks: true,
    enableImages: true,
    enableVideos: true,
    enableTables: true,
    
    // UI
    showMenuBar: true,
    showWordCount: true,
    showHtmlCount: true,
    theme: 'light',
    
    // Limits
    maxCharacters: 10000,
    
    // Paste
    pasteMode: 'plainText',
    
    // Styles
    defaultFontFamily: 'Arial, sans-serif',
    defaultFontSize: '14pt',
    defaultLineHeight: '1.5',
    enforceInlineStyles: true,
    
    // Auto-save
    autoSave: {
        enabled: true,
        interval: 60000,
        key: 'my_editor_draft'
    },
    
    // Image upload
    imageUpload: {
        enabled: true,
        maxSize: 5 * 1024 * 1024,
        handler: async (file, callback) => {
            // Your upload logic
            const url = await uploadToServer(file);
            callback(url);
        }
    },
    
    // Events
    events: {
        onChange: (data) => {
            console.log('Content changed');
        },
        onInit: (data) => {
            console.log('Editor ready');
        }
    },
    
    // Toolbar
    toolbar: [
        ['undo', 'redo'],
        ['formatBlock', 'fontFamily', 'fontSize'],
        ['bold', 'italic', 'underline'],
        ['alignLeft', 'alignCenter', 'alignRight'],
        ['orderedList', 'unorderedList'],
        ['link', 'image', 'table'],
        ['sourceCode', 'fullscreen']
    ]
});
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## License

MIT License

---

## Author

Created by **Bhargav Battula**
