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

|                                             | Description                                       | Method                             |
| ------------------------------------------- | ------------------------------------------------- | ---------------------------------- |
| **[JSON Updates](#json-updates)**           | Fetch updates in JSON format for custom rendering | `freshfield.json()`                |
| **[HTML Updates](#html-updates)**           | Display updates in html stucture with css classes | `freshfield.html()`                |
| **[Subscription API](#subscription-api)**   | Email subscription management methods             | `freshfield.subscription.*`        |
| **[Last Update Modal](#last-update-modal)** | Show the most recent update to users in modal     | `freshfield.showLastUpdateModal()` |

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
        <span class="_ffUpdateVersion">v1.2.0</span>
        <time class="_ffUpdateDate">January 15, 2024</time>
        <h3 class="_ffUpdateTitle">New Features Released</h3>
      </div>
      <div class="_ffUpdateDescription">
        <p>We've added several new features...</p>
        <!-- The description is rendered as HTML from Markdown. -->
      </div>
      <div class="_ffFeaturesList">
        <div class="_ffFeature">
          <div class="_ffFeatureHeader">
            <span class="_ffFeatureIcon">...</span>
            <h3 class="_ffFeatureTitle">Dark Theme</h3>
            <span class="_ffFeatureLabel _ffFeatureLabel-new">new</span>
          </div>
          <p class="_ffFeatureDescription">
            Switch between light and dark themes
          </p>
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

### Subscription API

The subscription API provides core methods for managing email subscriptions:

|                                                  | Description                  | Method                                   |
| ------------------------------------------------ | ---------------------------- | ---------------------------------------- |
| **[Add Subscription](#add-subscription)**        | Subscribe an email address   | `freshfield.subscription.add()`          |
| **[Get Status](#get-subscription-status)**       | Check if email is subscribed | `freshfield.subscription.getStatus()`    |
| **[Update Status](#update-subscription-status)** | Change subscription status   | `freshfield.subscription.updateStatus()` |

---

#### Add Subscription

Subscribe an email address directly (core functionality without UI):

```javascript
// Subscribe an email address
try {
  const result = await freshfield.subscription.add("user@example.com");
  console.log(result.message); // "Email subscribed successfully"
} catch (error) {
  console.error("Failed to subscribe:", error.message);
}
```

**Returns:**

```json
{
  "code": 200,
  "message": "Email subscribed successfully",
  "data": {
    "email": "user@example.com"
  }
}
```

Example when an error occurs:

```json
{
  "code": 409,
  "message": "You've already subscribed",
  "data": {
    "email": "user@example.com"
  }
}
```

---

#### Get Subscription Status

Check if an email address is already subscribed:

```javascript
// Check subscription status
try {
  const status = await freshfield.subscription.getStatus("user@example.com");

  console.log(`Email: ${status.email}`);
  console.log(`Subscribed: ${status.subscribed}`);

  if (status.subscribed) {
    console.log("User is subscribed!");
  } else {
    console.log("User is not subscribed");
  }
} catch (error) {
  console.error("Failed to get status:", error.message);
}
```

**Returns:**

```json
{
  "code": 200,
  "message": "Email status retrieved successfully",
  "data": {
    "email": "user@example.com",
    "subscribed": true
  }
}
```

---

#### Update Subscription Status

Change the subscription status of an email address:

```javascript
try {
  const result = await freshfield.subscription.updateStatus(
    "user@example.com",
    true // 'true' subscribe a user, 'false' unsubscribe a user
  );
  console.log(result.message); // "Email status updated successfully"
} catch (error) {
  console.error("Failed to subscribe:", error.message);
}
```

**Returns:**

```json
{
  "code": 200,
  "message": "Email status updated successfully",
  "data": {
    "email": "user@example.com"
  }
}
```

<br/>

---

### Last Update Modal

This code example also includes a basic localstorage function that displays the modal only once. However, you can integrate it in whatever way works best for your application.

```javascript
freshfield.showLastUpdateModal({
  ageLimit: 14,
  theme: "carrot", // 'carrot' or 'none'
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
- `onConfirm`: Callback when user clicks the submit button.
- `ageLimit`: Only show modal when update is newer than this many days.

**Theme Options:**

- **`carrot`**: Modal design that is the same as on the Freshfield platform
- **`none`**: Pure HTML structure with semantic classes but **zero CSS styling** - users provide all styling from scratch
  <br/>

---

---

<br/>

## CSS Customization

> **Important:** For rewriting default styles without `!important` use css selectors like this:
>
> ```css
> ._ffModal ._ffUpdateTitle {
>   color: red;
> }
> ```
>
> NOT ONLY
>
> ```css
> ._ffUpdateTitle {
>   color: red; /* otherwise, you need to use `!important` here */
> }
> ```

<details>
<summary><strong>HTML Updates Classes</strong></summary>

- `._ffUpdatesList` - Updates list wrapper
- `._ffUpdate` - Individual update container
- `._ffUpdateHeader` - Update header section
- `._ffUpdateVersion` - Version badge
- `._ffUpdateTitle` - Update title
- `._ffUpdateDate` - Update date
- `._ffUpdateDescription` - Update description

</details>

<details>
<summary><strong>Features Classes</strong></summary>

**Common:**

- `._ffFeaturesList` - Features list container
- `._ffFeature` - Individual feature container
- `._ffFeatureIcon` - Feature icon container
- `._ffFeatureIconFallback` - Fallback icon styling

**HTML Updates List:**

- `._ffFeatureContent` - Feature content wrapper
- `._ffFeatureName` - Feature name (h4)
- `._ffFeatureDescription` - Feature description

**Modal Display:**

- `._ffFeatureHeader` - Feature header section
- `._ffFeatureTitle` - Feature title (h3)
- `._ffFeatureLabel` - Feature type label badge
- `._ffFeatureLabel-new` - New feature label styling (green background)
- `._ffFeatureLabel-fix` - Bug fix label styling (red background)
- `._ffFeatureLabel-improvement` - Improvement label styling (blue background)
- `._ffFeatureDescription` - Feature description text

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

**Modal Structure:**

- `._ffModal` - Modal overlay (with backdrop)
- `._ffModalContent` - Modal content container
- `._ffModalClose` - Close/submit button

**Update Content:**

- `._ffUpdateHeader` - Update header section
- `._ffUpdateVersion` - Version badge
- `._ffUpdateTitle` - Update title
- `._ffUpdateDate` - Update date
- `._ffUpdateDescription` - Update description

**Feature Elements:**

_See "Features Classes" section above for complete modal feature styling classes_

**Animation Classes:**

- `._ffClosing` - Applied during modal close animation

</details>

<details>
<summary><strong>Container & Utility Classes</strong></summary>

**Required Container IDs:**

- `_ffUpdatesContainer` - Required container element for HTML updates
- `_ffSubscriptionContainer` - Required container element for subscription widget

**Utility Classes:**

- `._ffEmpty` - Empty state message
- `._ffStyles` - Internal styles container

**CSS Animations:**

- `@keyframes _ffFlyIn` - Modal entrance animation
- `@keyframes _ffFlyOut` - Modal exit animation

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
