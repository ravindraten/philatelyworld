# Sale Feature

## Marking a stamp as on sale

In `data.js`, add two fields to the stamp object:

```js
{
    name: "...",
    priceINR: 14400,
    isSoldOut: false,
    onSale: true,
    salePriceINR: 12000,
    ...
}
```

| Field | Type | Description |
|---|---|---|
| `onSale` | boolean | Set to `true` to show the "On Sale" badge and sale pricing |
| `salePriceINR` | number | The discounted price in INR |

Only available stamps (`isSoldOut: false`) should be marked as on sale.

## What it does

- A red "On Sale" badge appears on the stamp image (with pulse animation)
- The sale price is shown above the original price (which is striked out)
- Currency conversion (INR/EUR) applies to both sale and original prices
- Social sharing previews show `ON SALE: ₹{salePrice} (was ₹{originalPrice})`

## Sale icon (filtering)

A price-tag icon sits in the header between the announcement bell and blog bell. The tooltip shows the count of on-sale items.

### On the main page (`index.html`)
- **Click** the sale icon to show only on-sale items — all filter tabs are deselected
- **Click again** to deactivate and show all items
- Clicking any filter tab also deactivates the sale filter
- Active state: red filled background

### On other pages (`all_announcements.html`, `blog/`)
- Clicking the sale icon navigates to `index.html` with the sale filter pre-activated
