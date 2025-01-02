# Screen Readers

Utilities for improving accessibility with screen readers.

| Class       | Properties                                                                                                                                                                     |
| :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sr-only     | position: absolute;<br>width: 1px;<br>height: 1px;<br>padding: 0;<br>margin: -1px;<br>overflow: hidden;<br>clip: rect(0, 0, 0, 0);<br>white-space: nowrap;<br>border-width: 0; |
| not-sr-only | position: static;<br>width: auto;<br>height: auto;<br>padding: 0;<br>margin: 0;<br>overflow: visible;<br>clip: auto;<br>white-space: normal;                                   |

## Usage

Use sr-only to hide an element visually without hiding it from screen readers:

```html
<a href="#">
  <svg><!-- ... --></svg>
  <span class="sr-only">Settings</span>
</a>
```

Use not-sr-only to undo sr-only, making an element visible to sighted users as well as screen readers. This can be
useful when you want to visually hide something on small screens but show it on larger screens for example:

```html
<a href="#">
  <svg><!-- ... --></svg>
  <span class="sr-only sm:not-sr-only">Settings</span>
</a>
```

By default, responsive and focus variants are generated for these utilities. You can use focus:not-sr-only to make an
element visually hidden by default but visible when the user tabs to it — useful for "skip to content" links:

```html
<a href="#" class="sr-only focus:not-sr-only">
  Skip to content
</a>
```