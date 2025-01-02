# Ring

## Ring Width

Utilities for creating outline rings with box-shadows.

<PlaygroundWithVariants
  variant=''
  :variants="['', 'inset', '0', '1', '2', '4', '6', '8']"
  prefix='ring'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  appended='focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 ring-blue-500'
  nested=true
  html='&lt;button tabindex=&quot;-1&quot; class=&quot;focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 {class} ring-blue-500&quot;&gt;
    Button
  &lt;/button&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      ringWidth: {
        DEFAULT: '2px',
        6: '6px',
        10: '10px',
      },
    },
  },
}
```

</Customizing>

## Ring Color

Utilities for setting the color of outline rings.

<PlaygroundWithVariants
  variant='gray-500'
  type='color'
  prefix='ring'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  appended='focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 ring-4'
  nested=true
  html='&lt;button tabindex=&quot;-1&quot; class=&quot;focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 ring-4 {class}&quot;&gt;
    Button
  &lt;/button&gt;'
/>

<Customizing>

```js windi.config.js
const colors = require('windicss/colors')

export default {
  theme: {
    ringColor: {
      white: colors.white,
      pink: colors.fuchsia,
    },
  },
}
```

</Customizing>

## Ring Opacity

Utilities for setting the opacity of outline rings.

<PlaygroundWithVariants
  variant='50'
  type='opacity'
  prefix='ring-opacity'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  appended='focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 ring-blue-500 ring-4'
  nested=true
  html='&lt;button tabindex=&quot;-1&quot; class=&quot;focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 ring-4 ring-blue-500 {class}&quot;&gt;
    Button
  &lt;/button&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      ringOpacity: {
        15: '0.15',
        35: '0.35',
        65: '0.65',
      },
    },
  },
}
```

</Customizing>

## Ring Offset Width

Utilities for simulating an offset when adding outline rings.

<PlaygroundWithVariants
  variant='2'
  :variants="['0', '1', '2', '4', '6', '8', '10', '12', '14', '16', '20']"
  prefix='ring-offset'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  appended='focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 ring ring-blue-500 ring-offset-green-400'
  nested=true
  html='&lt;button tabindex=&quot;-1&quot; class=&quot;focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 ring ring-blue-500 {class} ring-offset-green-400&quot;&gt;
    Button
  &lt;/button&gt;'
/>


<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      ringOffsetWidth: {
        3: '3px',
        6: '6px',
        10: '10px',
      },
    },
  },
}
```

</Customizing>

## Ring Offset Color

Utilities for setting the color of outline ring offsets.

<PlaygroundWithVariants
  variant='gray-500'
  type='color'
  prefix='ring-offset'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  appended='focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 ring ring-blue-500 ring-offset-4'
  nested=true
  html='&lt;button tabindex=&quot;-1&quot; class=&quot;focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 ring ring-blue-500 ring-offset-4 {class}&quot;&gt;
    Button
  &lt;/button&gt;'
/>

<Customizing>

```js windi.config.js
const colors = require('windicss/colors')

export default {
  theme: {
    ringOffsetColor: {
      white: colors.white,
      pink: colors.fuchsia,
    },
  },
}
```

</Customizing>
