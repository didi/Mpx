# Touch Action

Utilities for controlling how an element can be scrolled and zoomed on touchscreens.

| Class             | Properties                  |
| :---------------- | :-------------------------- |
| touch-auto        | touch-action: auto;         |
| touch-none        | touch-action: none;         |
| touch-pan-x       | touch-action: pan-x;        |
| touch-pan-left    | touch-action: pan-left;     |
| touch-pan-right   | touch-action: pan-right;    |
| touch-pan-y       | touch-action: pan-y;        |
| touch-pan-up      | touch-action: pan-up;       |
| touch-pan-down    | touch-action: pan-down;     |
| touch-pinch-zoom  | touch-action: pinch-zoom;   |
| touch-manipulation| touch-action: manipulation; |

## Usage

Use the `touch-{action}` utilities to control how an element can be scrolled (panned) and zoomed (pinched) on `
touchscreens.

```html
<div class="w-full h-48 overflow-auto touch-auto ...">
  <!-- ... -->
</div>
<div class="w-full h-48 overflow-auto touch-none ...">
  <!-- ... -->
</div>
<div class="w-full h-48 overflow-auto touch-pan-x ...">
  <!-- ... -->
</div>
<div class="w-full h-48 overflow-auto touch-pan-y ...">
  <!-- ... -->
</div>
```
