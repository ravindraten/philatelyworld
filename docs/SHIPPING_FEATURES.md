# Shipping Features

## Marking a stamp with free tracked shipping

In `data.js`, add one field to the stamp object:

```js
{
    name: "...",
    priceINR: 30000,
    isSoldOut: false,
    freeTrackedShipping: true,
    ...
}
```

| Field | Type | Description |
|---|---|---|
| `freeTrackedShipping` | boolean | Shows a green truck badge with "Free Tracked Shipping" text |

A green truck badge appears at the top-right of the stamp image. Currently 2 stamps use this (registered/tracked shipping from Netherlands).

## Marking a stamp with free letter post shipping

In `data.js`, add one field to the stamp object:

```js
{
    name: "...",
    priceINR: 899,
    isSoldOut: false,
    freeLetterPostShipping: true,
    ...
}
```

| Field | Type | Description |
|---|---|---|
| `freeLetterPostShipping` | boolean | Shows a blue envelope badge with "Free Letter Post" text |

A blue envelope badge appears at the top-right of the stamp image. Currently 26 stamps use this.

## Notes

- The two badges share the same position (top-right) but no stamp has both flags set
- Both badges display inline SVG icons with white text on a colored background
- The "Sold Out" badge (gray, top-left) takes precedence over shipping badges for sold items
