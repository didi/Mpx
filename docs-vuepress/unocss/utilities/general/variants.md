[pseudo-selector]: https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes

# Variants

Variants allow you to specify under what circumstances your utilities will be activated.

You may use the screen size, system theme, or any [pseudo-selector], such as `:hover`.

You specify a variant by using the `:` separator, and you can combine them arbitrarily as in:

```
sm:bg-red-500 sm:hover:bg-green-300 dark:bg-white
```

## Screen Variants

### Mobile First

| Variant | Rule | Description |
| :------ | :--- | :---------- |
| sm | @media (min-width: 640px) { ... } | Enable utility when the screen width is greater than 640px |
| md | @media (min-width: 768px) { ... } | Enable utility when the screen width is greater than 768px |
| lg | @media (min-width: 1024px) { ... } | Enable utility when the screen width is greater than 1024px |
| xl | @media (min-width: 1280px) { ... } | Enable utility when the screen width is greater than 1280px |
| 2xl | @media (min-width: 1536px) { ... } | Enable utility when the screen width is greater than 1536px |

### Desktop First

| Variant | Rule | Description |
| :------ | :--- | :---------- |
| <sm | @media (max-width: 640px) { ... } | Enable utility when the screen width is less than 640px |
| <md | @media (max-width: 768px) { ... } | Enable utility when the screen width is less than 768px |
| <lg | @media (max-width: 1024px) { ... } | Enable utility when the screen width is less than 1024px |
| <xl | @media (max-width: 1280px) { ... } | Enable utility when the screen width is less than 1280px |
| <2xl  | @media (max-width: 1536px) { ... } | Enable utility when the screen width is less than 1536px |

### Only Screen

| Variant | Rule | Description |
| :------ | :--- | :---------- |
| @sm | @media (min-width: 640px) and (max-width: 768px) { ... } | Enable utility when the screen width is greater than 640px and less than 768px |
| @md | @media (min-width: 768px) and (max-width: 1024px) { ... } | Enable utility when the screen width is greater than 768px and less than 1024px |
| @lg | @media (min-width: 1024px) and (max-width: 1280px) { ... } | Enable utility when the screen width is greater than 1024px and less than 1280px |
| @xl | @media (min-width: 1280px) and (max-width: 1536px) { ... } | Enable utility when the screen width is greater than 1280px and less than 1536px |
| @2xl | @media (min-width: 1536px) { ... } | Enable utility when the screen width is greater than 1536px |

### Max-Width Breakpoints

You can define custom breakpoints that use `max-width` instead, or ranges, by
using the following configuration options:

```ts
export default {
  theme: {
    screens: {
      '2xl': { max: '1535px' },
      'sm': { min: '640px', max: '767px' },
    },
  },
}
```

### Raw Media Queries

You can define a custom screen by providing a raw media query in the config:

```ts
export default {
  theme: {
    screens: {
      portrait: { raw: '(orientation: portrait)' },
      print: { raw: 'print' },
    },
  },
}
```

For example, you could then use `print:hidden` to hide elements when styling for print.

## State Variants

### Pseudo Classes

| Variant | Rule | Description |
| :------ | :--- | :---------- |
| first | `.${utility}:first { ... }` | Targets the first-child pseudo-class. |
| last | `.${utility}:last { ... }` | Targets the last-child pseudo-class. |
| odd | `.${utility}:odd { ... }` | Targets the odd-child pseudo-class. |
| even | `.${utility}:even { ... }` | Targets the even-child pseudo-class. |
| visited | `.${utility}:visited { ... }` | Targets the visited pseudo-class. |
| checked | `.${utility}:checked { ... }` | Targets the checked pseudo-class. |
| focus-within | `.${utility}:focus-within { ... }` | Targets the focus-within pseudo-class. |
| hover | `.${utility}:hover { ... }` | Targets the hover pseudo-class. |
| focus | `.${utility}:focus { ... }` | Targets the focus pseudo-class. |
| focus-visible | `.${utility}:focus-visible { ... }` | Targets the focus-visible pseudo-class. |
| active | `.${utility}:active { ... }` | Targets the active pseudo-class. |
| link | `.${utility}:link { ... }` | Targets the link pseudo-class. |
| target | `.${utility}:target { ... }` | Targets the target pseudo-class. |
| not-checked | `.${utility}:not(:checked) { ... }` | Targets the :not(:checked) pseudo-class. |
| default | `.${utility}:default { ... }` | Targets the default pseudo-class. |
| enabled | `.${utility}:enabled { ... }` | Targets the enabled pseudo-class. |
| indeterminate | `.${utility}:indeterminate { ... }` | Targets the indeterminate pseudo-class. |
| invalid | `.${utility}:invalid { ... }` | Targets the invalid pseudo-class. |
| valid | `.${utility}:valid { ... }` | Targets the valid pseudo-class. |
| optional | `.${utility}:optional { ... }` | Targets the optional pseudo-class. |
| required | `.${utility}:required { ... }` | Targets the required pseudo-class. |
| placeholder-shown | `.${utility}:placeholder-shown { ... }` | Targets the placeholder-shown pseudo-class. |
| read-only | `.${utility}:read-only { ... }` | Targets the read-only pseudo-class. |
| read-write | `.${utility}:read-write { ... }` | Targets the read-write pseudo-class. |
| not-disabled | `.${utility}:not(:disabled) { ... }` | Targets the :not(:disabled) pseudo-class. |
| first-of-type | `.${utility}:first-of-type { ... }` | Targets the first-of-type pseudo-class. |
| not-first-of-type | `.${utility}:not(:first-of-type) { ... }` | Targets the :not(:first-of-type) pseudo-class. |
| last-of-type | `.${utility}:last-of-type { ... }` | Targets the last-of-type pseudo-class. |
| not-last-of-type | `.${utility}:not(:last-of-type) { ... }` | Targets the :not(:last-of-type) pseudo-class. |
| not-first | `.${utility}:not(:first-child) { ... }` | Targets the not(:first-child) pseudo-class. |
| not-last | `.${utility}:not(:last-child) { ... }` | Targets the not(:last-child) pseudo-class. |
| only-child | `.${utility}:only-child { ... }` | Targets the only-child pseudo-class. |
| not-only-child | `.${utility}:not(:only-child) { ... }` | Targets the not(:only-child) pseudo-class. |
| only-of-type | `.${utility}:only-of-type { ... }` | Targets the only-of-type pseudo-class. |
| not-only-of-type | `.${utility}:not(:only-of-type) { ... }` | Targets the not(:only-of-type) pseudo-class. |
| even-of-type | `.${utility}:nth-of-type(even) { ... }` | Targets the nth-of-type(even) pseudo-class. |
| odd-of-type | `.${utility}:nth-of-type(odd) { ... }` | Targets the nth-of-type(odd) pseudo-class. |
| root | `.${utility}:root { ... }` | Targets the root pseudo-class. |
| empty | `.${utility}:empty { ... }` | Targets the empty pseudo-class. |

### Pseudo Elements

| Variant                     | Rule                                      | Description                                                 |
| :-------------------------- | :---------------------------------------- | :---------------------------------------------------------- |
| before                      | `.{utility}::before { ... }`              | Targets the before pseudo-element.                          |
| after                       | `.{utility}::after { ... }`               | Targets the after pseudo-element.                           |
| file / file-selector-button | `.{utility}::file-selector-button`        | Targets the file-selector-button pseudo-element.            |
| first-letter                | `.{utility}::first-letter { ... }`        | Targets the first-letter pseudo-element.                    |
| first-line                  | `.{utility}::first-line { ... }`          | Targets the first-line pseudo-element.                      |
| marker                      | `.{utility} *::marker, {utility}::marker` | Targets the marker pseudo-element. Can be used inheritable. |
| selection                   | `.{utility}::selection { ... }`           | Targets the selection pseudo-element.                       |

#### Pseudo Element Content

The content utilities generate the corresponding content css, such as `content: ""`, which can be very helpful in many cases.

<PlaygroundWithVariants
  variant='[&quot;&quot;]'
  :variants="['DEFAULT', '[&quot;&quot;]', '👍', 'open-quote', '\[attr(after)\]']"
  prefix='after:content'
  fixed='after:text-red-500 after:pl-2 after:inline-block'
  html='&lt;div class="{class}" after="after text"&gt;Element&lt;/div&gt;'
/>

### Parent Selectors

| Variant | Rule | Description |
| :------ | :--- | :---------- |
| group-hover | `.group:hover .${utility} { ... }` | Targets an element when a marked parent matches the hover pseudo-class. |
| group-focus | `.group:focus .${utility} { ... }` | Targets an element when a marked parent matches the focus pseudo-class. |
| group-active | `.group:active .${utility} { ... }` | Targets an element when a marked parent matches the active pseudo-class. |
| group-visited | `.group:visited .${utility} { ... }` | Targets an element when a marked parent matches the visited pseudo-class. |


### Child Selectors

| Variant | Rule | Description |
| :------ | :--- | :---------- |
| svg | `.${utility} svg { ... }` | Targets svg nodes. |
| all | `.${utility} * { ... }` | Targets all nodes. |
| children | `.${utility} > * { ... }` | Targets children nodes. |
| siblings | `.${utility} ~ * { ... }` | Targets siblings nodes . |
| sibling | `.${utility} + * { ... }` | Targets first sibling node. |


### Media Query

| Variant | Rule | Description |
| :------ | :--- | :---------- |
| motion-safe | `@media (prefers-reduced-motion: no-preference) { ... }` | Targets the prefers-reduced-motion: no-preference media query.
| motion-reduce | `@media (prefers-reduced-motion: reduce) { ... }` | Targets the prefers-reduced-motion: reduce media query.

## Theme Variants

### Default

| Variant | Rule | Description |
| :------ | :--- | :---------- |
| dark | `@media (prefers-color-scheme: dark) { ... }` or `.dark .{utility} { ... }` | Enable utility base on user configuration |
| light | `@media (prefers-color-scheme: light) { ... }` or `.light .{utility} { ... }` | Enable utility base on user configuration |

### Following System

| Variant | Rule | Description |
| :------ | :--- | :---------- |
| @dark | `@media (prefers-color-scheme: dark) { ... }` | Enable utility when the system turns on dark mode |
| @light | `@media (prefers-color-scheme: light) { ... }` | Enable utility when the system turns on light mode |

### Following Application

| Variant | Rule | Description |
| :------ | :--- | :---------- |
| .dark | `.dark .{utility} { ... }` | Enable utility base on application dark mode |
| .light | `.light .{utility} { ... }` | Enable utility base on application light mode |

## Orientation Variants

| Variant   | Rule                                      | Description                                                |
| :-------- | :---------------------------------------- | :--------------------------------------------------------- |
| portrait  | `@media (orientation: portrait) { ... }`  | Enable utility when the device is in portrait orientation  |
| landscape | `@media (orientation: landscape) { ... }` | Enable utility when the device is in landscape orientation |
