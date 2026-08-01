// X/Twitter falls back to og:image when twitter:image is absent, but only after
// its crawler has parsed the page; naming the image explicitly makes the card
// resolve on the first fetch. Same artwork as the Open Graph card, so this is a
// re-export rather than a second design that could drift.
export { default, alt, size, contentType } from "./opengraph-image";
