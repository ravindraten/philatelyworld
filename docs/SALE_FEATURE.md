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
| `onSale` | boolean | Set to `true` to show sale pricing |
| `salePriceINR` | number | The discounted price in INR |

Only available stamps (`isSoldOut: false`) should be marked as on sale.

## What it does

- Keeps the photograph clean: no overlay chip on the image.
- A red top edge on the card marks the lot as on sale.
- An "On sale" chip appears in the meta row below the image.
- The price block shows the sale price, the original price struck through,
  and an explicit "You save … (%)" line.
- Currency conversion (INR/EUR) applies to sale price, original price and savings.
- Social sharing previews show `ON SALE: ₹{salePrice} (was ₹{originalPrice})`.

## Sale icon (filtering)

A price-tag icon sits in the header between the announcement bell and blog bell. The tooltip shows the count of on-sale items.

### On the main page (`index.html`)
- **Click** the sale icon to show only on-sale items — all filter tabs are deselected
- **Click again** to deactivate and show all items
- Clicking any filter tab also deactivates the sale filter
- Active state: red filled background

### On other pages (`all_announcements.html`, `blog/`)
- Clicking the sale icon navigates to `index.html` with the sale filter pre-activated

## Prototypes

`onsale-prototypes/` holds the design study that led to the card accent
treatment. Open `onsale-prototypes/index.html` to compare all seven studies;
study 05 is the card accent now live on the catalogue.
