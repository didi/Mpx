# Outline

Utilities for controlling an element's outline.

<PlaygroundWithVariants
  variant='gray-500'
  :variants="['none', 'white', 'black', 'gray-500', 'red-500', 'yellow-500', 'blue-500', 'green-500']"
  prefix='outline'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  appended='focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400'
  nested=true
  html='&lt;button tabindex=&quot;-1&quot; class=&quot;focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 {class}&quot;&gt;
    Button
  &lt;/button&gt;'
/>

## Outline Solid

<PlaygroundWithVariants
  variant='gray-500'
  :variants="['none', 'white', 'black', 'gray-500', 'red-500', 'yellow-500', 'blue-500', 'green-500']"
  prefix='outline-solid'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  appended='focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400'
  nested=true
  html='&lt;button tabindex=&quot;-1&quot; class=&quot;focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 {class}&quot;&gt;
    Button
  &lt;/button&gt;'
/>

## Outline Dotted

<PlaygroundWithVariants
  variant='gray-500'
  :variants="['none', 'white', 'black', 'gray-500', 'red-500', 'yellow-500', 'blue-500', 'green-500']"
  prefix='outline-dotted'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  appended='focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400'
  nested=true
  html='&lt;button tabindex=&quot;-1&quot; class=&quot;focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 {class}&quot;&gt;
    Button
  &lt;/button&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      outline: {
        blue: '2px solid #0000ff',
      },
    },
  },
}
```

You can also provide an outline-offset value for any custom outline utilities using a tuple of the form [outline, outlineOffset]:

```js windi.config.js
export default {
  theme: {
    extend: {
      outline: {
        blue: ['2px solid #0000ff', '1px'],
      },
    },
  },
}
```

</Customizing>
