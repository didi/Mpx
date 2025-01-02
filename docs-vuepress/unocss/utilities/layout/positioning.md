# Positioning

## Order

Utilities for controlling the order of flex and grid items.

<PlaygroundWithVariants
  variant='5'
  :variants="['first', 'last', 'none', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10', '-11', '-12', '-13', '-14', '-6666']"
  prefix='order'
  nested=true
  fixed='!block'
  appended='order-1 order-2 order-3 order-4 order-5 order-6 order-7 order-8 order-9 order-10 order-11 rounded-md grid bg-teal-500 bg-yellow-400 bg-teal-100 p-2 w-6 h-6 gap-2 grid-cols-3 text-xs text-white text-center flex flex-col justify-center'
  html='&lt;div class="grid gap-2 grid-cols-3 bg-teal-100 rounded-md p-2 text-xs text-white text-center"&gt;
&lt;div class="order-1 rounded-md bg-teal-500 w-6 h-6 flex flex-col justify-center"&gt;1&lt;/div&gt;
&lt;div class="order-2 rounded-md bg-teal-500 w-6 h-6 flex flex-col justify-center"&gt;2&lt;/div&gt;
&lt;div class="order-3 rounded-md bg-teal-500 w-6 h-6 flex flex-col justify-center"&gt;3&lt;/div&gt;
&lt;div class="order-4 rounded-md bg-teal-500 w-6 h-6 flex flex-col justify-center"&gt;4&lt;/div&gt;
&lt;div class="order-5 {class} rounded-md bg-yellow-400 w-6 h-6 flex flex-col justify-center"&gt;5&lt;/div&gt;
&lt;div class="order-5 rounded-md bg-teal-500 w-6 h-6 flex flex-col justify-center"&gt;6&lt;/div&gt;
&lt;div class="order-6 rounded-md bg-teal-500 w-6 h-6 flex flex-col justify-center"&gt;7&lt;/div&gt;
&lt;div class="order-7 rounded-md bg-teal-500 w-6 h-6 flex flex-col justify-center"&gt;8&lt;/div&gt;
&lt;div class="order-8 rounded-md bg-teal-500 w-6 h-6 flex flex-col justify-center"&gt;9&lt;/div&gt;
&lt;div class="order-9 rounded-md bg-teal-500 w-6 h-6 flex flex-col justify-center"&gt;10&lt;/div&gt;
&lt;div class="order-10 rounded-md bg-teal-500 w-6 h-6 flex flex-col justify-center"&gt;11&lt;/div&gt;
&lt;div class="order-11 rounded-md bg-teal-500 w-6 h-6 flex flex-col justify-center"&gt;12&lt;/div&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    order: {
      first: '-9999',
      last: '9999',
      none: '0',
      normal: '0',
    },
  },
}
```

</Customizing>

## Justify Content

Utilities for controlling how flex and grid items are positioned along a container's main axis.

<PlaygroundWithVariants
  variant='start'
  :variants="['start', 'end', 'center', 'between', 'around', 'evenly']"
  prefix='justify'
  nested=true
  fixed='pt-20'
  appended='flex rounded-md bg-teal-500 bg-teal-100 p-2 space-x-2 w-6 h-6'
  html='&lt;div class="flex {class} bg-teal-100 rounded-md p-2 space-x-2"&gt;
&lt;div class="rounded-md bg-teal-500 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 w-6 h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 w-6 h-6"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

## Justify Items

Utilities for controlling how grid items are aligned along their inline axis.

<PlaygroundWithVariants
  variant='auto'
  :variants="['auto', 'start', 'end', 'center', 'stretch']"
  prefix='justify-items'
  nested=true
  fixed='!block'
  appended='grid rounded-md bg-teal-500 bg-teal-100 p-2 min-w-6 h-6 gap-2 grid-cols-2 text-xs text-white text-center flex flex-col justify-center'
  html='&lt;div class="grid {class} gap-2 grid-cols-2 bg-teal-100 rounded-md p-2 text-xs text-white text-center"&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;1&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;2&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;3&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;4&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;5&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;6&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;7&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;8&lt;/div&gt;
&lt;/div&gt;'
/>

## Justify Self

Utilities for controlling how an individual grid item is aligned along its inline axis.

<PlaygroundWithVariants
  variant='auto'
  :variants="['auto', 'start', 'end', 'center', 'stretch']"
  prefix='justify-self'
  nested=true
  fixed='!block'
  appended='grid rounded-md bg-teal-500 bg-yellow-400 bg-teal-100 p-2 min-w-6 h-6 gap-2 grid-cols-2 text-xs text-white text-center flex flex-col justify-center'
  html='&lt;div class="grid gap-2 grid-cols-2 bg-teal-100 rounded-md p-2 text-xs text-white text-center"&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;1&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;2&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;3&lt;/div&gt;
&lt;div class="{class} bg-yellow-400 rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;4&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;5&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;6&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;7&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;8&lt;/div&gt;
&lt;/div&gt;'
/>

## Align Content

Utilities for controlling how rows are positioned in multi-row flex and grid containers.

<PlaygroundWithVariants
  variant='center'
  :variants="['center', 'start', 'end', 'between', 'around', 'evenly']"
  prefix='content'
  nested=true
  fixed='!block'
  appended='grid rounded-md bg-teal-500 bg-teal-100 p-2 min-w-6 h-6 gap-2 grid-cols-2 text-xs text-white text-center flex flex-col justify-center h-48'
  html='&lt;div class="grid {class} gap-2 grid-cols-2 bg-teal-100 rounded-md p-2 text-xs text-white text-center h-48"&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;1&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;2&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;3&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;4&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;5&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;6&lt;/div&gt;
&lt;/div&gt;'
/>

## Align Items

Utilities for controlling how flex and grid items are positioned along a container's cross axis.

<PlaygroundWithVariants
  variant='start'
  :variants="['start', 'end', 'center', 'baseline', 'stretch']"
  prefix='items'
  nested=true
  fixed='pt-10'
  appended='flex justify-center rounded-md bg-teal-500 bg-teal-100 p-2 space-x-2 w-6 min-h-6 h-32'
  html='&lt;div class="flex {class} justify-center bg-teal-100 rounded-md p-2 space-x-2 h-32"&gt;
&lt;div class="rounded-md bg-teal-500 w-6 min-h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 w-6 min-h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 w-6 min-h-6"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

## Align Self

Utilities for controlling how an individual flex or grid item is positioned along its container's cross axis.

<PlaygroundWithVariants
  variant='center'
  :variants="['auto', 'start', 'end', 'center', 'stretch']"
  prefix='self'
  nested=true
  fixed='pt-10'
  appended='flex justify-center rounded-md bg-teal-500 bg-yellow-400 bg-teal-100 p-2 space-x-2 w-6 min-h-6 h-32'
  html='&lt;div class="flex justify-center bg-teal-100 rounded-md p-2 space-x-2 h-32"&gt;
&lt;div class="rounded-md bg-teal-500 w-6 min-h-6"&gt;&lt;/div&gt;
&lt;div class="{class} rounded-md bg-yellow-400 w-6 min-h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 w-6 min-h-6"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

## Place Content

Utilities for controlling how content is justified and aligned at the same time.

<PlaygroundWithVariants
  variant='center'
  :variants="['center', 'start', 'end', 'between', 'around', 'evenly', 'stretch']"
  prefix='place-content'
  nested=true
  fixed='!block'
  appended='grid rounded-md bg-teal-500 bg-teal-100 p-2 h-6 gap-2 grid-cols-2 text-xs text-white text-center flex flex-col justify-center h-38'
  html='&lt;div class="grid {class} gap-2 grid-cols-2 bg-teal-100 rounded-md p-2 text-xs text-white text-center h-38"&gt;
&lt;div class="rounded-md bg-teal-500 h-6 flex flex-col justify-center"&gt;1&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 h-6 flex flex-col justify-center"&gt;2&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 h-6 flex flex-col justify-center"&gt;3&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 h-6 flex flex-col justify-center"&gt;4&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 h-6 flex flex-col justify-center"&gt;5&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 h-6 flex flex-col justify-center"&gt;6&lt;/div&gt;
&lt;/div&gt;'
/>

## Place Items

Utilities for controlling how items are justified and aligned at the same time.

<PlaygroundWithVariants
  variant='auto'
  :variants="['auto', 'start', 'end', 'center', 'stretch']"
  prefix='place-items'
  nested=true
  fixed='!block'
  appended='grid rounded-md bg-teal-500 bg-teal-100 p-2 min-w-6 h-6 gap-2 grid-cols-2 text-xs text-white text-center flex flex-col justify-center h-38'
  html='&lt;div class="grid {class} gap-2 grid-cols-2 bg-teal-100 rounded-md p-2 text-xs text-white text-center h-38"&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;1&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;2&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;3&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;4&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;5&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;6&lt;/div&gt;
&lt;/div&gt;'
/>

## Place Self

Utilities for controlling how an individual item is justified and aligned at the same time.

<PlaygroundWithVariants
  variant='auto'
  :variants="['auto', 'start', 'end', 'center', 'stretch']"
  prefix='place-self'
  nested=true
  fixed='!block'
  appended='grid rounded-md bg-teal-500 bg-yellow-400 bg-teal-100 p-2 min-w-6 h-6 gap-2 grid-cols-2 text-xs text-white text-center flex flex-col justify-center h-38'
  html='&lt;div class="grid gap-2 grid-cols-2 bg-teal-100 rounded-md p-2 text-xs text-white text-center h-38"&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;1&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;2&lt;/div&gt;
&lt;div class="{class} rounded-md bg-yellow-400 min-w-6 h-6 flex flex-col justify-center"&gt;3&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;4&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;5&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 min-w-6 h-6 flex flex-col justify-center"&gt;6&lt;/div&gt;
&lt;/div&gt;'
/>

## Position

Utilities for controlling how an element is positioned in the DOM.

<PlaygroundWithVariants
  variant='static'
  :variants="['static', 'fixed', 'absolute', 'relative', 'sticky']"
  nested=true
  fixed='relative text-xs'
  appended='rounded-md clear-both bg-teal-500 bg-teal-100 w-8 h-8 mr-2 bg-red-400 bg-green-400 bg-blue-400 inline-block top-0 left-0'
  html='&lt;p&gt;In this demo you can control the &lt;code&gt;position&lt;/code&gt; property for the green box.&lt;/p&gt;
&lt;div class="inline-block rounded-md w-8 h-8 bg-red-400 mr-2"&gt;&lt;/div&gt;
&lt;div class="inline-block {class} top-0 left-0 rounded-md bg-green-400 w-8 h-8 mr-2"&gt;&lt;/div&gt;
&lt;div class="inline-block rounded-md w-8 h-8 bg-blue-400"&gt;&lt;/div&gt;
&lt;p class="clear-both"&gt;To see the effect of &lt;code&gt;sticky&lt;/code&gt; positioning, select the &lt;code&gt;position: sticky&lt;/code&gt; option and scroll this container.&lt;/p&gt;
&lt;p&gt;The element will scroll along with its container, until it is at the top of the container (or reaches the offset specified in &lt;code&gt;top&lt;/code&gt;), and will then stop scrolling, so it stays visible.&lt;/p&gt;
&lt;p&gt;The rest of this text is only supplied to make sure the container overflows, so as to enable you to scroll it and see the effect.&lt;/p&gt;
&lt;hr&gt;
&lt;p&gt;Far out in the uncharted backwaters of the unfashionable end of the western spiral arm of the Galaxy lies a small unregarded yellow sun. Orbiting this at a distance of roughly ninety-two million miles is an utterly insignificant little blue green planet whose ape-descended life forms are so amazingly primitive that they still think digital watches are a pretty neat idea.&lt;/p&gt; '
/>

## Top / Right / Bottom / Left

Utilities for controlling the placement of positioned elements.

### Inset

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', 'auto', 'full', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1/3', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-1/3', '-1.5rem', '-32px', '-full']"
  prefix='inset'
  nested=true
  fixed='relative text-xs text-white w-screen h-full'
  appended='absolute h-8 bg-green-400 rounded-md text-center max-w-24 p-2'
  html='&lt;div class="absolute {class} bg-green-400 rounded-md p-2 text-center max-w-24 h-8"&gt;{class}&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    inset: {
      sm: '1rem',
      lg: '4rem',
    },
  },
}
```

</Customizing>

### Inset Y

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', 'auto', 'full', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1/3', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-1/3', '-1.5rem', '-32px', '-full']"
  prefix='inset-y'
  nested=true
  fixed='relative text-xs text-white w-screen h-full'
  appended='absolute h-8 bg-green-400 rounded-md text-center max-w-24 p-2'
  html='&lt;div class="absolute {class} bg-green-400 rounded-md p-2 text-center max-w-24 h-8"&gt;{class}&lt;/div&gt;'
/>

### Inset X

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', 'auto', 'full', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1/3', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-1/3', '-1.5rem', '-32px', '-full']"
  prefix='inset-x'
  nested=true
  fixed='relative text-xs text-white w-screen h-full'
  appended='absolute h-8 bg-green-400 rounded-md text-center max-w-24 p-2'
  html='&lt;div class="absolute {class} bg-green-400 rounded-md p-2 text-center max-w-24 h-8"&gt;{class}&lt;/div&gt;'
/>

### Top

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', 'auto', 'full', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1/3', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-1/3', '-1.5rem', '-32px', '-full']"
  prefix='top'
  nested=true
  fixed='relative text-xs text-white w-screen h-full'
  appended='absolute h-8 bg-green-400 rounded-md text-center max-w-24 p-2'
  html='&lt;div class="absolute {class} bg-green-400 rounded-md p-2 text-center max-w-24 h-8"&gt;{class}&lt;/div&gt;'
/>

### Right

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', 'auto', 'full', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1/3', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-1/3', '-1.5rem', '-32px', '-full']"
  prefix='right'
  nested=true
  fixed='relative text-xs text-white w-screen h-full'
  appended='absolute h-8 bg-green-400 rounded-md text-center max-w-24 p-2'
  html='&lt;div class="absolute {class} bg-green-400 rounded-md p-2 text-center max-w-24 h-8"&gt;{class}&lt;/div&gt;'
/>

### Bottom

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', 'auto', 'full', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1/3', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-1/3', '-1.5rem', '-32px', '-full']"
  prefix='bottom'
  nested=true
  fixed='relative text-xs text-white w-screen h-full'
  appended='absolute h-8 bg-green-400 rounded-md text-center max-w-24 p-2'
  html='&lt;div class="absolute {class} bg-green-400 rounded-md p-2 text-center max-w-24 h-8"&gt;{class}&lt;/div&gt;'
/>

### Left

<PlaygroundWithVariants
  variant='4'
  :variants="['0', 'px', 'auto', 'full', '0.5', '1', '2', '4', '8', '12', '14', '16', '20', '24', '48', '1/3', '1.5rem', '32px', '-px', '-0.5', '-2', '-4', '-8', '-12', '-1/3', '-1.5rem', '-32px', '-full']"
  prefix='left'
  nested=true
  fixed='relative text-xs text-white'
  appended='absolute h-8 bg-green-400 rounded-md text-center max-w-24 p-2'
  html='&lt;div class="absolute {class} bg-green-400 rounded-md p-2 text-center max-w-24 h-8"&gt;{class}&lt;/div&gt;'
/>

## Floats

Utilities for controlling the wrapping of content around an element.

<PlaygroundWithVariants
  variant='left'
  :variants="['right', 'left', 'none']"
  prefix='float'
  nested=true
  fixed='text-xs'
  appended='bg-blue-300 rounded-md p-3 text-white'
  html='&lt;div class="{class} bg-blue-300 rounded-md p-3 text-white"&gt;Float me&lt;/div&gt;
As much mud in the streets as if the waters had but newly retired from the face of the earth, and it would not be wonderful to meet a Megalosaurus, forty feet long or so, waddling like an elephantine lizard up Holborn Hill.'
/>

## Clear

Utilities for controlling the wrapping of content around an element.

<PlaygroundWithVariants
  variant='left'
  :variants="['right', 'left', 'both', 'none']"
  prefix='clear'
  nested=true
  fixed='text-xs'
  appended='bg-blue-300 rounded-md p-3 text-white float-left float-right h-24'
  html='&lt;div class="float-left bg-blue-300 rounded-md p-3 text-white"&gt;Left&lt;/div&gt;
  &lt;div class="float-right bg-blue-300 rounded-md p-3 text-white h-24"&gt;Right&lt;/div&gt;
&lt;div class="{class}"&gt;
As much mud in the streets as if the waters had but newly retired from the face of the earth, and it would not be wonderful to meet a Megalosaurus, forty feet long or so, waddling like an elephantine lizard up Holborn Hill.
&lt;/div&gt;'
/>

## Isolation

Utilities for controlling whether an element should explicitly create a new stacking context. These utilities are especially helpful when used in conjunction with [mix-blend-mode](/utilities/effects/mix-blend-mode) and [z-index](#z-index).

<PlaygroundWithVariants
  variant='isolate'
  :variants="['isolate', 'isolation-auto']"
  fixed='dark:text-white opacity-85 overflow-hidden h-full'
  appended='w-full h-32 bg-green-400 w-16 h-16 mix-blend-difference border-2 border-black'
  nested=true
  html='&lt;div class="w-full h-32 bg-green-400"&gt;
  &lt;div class="{class}"&gt;
    &lt;div class="bg-green-400 w-16 h-16 mix-blend-difference border-2 border-black"&gt;auto&lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;'
/>

## Object Fit

Utilities for controlling how a replaced element's content should be resized.

<PlaygroundWithVariants
  variant='cover'
  :variants="['contain', 'cover', 'fill', 'none', 'scale-down']"
  prefix='object'
  appended='p-2 w-36 h-42 bg-gray-100'
  nested=true
  html='&lt;img src="/assets/bg-shop.jpg" class="{class} w-36 h-42 bg-gray-100"&gt;
  &lt;/img&gt;'
/>

## Object Position

Utilities for controlling how a replaced element's content should be positioned within its container.

<PlaygroundWithVariants
  variant='bottom'
  :variants="['bottom', 'center', 'left', 'left-bottom', 'left-top', 'right', 'right-bottom', 'right-top', 'top']"
  prefix='object'
  appended='object-none w-36 h-42'
  nested=true
  html='&lt;img src="/assets/bg-shop.jpg" class="{class} w-36 h-42 object-none"&gt;
  &lt;/img&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    objectPosition: {
      'bottom': 'bottom',
      'center': 'center',
      'left': 'left',
      'left-bottom': 'left bottom',
      'left-top': 'left top',
      'right': 'right',
      'right-bottom': 'right bottom',
      'right-top': 'right top',
      'top': 'top',
      'center-bottom': 'center bottom',
      'center-top': 'center top',
    },
  },
}
```

</Customizing>

## Z-Index

Utilities for controlling the stack order of an element.

<PlaygroundWithVariants
  variant='auto'
  :variants="['auto', '0', '1', '2', '3', '4', '5', '10', '20', '30', '40', '50', '60', '-1', '-2', '-3', '-5']"
  fixed='relative text-xs text-white text-center'
  prefix='z'
  appended='z-50 flex flex-col justify-center absolute bg-opacity-80 rounded shadow w-8 h-8 w-36 h-36 bg-green-400 bg-blue-400 bg-red-400  z-30 z-10 z-auto top-0 left-0 top-4 left-4 top-8 top-16 top-20 top-24 left-8 ring'
  nested=true
  html='&lt;div class="flex flex-col justify-center ring rounded shadow-lg bg-opacity-80 absolute {class} w-36 h-36 bg-green-400 top-0 left-0"&gt;Change my z-index&lt;/div&gt;
  &lt;div class="ring rounded shadow-lg bg-opacity-80 absolute w-8 h-8 z-50 top-0 left-0 bg-blue-400"&gt;z-50&lt;/div&gt;
  &lt;div class="ring rounded shadow-lg bg-opacity-80 absolute w-8 h-8 z-30 top-4 left-4 bg-blue-400"&gt;z-30&lt;/div&gt;
  &lt;div class="ring rounded shadow-lg bg-opacity-80 absolute w-8 h-8 z-10 top-8 left-8 bg-blue-400"&gt;z-10&lt;/div&gt;
  &lt;div class="ring rounded shadow-lg bg-opacity-80 absolute w-8 h-8 z-auto top-16 left-0 bg-red-400"&gt;z-auto&lt;/div&gt;
  &lt;div class="ring rounded shadow-lg bg-opacity-80 absolute w-8 h-8 z-auto top-20 left-4 bg-red-400"&gt;z-auto&lt;/div&gt;
  &lt;div class="ring rounded shadow-lg bg-opacity-80 absolute w-8 h-8 z-auto top-24 left-8 bg-red-400"&gt;z-auto&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    zIndex: {
      first: 10,
      second: 20,
    },
  },
}
```

</Customizing>
