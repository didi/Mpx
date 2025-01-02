# Cursor

Utilities for controlling the cursor style when hovering over an element.

<PlaygroundWithVariants
  variant='pointer'
  :variants="['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed']"
  prefix='cursor'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  appended='focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 ring-blue-500 ring-4 ring-opacity-50'
  nested=true
  html='&lt;button tabindex=&quot;-1&quot; class=&quot;focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 ring-4 ring-blue-500 ring-opacity-50 {class}&quot;&gt;
    Hover me
  &lt;/button&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    cursor: {
      'auto': 'auto',
      'default': 'default',
      'pointer': 'pointer',
      'wait': 'wait',
      'text': 'text',
      'move': 'move',
      'not-allowed': 'not-allowed',
      'crosshair': 'crosshair',
      'zoom-in': 'zoom-in',
    },
  },
}
```

</Customizing>
