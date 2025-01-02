# Sizing

## Width

Utilities for setting the width of an element

<PlaygroundWithVariants
  variant='auto'
  :variants="['auto', 'px', 'full', 'screen', 'min', 'max', 'prose', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'screen-sm', 'screen-md', 'screen-lg', 'screen-xl', 'screen-2xl',
    '0', '1', '1.5', '2', '4', '8', '10', '12', '14', '18', '20', '24', '1/2', '1/3', '3/5', '11/12', '4rem', '60px']"
  prefix='w'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-500 bg-teal-100 flex-shrink-0 h-auto bg-green-400 m-1 p-2'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 {class} h-auto flex-shrink-0 p-2"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      width: {
        half: '50%',
      },
    },
  },
}
```

</Customizing>

## Min-Width

Utilities for setting the minimum width of an element

<PlaygroundWithVariants
  variant='none'
  :variants="['none', 'px', 'full', 'screen', 'min', 'max', 'prose', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'screen-sm', 'screen-md', 'screen-lg', 'screen-xl', 'screen-2xl',
    '0', '1', '1.5', '2', '4', '8', '10', '12', '14', '18', '20', '24', '1/2', '1/3', '3/5', '11/12', '4rem', '60px']"
  prefix='min-w'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-500 bg-teal-100 flex-shrink-0 h-auto bg-green-400 m-1 p-2'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 {class} h-auto flex-shrink-0 p-2"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    minWidth: {
      half: '50%',
      full: '100%',
    },
  },
}
```

</Customizing>

## Max-Width

Utilities for setting the maximum width of an element

<PlaygroundWithVariants
  variant='none'
  :variants="['none', 'px', 'full', 'screen', 'min', 'max', 'prose', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'screen-sm', 'screen-md', 'screen-lg', 'screen-xl', 'screen-2xl',
    '0', '1', '1.5', '2', '4', '8', '10', '12', '14', '18', '20', '24', '1/2', '1/3', '3/5', '11/12', '4rem', '60px']"
  prefix='max-w'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-500 bg-teal-100 flex-shrink-0 h-auto bg-green-400 m-1 p-2'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 {class} h-auto flex-shrink-0 p-2"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    maxWidth: {
      '1/4': '25%',
      '1/2': '50%',
      '3/4': '75%',
    },
  },
}
```

</Customizing>

## Height

Utilities for setting the height of an element

<PlaygroundWithVariants
  variant='auto'
  :variants="['auto', 'px', 'full', 'screen', 'min', 'max', 'prose', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'screen-sm', 'screen-md', 'screen-lg', 'screen-xl', 'screen-2xl',
    '0', '1', '1.5', '2', '4', '8', '10', '12', '14', '18', '20', '24', '1/2', '1/3', '3/5', '11/12', '4rem', '60px']"
  prefix='h'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-500 bg-teal-100 flex-shrink-0 w-auto bg-green-400 m-1 p-2'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 {class} w-auto flex-shrink-0 p-2"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    height: {
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '48px',
    },
  },
}
```

</Customizing>

## Min-Height

Utilities for setting the minimum height of an element

<PlaygroundWithVariants
  variant='none'
  :variants="['none', 'px', 'full', 'screen', 'min', 'max', 'prose', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'screen-sm', 'screen-md', 'screen-lg', 'screen-xl', 'screen-2xl',
    '0', '1', '1.5', '2', '4', '8', '10', '12', '14', '18', '20', '24', '1/2', '1/3', '3/5', '11/12', '4rem', '60px']"
  prefix='min-h'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-500 bg-teal-100 flex-shrink-0 w-auto bg-green-400 m-1 p-2'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 {class} w-auto flex-shrink-0 p-2"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    minHeight: {
      '0': '0',
      '1/4': '25%',
      '1/2': '50%',
      '3/4': '75%',
      'full': '100%',
    },
  },
}
```

</Customizing>

## Max-Height

Utilities for setting the maximum height of an element

<PlaygroundWithVariants
  variant='none'
  :variants="['none', 'px', 'full', 'screen', 'min', 'max', 'prose', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'screen-sm', 'screen-md', 'screen-lg', 'screen-xl', 'screen-2xl',
    '0', '1', '1.5', '2', '4', '8', '10', '12', '14', '18', '20', '24', '1/2', '1/3', '3/5', '11/12', '4rem', '60px']"
  prefix='max-h'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-500 bg-teal-100 flex-shrink-0 w-auto bg-green-400 m-1 p-2'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 {class} w-auto flex-shrink-0 p-2"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    maxHeight: {
      '0': '0',
      '1/4': '25%',
      '1/2': '50%',
      '3/4': '75%',
      'full': '100%',
    },
  },
}
```

</Customizing>

## Box Sizing

Utilities for controlling how the browser should calculate an element's total size.

- Use `box-border` to tell the browser to **include the element's borders and padding when you give it a height or width**. This means a **100px × 100px** element with a **2px border and 4px of padding** on all sides will be rendered as **100px × 100px**, with an internal content area of 88px × 88px. Windi makes this the default for all elements in our preflight base styles.

- Use `box-content` to tell the browser to **add borders and padding on top of the element's specified width or height**. This means a 100px × 100px element with a **2px border and 4px of padding** on all sides will actually be rendered as **112px × 112px**, with an internal content area of 100px × 100px.

<PlaygroundWithVariants
  variant='border'
  :variants="['border', 'content']"
  prefix='box'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-500 bg-teal-100 flex-shrink-0 w-full h-32 bg-green-400 text-center flex flex-col justify-center m-1 p-2'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;div class="rounded bg-green-400 {class} w-full h-32 flex-shrink-0 p-2 text-center flex flex-col justify-center"&gt;w-full x h-32&lt;/div&gt;
&lt;/div&gt;'
/>
