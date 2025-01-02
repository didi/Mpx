# Spacing

## Padding

Utilities for controlling an element's padding.

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', '0.5', '1', '2', '4', '8', '10', '12', '14', '16', '20', '24', '48', '1.5rem', '32px']"
  prefix='p'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-500 bg-teal-100 flex-shrink-0 w-8 h-8 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 {class} flex-shrink-0"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    padding: {
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '48px',
    },
  },
}
```

</Customizing>

## Padding Y

Utilities for controlling an element's vertical padding.

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', '0.5', '1', '2', '4', '8', '10', '12', '14', '16', '20', '24', '48', '1.5rem', '32px']"
  prefix='py'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-500 flex-shrink-0 bg-teal-100 w-8 h-8 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 {class} flex-shrink-0"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

## Padding X

Utilities for controlling an element's horizontal padding.

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', '0.5', '1', '2', '4', '8', '10', '12', '14', '16', '20', '24', '48', '1.5rem', '32px']"
  prefix='px'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-500 flex-shrink-0 bg-teal-100 w-8 h-8 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 {class} flex-shrink-0"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

## Padding Top

Utilities for controlling an element's top padding.

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', '0.5', '1', '2', '4', '8', '10', '12', '14', '16', '20', '24', '48', '1.5rem', '32px']"
  prefix='pt'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded flex-shrink-0 bg-teal-500 bg-teal-100 w-8 h-8 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 {class} flex-shrink-0"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

## Padding Left

Utilities for controlling an element's left padding.

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', '0.5', '1', '2', '4', '8', '10', '12', '14', '16', '20', '24', '48', '1.5rem', '32px']"
  prefix='pl'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded flex-shrink-0 bg-teal-500 bg-teal-100 w-8 h-8 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 flex-shrink-0 {class}"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

## Padding Bottom

Utilities for controlling an element's bottom padding.

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', '0.5', '1', '2', '4', '8', '10', '12', '14', '16', '20', '24', '48', '1.5rem', '32px']"
  prefix='pb'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center flex-shrink-0 rounded bg-teal-500 bg-teal-100 w-8 h-8 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 flex-shrink-0 {class}"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

## Padding Right

Utilities for controlling an element's right padding.

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', '0.5', '1', '2', '4', '8', '10', '12', '14', '16', '20', '24', '48', '1.5rem', '32px']"
  prefix='pr'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center flex-shrink-0 rounded bg-teal-500 bg-teal-100 w-8 h-8 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded flex-shrink-0 bg-green-400 {class}"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

## Margin

Utilities for controlling an element's margin.

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', 'auto', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-14', '-16', '-20', '-24', '-48', '-1.5rem', '-32px']"
  prefix='m'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-100 bg-green-400 p-2 flex-shrink-0'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 {class} p-2 flex-shrink-0"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    margin: {
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '48px',
    },
  },
}
```

</Customizing>

## Margin Y

Utilities for controlling an element's vertical margin.

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', 'auto', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-14', '-16', '-20', '-24', '-48', '-1.5rem', '-32px']"
  prefix='my'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-100 bg-green-400 p-2 flex-shrink-0'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 {class} p-2 flex-shrink-0"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

## Margin X

Utilities for controlling an element's horizontal margin.

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', 'auto', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-14', '-16', '-20', '-24', '-48', '-1.5rem', '-32px']"
  prefix='mx'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-100 bg-green-400 p-2 flex-shrink-0'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 flex-shrink-0 {class} p-2"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

## Margin Top

Utilities for controlling an element's top margin.

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', 'auto', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-14', '-16', '-20', '-24', '-48', '-1.5rem', '-32px']"
  prefix='mt'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-100 bg-green-400 p-2 flex-shrink-0'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 flex-shrink-0 {class} p-2"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

## Margin Left

Utilities for controlling an element's left margin.

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', 'auto', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-14', '-16', '-20', '-24', '-48', '-1.5rem', '-32px']"
  prefix='ml'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-100 bg-green-400 p-2 flex-shrink-0'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 flex-shrink-0 {class} p-2"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

## Margin Bottom

Utilities for controlling an element's bottom margin.

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', 'auto', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-14', '-16', '-20', '-24', '-48', '-1.5rem', '-32px']"
  prefix='mb'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-100 bg-green-400 p-2 flex-shrink-0'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 flex-shrink-0 {class} p-2"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

## Margin Right

Utilities for controlling an element's right margin.

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', 'auto', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-14', '-16', '-20', '-24', '-48', '-1.5rem', '-32px']"
  prefix='mr'
  nested=true
  fixed='text-white text-xs'
  appended='inline-flex items-center rounded bg-teal-100 bg-green-400 p-2 flex-shrink-0'
  html='&lt;div class="inline-flex items-center bg-teal-100 rounded"&gt;
&lt;p class="rounded bg-green-400 {class} p-2 flex-shrink-0"&gt;{class}&lt;/p&gt;
&lt;/div&gt;'
/>

## Space Between Y

Utilities for controlling the space between vertical align child elements.

<PlaygroundWithVariants
  variant='2'
  :variants="['0', 'px', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-14', '-16', '-20', '-24', '-48', '-1.5rem', '-32px']"
  prefix='space-y'
  nested=true
  fixed='!block'
  appended='flex items-center flex-col rounded-md bg-teal-500 bg-teal-100 w-6 h-6 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1'
  html='&lt;div class="flex items-center flex-col {class} bg-teal-100 rounded-md p-1"&gt;
&lt;div class="rounded-md bg-red-400 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-green-400 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-blue-400 w-6 h-6"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    space: {
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '48px',
    },
  },
}
```

</Customizing>

## Space Between Y Reverse

If your elements are in reverse order (using say `flex-col-reverse`), use the `space-y-reverse` utilities to ensure the space is added to the correct side of each element.

<PlaygroundWithVariants
  variant='reverse'
  :variants="[]"
  prefix='space-y'
  nested=true
  fixed='!block'
  appended='flex items-center flex-col-reverse rounded-md bg-teal-500 bg-teal-100 w-6 h-6 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1 space-y-2 space-y-reverse'
  html='&lt;div class="flex items-center flex-col-reverse space-y-2 space-y-reverse bg-teal-100 rounded-md p-1"&gt;
&lt;div class="rounded-md bg-red-400 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-green-400 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-blue-400 w-6 h-6"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

## Space Between X

Utilities for controlling the space between horizontal align child elements.

<PlaygroundWithVariants
  variant='2'
  :variants="['0', 'px', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-14', '-16', '-20', '-24', '-48', '-1.5rem', '-32px']"
  prefix='space-x'
  nested=true
  fixed='!block'
  appended='flex items-center rounded-md bg-teal-500 bg-teal-100 w-6 h-6 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1'
  html='&lt;div class="flex items-center {class} bg-teal-100 rounded-md p-1"&gt;
&lt;div class="rounded-md bg-red-400 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-green-400 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-blue-400 w-6 h-6"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    space: {
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '48px',
    },
  },
}
```

</Customizing>

## Space Between X Reverse

If your elements are in reverse order (using say `flex-row-reverse`), use the `space-x-reverse` utilities to ensure the space is added to the correct side of each element.

<PlaygroundWithVariants
  variant='reverse'
  :variants="[]"
  prefix='space-x'
  nested=true
  fixed='!block'
  appended='flex items-center flex-row-reverse rounded-md bg-teal-500 bg-teal-100 w-6 h-6 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1 space-x-2 space-x-reverse'
  html='&lt;div class="flex items-center flex-row-reverse space-x-2 space-x-reverse bg-teal-100 rounded-md p-1"&gt;
&lt;div class="rounded-md bg-red-400 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-green-400 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-blue-400 w-6 h-6"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>
