# Flexbox

## Flex

Use `flex` to create a block-level flex container.

<PlaygroundWithVariants
  variant='flex'
  :variants="[]"
  nested=true
  fixed='pt-20'
  appended='rounded-md bg-teal-500 bg-teal-100 p-2 space-x-2 w-6 h-6'
  html='&lt;div class="{class} bg-teal-100 rounded-md p-2 space-x-2"&gt;
&lt;div class="rounded-md bg-teal-500 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 w-6 h-6"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

## Flex Basis

Utilities for controlling the initial size of flex items.

<PlaygroundWithVariants
  variant='8'
  :variants="[
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '16', '20', '24', '28', '32', '36', '40',
    '44', '48', '52', '56', '60', '64', '72', '80', '96', 'auto', 'px', '0.5', '1.5', '2.5', '3.5', '1/2', '1/3', '2/3',
    '1/4', '2/4', '3/4', '1/5', '2/5', '3/5', '4/5', '1/6', '2/6', '3/6', '4/6', '5/6', '1/12', '2/12', '3/12', '4/12',
    '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '11/12', 'full'
  ]"
  prefix="basis"
  nested=true
  fixed='pt-20'
  appended='rounded-md bg-teal-500 bg-teal-100 p-2 flex flex-row space-x-2 w-6 h-6'
  html='&lt;div class="bg-teal-100 rounded-md p-2 flex flex-row space-x-2"&gt;
&lt;div class="{class} rounded-md bg-teal-500 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="{class} rounded-md bg-teal-500 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="{class} rounded-md bg-teal-500 w-6 h-6"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

## Inline Flex

Use `inline-flex` to create an inline flex container.

<PlaygroundWithVariants
  variant='inline-flex'
  :variants="[]"
  fixed='pt-20'
  nested=true
  appended='rounded-md bg-teal-500 bg-teal-100 p-2 space-x-2 w-6 h-6'
  html='&lt;div class="{class} bg-teal-100 rounded-md p-2 space-x-2"&gt;
&lt;div class="rounded-md bg-teal-500 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 w-6 h-6"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

## Flex Direction

Utilities for controlling the direction of flex items.

<PlaygroundWithVariants
  variant='row'
  :variants="['row', 'row-reverse', 'col', 'col-reverse']"
  prefix='flex'
  nested=true
  fixed='pt-20'
  appended='flex items-center rounded-md bg-teal-500 bg-teal-100 w-6 h-6 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1'
  html='&lt;div class="flex items-center {class} bg-teal-100 rounded-md p-1"&gt;
&lt;div class="rounded-md bg-red-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-green-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-blue-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

## Flex Wrap

Utilities for controlling how flex items wrap.

<PlaygroundWithVariants
  variant='wrap'
  :variants="['wrap', 'wrap-reverse', 'nowrap']"
  prefix='flex'
  nested=true
  fixed='pt-20'
  appended='flex items-center rounded-md bg-teal-500 bg-teal-100 w-6 h-6 bg-red-400 bg-teal-400 bg-yellow-400 bg-green-400 bg-blue-400 bg-purple-400 m-1 p-1'
  html='&lt;div class="flex items-center {class} bg-teal-100 rounded-md p-1"&gt;
&lt;div class="rounded-md bg-red-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-yellow-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-green-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-teal-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-blue-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-purple-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

## Flex Stretch

Utilities for controlling how flex items both grow and shrink.

<PlaygroundWithVariants
  variant='1'
  :variants="['1', 'auto', 'initial', 'none']"
  prefix='flex'
  nested=true
  fixed='pt-20'
  appended='flex items-center rounded-md bg-teal-500 bg-teal-100 w-6 h-6 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1'
  html='&lt;div class="flex items-center bg-teal-100 rounded-md p-1"&gt;
&lt;div class="rounded-md bg-red-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="{class} rounded-md bg-green-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-blue-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    flex: {
      1: '1 1 0%',
      auto: '1 1 auto',
      initial: '0 1 auto',
      inherit: 'inherit',
      none: 'none',
      2: '2 2 0%',
    },
  },
}
```

</Customizing>

## Flex Grow

Utilities for controlling how flex items grow.

<PlaygroundWithVariants
  variant='grow-0'
  :variants="['grow-0', 'grow']"
  prefix='flex'
  nested=true
  fixed='pt-20'
  appended='flex items-center rounded-md bg-teal-500 bg-teal-100 w-6 h-6 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1'
  html='&lt;div class="flex items-center bg-teal-100 rounded-md p-1"&gt;
&lt;div class="rounded-md bg-red-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-green-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="{class} rounded-md bg-blue-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    flexGrow: {
      0: 0,
      DEFAULT: 2,
      1: 1,
    },
  },
}
```

</Customizing>

## Flex Shrink

Utilities for controlling how flex items shrink.

<PlaygroundWithVariants
  variant='shrink-0'
  :variants="['shrink-0', 'shrink']"
  prefix='flex'
  nested=true
  fixed='pt-20'
  appended='flex items-center flex-nowrap rounded-md bg-teal-500 bg-teal-100 w-6 h-6 bg-red-400 bg-teal-400 bg-yellow-400 bg-green-400 bg-blue-400 bg-purple-400 m-1 p-1'
  html='&lt;div class="flex items-center flex-nowrap bg-teal-100 rounded-md p-1"&gt;
&lt;div class="rounded-md bg-red-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-yellow-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-green-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-teal-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-blue-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="{class} rounded-md bg-purple-400 w-6 h-6 m-1"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    flexShrink: {
      0: 0,
      DEFAULT: 2,
      1: 1,
    },
  },
}
```

</Customizing>
