# 🥕 Freshfield.io Javascript SDK

Official Javascript SDK package for integrating Freshfield updates. This SDK allows you to fetch and display updates from your Freshfield dashboard directly in your Javascript app.

> **⚠️ Early Development Notice:** Freshfield.io is in early stages of development. You may encounter bugs or breaking changes. If you find issues or have suggestions for improvements, please don't hesitate to [open an issue](https://github.com/freshfieldio/freshfield.js/issues) or contribute to the project.

## 📚 Quick Navigation

- **[Installation](#installation)**
- **[API Reference](#api-reference)** - All methods to display widgets
- **[CSS Customization](#css-customization)** - Style your widgets
- **[Framework Examples](#framework-examples)** - React, Vue, Svelte

## Installation

```bash
npm install freshfield.js
# or
pnpm add freshfield.js
# or
yarn add freshfield.js
```

## Initialization

```javascript
import Freshfield from "freshfield.js";

// Initialize Freshfield with your API key
const freshfield = new Freshfield();
freshfield.init("your-api-key");
```

## API Reference

|                                                 | Description                                       | Method                             |
| ----------------------------------------------- | ------------------------------------------------- | ---------------------------------- |
| **[JSON Updates](#json-updates)**               | Fetch updates in JSON format for custom rendering | `freshfield.json()`                |
| **[HTML Updates](#html-updates)**               | Display updates in html stucture with css classes | `freshfield.html()`                |
| **[Subscription Widget](#subscription-widget)** | Email subscription form for new updates           | `freshfield.subscription()`        |
| **[Last Update Modal](#last-update-modal)**     | Show the most recent update to users in modal     | `freshfield.showLastUpdateModal()` |

> **Note:** Everything can be styled with CSS. For more information, see the [CSS Customization](#css-customization) section.

<br/>

---

---

### JSON Updates

Use this method if you want to handle the rendering of updates yourself. This gives you full control over the appearance and behavior.

```javascript
// return updates in JSON format
const updates = await freshfield.json({
  limit: 2, // Number of updates to fetch
  offset: 0, // Offset for pagination
  iconFormat: "svg", // 'svg' or 'text'
});
```

<details>
<summary><strong>📄 Show Response Example</strong></summary>

```json
[
  {
    "id": "update-123",
    "title": "New Features Released",
    "created": "2024-01-15T10:00:00Z",
    "description": "We've added several new features...",
    "features": [
      {
        "type": "new",
        "name": "Dark Mode",
        "description": "Switch between light and dark themes",
        "icon": "<svg>...</svg>"
      }
    ]
  }
]
```

</details>

**Notes:**

- `iconFormat`: Choose between icon formats:
  - `'svg'` (default): Returns ready-to-use SVG markup for direct HTML insertion
  - `'text'`: Returns raw [Iconify](https://iconify.design) format (`prefix:name`)

<br/>

---

### HTML Updates

> **Important:** This method requires a container element with ID `_ffUpdatesContainer` in your DOM. The method cannot now use custom container ID.

```javascript
// Fetch and display updates in HTML format
await freshfield.html({
  limit: 2, // Number of updates to fetch
  offset: 0, // Offset for pagination
});
```

<details>
<summary><strong>📄 Show HTML Structure Example</strong></summary>

```html
<div id="_ffUpdatesContainer">
  <div class="_ffUpdatesList">
    <div class="_ffUpdate">
      <div class="_ffUpdateHeader">
        <h3 class="_ffUpdateTitle">New Features Released</h3>
        <span class="_ffUpdateDate">January 15, 2024</span>
      </div>
      <div class="_ffUpdateDescription">
        We've added several new features...
      </div>
      <div class="_ffFeaturesList">
        <div class="_ffFeature _ffFeature-new">
          <div class="_ffFeatureIcon">✨</div>
          <div class="_ffFeatureContent">
            <div class="_ffFeatureName">Dark Mode</div>
            <div class="_ffFeatureDescription">
              Switch between light and dark themes
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

</details>

```html
<!-- Required container for HTML updates -->
<div id="_ffUpdatesContainer">
  <!-- Updates will be automatically rendered here -->
</div>
```

<br/>

---

### Subscription Widget

> **Important:** This method requires a container element with ID `_ffSubscriptionContainer` in your DOM.

```javascript
// Display email subscription form
freshfield.subscription({
  placeholder: "Enter your email...",
  buttonTexts: {
    default: "Subscribe", // Default button text
    loading: "Subscribing...", // Button text during submission
    success: "Subscribed!", // Button text on success
  },
  validationMessages: {
    required: "Email is required",
    invalid: "Please enter a valid email address",
  },
  messages: {
    400: "Please enter a valid email address",
    409: "You've already subscribed!",
    429: "Too many attempts. Please wait a moment.",
    500: "Server error. Please try again later.",
    default: "Something went wrong",
    cancelled: "Custom validation failed",
  },
  beforeSend: async (email) => {
    // Custom validation before sending
    return true; // Return false to cancel (false also triggers messages.cancelled)
  },
  onSuccess: (email) => {
    console.log("Subscribed:", email);
  },
  onError: (error, email) => {
    console.log("Failed:", error.message);
  },
});
```

<details>
<summary><strong>📄 Show HTML Structure Example</strong></summary>

```html
<div id="_ffSubscriptionContainer">
  <form class="_ffSubscription">
    <div class="_ffSubscriptionInputWrapper">
      <input
        type="text"
        class="_ffSubscriptionInput"
        placeholder="Enter your email..."
      />
      <button type="submit" class="_ffSubscriptionButton">Subscribe</button>
    </div>
    <div class="_ffSubscriptionError" style="display: none;">
      <!-- Error messages appear here -->
    </div>
  </form>
</div>
```

</details>

```html
<!-- Required container for subscription widget -->
<div id="_ffSubscriptionContainer">
  <!-- Subscription form will be automatically rendered here -->
</div>
```

<br/>

---

### Last Update Modal

This code example also includes a basic localstorage function that displays the modal only once. However, you can integrate it in whatever way works best for your application.

```javascript
freshfield.showLastUpdateModal({
  ageLimit: 14,
  theme: "default" // 'default' or 'modern'
  submitButtonText: "Got it!",
  beforeShow: async (id) => {
    const lastSeenId = localStorage.getItem("_ffLastSeenUpdate");
    return id !== lastSeenId;
  },
  onConfirm: (id) => {
    localStorage.setItem("_ffLastSeenUpdate", id);
  },
});
```

**Parameters:**

- `beforeShow`: **Required** function that determines whether to show the modal. Return `true` to show, `false` to skip.
- `onConfirm`: **Required** callback when user clicks the submit button.
- `ageLimit`: Only show modal when update is newer than this many days.

<br/>

---

---

<br/>

## CSS Customization

All Freshfield widgets use CSS classes with the `_ff` prefix for easy customization:

<details>
<summary><strong>HTML Updates Classes</strong></summary>

- `._ffUpdatesContainer` - Main container element
- `._ffUpdatesList` - Updates list wrapper
- `._ffUpdate` - Individual update container
- `._ffUpdateHeader` - Update header section
- `._ffUpdateTitle` - Update title
- `._ffUpdateDate` - Update date
- `._ffUpdateDescription` - Update description

</details>

<details>
<summary><strong>Features Classes</strong></summary>

- `._ffFeaturesList` - Features list container
- `._ffFeature` - Individual feature
- `._ffFeature-new` - New feature styling
- `._ffFeature-fix` - Bug fix styling
- `._ffFeature-improvement` - Improvement styling
- `._ffFeatureIcon` - Feature icon
- `._ffFeatureContent` - Feature content container
- `._ffFeatureName` - Feature name
- `._ffFeatureDescription` - Feature description

</details>

<details>
<summary><strong>Subscription Widget Classes</strong></summary>

- `._ffSubscription` - Main subscription form
- `._ffSubscriptionInputWrapper` - Input and button container
- `._ffSubscriptionInput` - Email input field
- `._ffSubscriptionButton` - Submit button
- `._ffSubscriptionButtonSuccess` - Success state styling
- `._ffSubscriptionInputError` - Error state styling
- `._ffSubscriptionError` - Error message display

</details>

<details>
<summary><strong>Last Update Modal Classes</strong></summary>

- `._ffModal` - Modal overlay
- `._ffModalContent` - Modal content
- `._ffModalClose` - Close button

</details>

<details>
<summary><strong>Utility Classes</strong></summary>

- `._ffEmpty` - Empty state message
- `._ffStyles` - Internal styles container

</details>

## Framework Examples

### React

```jsx
import { useEffect } from "react";
import Freshfield from "freshfield.js";

function UpdatesWidget() {
  useEffect(() => {
    const freshfield = new Freshfield();
    freshfield.init("your-api-key");

    // Load HTML updates
    freshfield.html({ limit: 5 });
  }, []);

  return <div id="_ffUpdatesContainer" />;
}
```

### Vue

```vue
<template>
  <div id="_ffUpdatesContainer"></div>
</template>

<script setup>
import { onMounted } from "vue";
import Freshfield from "freshfield.js";

onMounted(async () => {
  const freshfield = new Freshfield();
  freshfield.init("your-api-key");

  await freshfield.html({ limit: 5 });
});
</script>
```

### Svelte

```svelte
<script>
    import { onMount } from 'svelte';
    import Freshfield from 'freshfield.js';

    onMount(async () => {
        const freshfield = new Freshfield();
        freshfield.init('your-api-key');

        await freshfield.html({ limit: 5 });
    });
</script>

<div id="_ffUpdatesContainer"></div>
```

## License

[MIT](./LICENSE)
