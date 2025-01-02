# Container

## Container

A component for fixing an element's width to the current breakpoint.

| Class     | Breakpoint     | Properties         |
| :-------- | :------------- | :----------------- |
| container | *None*         | width: 100%;       |
|           | sm *(640px)*   | max-width: 640px;  |
|           | md *(768px)*   | max-width: 768px;  |
|           | lg *(1024px)*  | max-width: 1024px; |
|           | xl *(1280px)*  | max-width: 1280px; |
|           | 2xl *(1536px)* | max-width: 1536px; |

### Usage

To center a container, use the mx-auto utility:

```html
<div class="container mx-auto">
  <!-- ... -->
</div>
```

To add horizontal padding, use the `px-{size}` utilities:

```html
<div class="container mx-auto px-4">
  <!-- ... -->
</div>
```

To use a container at only a certain breakpoint and up:

```html
<!-- Full-width fluid until the `lg` breakpoint, then lock to container -->
<div class="md:container md:mx-auto">
  <!-- ... -->
</div>
```

<Customizing>

#### Centering by default

```js windi.config.js
export default {
  theme: {
    container: {
      center: true,
    },
  },
}
```

#### Horizontal padding

```js windi.config.js
export default {
  theme: {
    container: {
      padding: '2rem',
    },
  },
}
```

Specify a different padding amount for each breakpoint

```js windi.config.js
export default {
  theme: {
    container: {
      padding: {
        'DEFAULT': '1rem',
        'sm': '2rem',
        'lg': '4rem',
        'xl': '5rem',
        '2xl': '6rem',
      },
    },
  },
}
```

</Customizing>
