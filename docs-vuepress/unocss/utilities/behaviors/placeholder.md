# Placeholder

## Placeholder Color

Utilities for controlling the color of placeholder text.

<PlaygroundWithVariants
  variant='gray-500'
  type='color'
  prefix='placeholder'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='bg-gray-100 py-2 rounded px-4 w-full border border-gray-400'
  html="&lt;input class='{class} bg-gray-100 border border-gray-400 py-2 rounded px-4 w-full' placeholder='Placeholder'&gt;"
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    placeholderColor: {
      primary: '#3490dc',
      secondary: '#ffed4a',
      danger: '#e3342f',
    },
  },
}
```

</Customizing>

## Placeholder Opacity

Utilities for controlling the opacity of an element's placeholder color.

<PlaygroundWithVariants
  variant='50'
  type='opacity'
  prefix='placeholder-opacity'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='bg-gray-100 py-2 rounded px-4 w-full border border-gray-400 placeholder-black'
  html="&lt;input class='placeholder-black {class} bg-gray-100 border border-gray-400 py-2 rounded px-4 w-full' placeholder='Placeholder'&gt;"
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      placeholderOpacity: {
        light: '0.1',
      },
    },
  },
}
```

</Customizing>
