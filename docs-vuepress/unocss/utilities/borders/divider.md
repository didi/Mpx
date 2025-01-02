# Divider

## Divider Width

Utilities for controlling the border width between elements.

#### Divide Y

<PlaygroundWithVariants
  variant=''
  :variants="['', 'reverse', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20']"
  prefix='divide-y'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  appended='w-full py-2 text-center divide-y divide-teal-500'
  nested=true
  html='&lt;div class=&quot;w-full divide-y divide-teal-500 {class}&quot;&gt;
  &lt;div class="text-center py-2"&gt;1&lt;/div&gt;
  &lt;div class="text-center py-2"&gt;2&lt;/div&gt;
  &lt;div class="text-center py-2"&gt;3&lt;/div&gt;
&lt;/div&gt;'
/>

#### Divide X

<PlaygroundWithVariants
  variant=''
  :variants="['', 'reverse', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20']"
  prefix='divide-x'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  appended='w-full px-4 text-center divide-x divide-teal-500 flex items-center'
  nested=true
  html='&lt;div class=&quot;w-full divide-x divide-teal-500 flex items-center {class}&quot;&gt;
  &lt;div class="text-center px-4"&gt;1&lt;/div&gt;
  &lt;div class="text-center px-4"&gt;2&lt;/div&gt;
  &lt;div class="text-center px-4"&gt;3&lt;/div&gt;
&lt;/div&gt;'
/>

<Customizing>

The divide width scale inherits its values from the `borderWidth` scale by default, so if you'd like to customize your values for both border width and divide width together, use the `theme.borderWidth` section of your `windi.config.js` file.

```js windi.config.js
export default {
  theme: {
    borderWidth: {
      DEFAULT: '1px',
      0: '0',
      2: '2px',
      3: '3px',
      4: '4px',
      6: '6px',
      8: '8px',
    },
  },
}
```

To customize only the divide width values, use the theme.divideWidth section of your windi.config.js file.

```js windi.config.js
export default {
  theme: {
    divideWidth: {
      DEFAULT: '1px',
      0: '0',
      2: '2px',
      3: '3px',
      4: '4px',
      6: '6px',
      8: '8px',
    },
  },
}
```

</Customizing>

## Divider Color

Utilities for controlling the border color between elements.

<PlaygroundWithVariants
  variant='gray-500'
  type='color'
  prefix='divide'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  appended='w-full py-2 text-center divide-y'
  nested=true
  html='&lt;div class=&quot;w-full divide-y {class}&quot;&gt;
  &lt;div class="text-center py-2"&gt;1&lt;/div&gt;
  &lt;div class="text-center py-2"&gt;2&lt;/div&gt;
  &lt;div class="text-center py-2"&gt;3&lt;/div&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    divideColor: theme => ({
      ...theme('borderColors'),
      primary: '#3490dc',
      secondary: '#ffed4a',
      danger: '#e3342f',
    }),
  },
}
```

</Customizing>

## Divider Opacity

Utilities for controlling the opacity borders between elements.

<PlaygroundWithVariants
  variant='50'
  type='opacity'
  prefix='divide-opacity'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  appended='w-full py-2 text-center divide-y divide-blue-500'
  nested=true
  html='&lt;div class=&quot;w-full divide-y divide-blue-500 {class}&quot;&gt;
  &lt;div class="text-center py-2"&gt;1&lt;/div&gt;
  &lt;div class="text-center py-2"&gt;2&lt;/div&gt;
  &lt;div class="text-center py-2"&gt;3&lt;/div&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      divideOpacity: {
        10: '0.1',
        20: '0.2',
        95: '0.95',
      },
    },
  },
}
```

</Customizing>

## Divider Style

Utilities for controlling the border style between elements.

<PlaygroundWithVariants
  variant='dashed'
  :variants="['solid', 'dashed', 'dotted', 'double', 'none']"
  prefix='divide'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  appended='w-full py-2 text-center divide-y divide-blue-500'
  nested=true
  html='&lt;div class=&quot;w-full divide-y divide-blue-500 {class}&quot;&gt;
  &lt;div class="text-center py-2"&gt;1&lt;/div&gt;
  &lt;div class="text-center py-2"&gt;2&lt;/div&gt;
  &lt;div class="text-center py-2"&gt;3&lt;/div&gt;
&lt;/div&gt;'
/>
