# Gradients

Utilities for controlling background gradients.

## Gradient Direction

<PlaygroundWithVariants
  variant='gradient-to-r'
  :variants="['none', 'gradient-to-t', 'gradient-to-tr', 'gradient-to-r', 'gradient-to-br', 'gradient-to-b', 'gradient-to-bl', 'gradient-to-l', 'gradient-to-tl']"
  prefix='bg'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='h-full w-full rounded-md from-green-400 to-blue-500'
  html="&lt;div class=&quot;h-full w-full rounded-md {class} from-green-400 to-blue-500&quot;&gt;&lt;/div&gt;"
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      backgroundImage: theme => ({
        'hero-pattern': 'url(\'/img/hero-pattern.svg\')',
        'footer-texture': 'url(\'/img/footer-texture.png\')',
      }),
    },
  },
}
```

</Customizing>

## Gradient From

<PlaygroundWithVariants
  variant='green-500'
  type='color'
  prefix='from'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='h-full w-full rounded-md bg-gradient-to-r to-blue-500'
  html="&lt;div class=&quot;h-full w-full rounded-md bg-gradient-to-r {class} to-blue-500&quot;&gt;&lt;/div&gt;"
/>

## Gradient Via

<PlaygroundWithVariants
  variant='gray-500'
  type='color'
  prefix='via'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='h-full w-full rounded-md bg-gradient-to-r from-red-500 to-blue-500'
  html="&lt;div class=&quot;h-full w-full rounded-md bg-gradient-to-r from-red-500 {class} to-blue-500&quot;&gt;&lt;/div&gt;"
/>

## Gradient To

<PlaygroundWithVariants
  variant='yellow-500'
  type='color'
  prefix='to'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='h-full w-full rounded-md bg-gradient-to-r from-green-500'
  html="&lt;div class=&quot;h-full w-full rounded-md bg-gradient-to-r from-green-500 {class}&quot;&gt;&lt;/div&gt;"
/>
