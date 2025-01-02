# Caret

## Caret Color

Utilities for controlling the color of insertion text.

<PlaygroundWithVariants
  variant='gray-500'
  type='color'
  prefix='caret'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='bg-gray-100 py-2 rounded px-4 w-full border border-gray-400'
  html="&lt;input class='{class} bg-gray-100 border border-gray-400 py-2 rounded px-4 w-full' placeholder='Focus Me'&gt;"
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    caretColor: {
      primary: '#3490dc',
      secondary: '#ffed4a',
      danger: '#e3342f',
    },
  },
}
```

</Customizing>

## Caret Opacity

Utilities for controlling the opacity of an element's caret color.

<PlaygroundWithVariants
  variant='50'
  type='opacity'
  prefix='caret-opacity'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='bg-gray-100 py-2 rounded px-4 w-full border border-gray-400 caret-blue-500'
  html="&lt;input class='caret-blue-500 {class} bg-gray-100 border border-gray-400 py-2 rounded px-4 w-full' placeholder='Focus Me'&gt;"
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      caretOpacity: {
        light: '0.1',
      },
    },
  },
}
```

</Customizing>
