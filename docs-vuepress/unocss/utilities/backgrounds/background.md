# Background

## Background Attachment

Utilities for controlling how a background image behaves when scrolling.

<PlaygroundWithVariants
  variant='fixed'
  :variants="['fixed', 'local', 'scroll']"
  prefix='bg'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden flex'
  nested=true
  appended='w-full h-full overflow-y-scroll bg-center bg-no-repeat'
  html='&lt;div class="{class} w-full h-full overflow-y-scroll bg-no-repeat bg-center" style="background-image:url(&#39;/assets/bg-blue.svg&#39;);"
&gt;&lt;p&gt;The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog.&lt;/p&gt;&lt;/div&gt;'
/>

## Background Clip

Utilities for controlling the bounding box of an element's background.

<PlaygroundWithVariants
  variant='border'
  :variants="['border', 'padding', 'content']"
  prefix='bg-clip'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='p-6 bg-cover rounded-md bg-blue-300 border-4 border-blue-400 border-dashed font-extrabold text-white flex justify-center items-center py-2'
  html="&lt;div class=&quot;{class} p-6 bg-cover rounded-md bg-blue-300 border-4 border-blue-400 border-dashed font-extrabold text-white flex justify-center items-center&quot;&gt;
      &lt;span class=&quot;py-2&quot;&gt;Hello World&lt;/span&gt;
    &lt;/div&gt;"
/>

<PlaygroundWithVariants
  variant='text'
  :variants="[]"
  prefix='bg-clip'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500'
  html="&lt;div class=&quot;text-5xl font-extrabold&quot;&gt;
  &lt;span class=&quot;bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500&quot;&gt;
    Hello world
  &lt;/span&gt;
&lt;/div&gt;"
/>

## Background Color

Utilities for controlling an element's background color.

<PlaygroundWithVariants
  variant='gray-500'
  type='color'
  prefix='bg'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='p-2 rounded-md'
  html="&lt;div class='{class} p-2 rounded-md'&gt;&lt;p&gt;The quick brown fox jumps over the lazy dog&lt;/p&gt;&lt;/div&gt;"
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    backgroundColor: theme => ({
      ...theme('colors'),
      primary: '#3490dc',
      secondary: '#ffed4a',
      danger: '#e3342f',
    }),
  },
}
```

</Customizing>

## Background Opacity

Utilities for controlling the opacity of an element's background color.

<PlaygroundWithVariants
  variant='50'
  type='opacity'
  prefix='bg-opacity'
  fixed='p-2 dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='p-2 rounded-md bg-blue-500'
  html="&lt;div class='bg-blue-500 {class} p-2 rounded-md'&gt;&lt;p&gt;The quick brown fox jumps over the lazy dog&lt;/p&gt;&lt;/div&gt;"
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      opacity: {
        light: '0.15',
      },
    },
  },
}
```

</Customizing>

## Background Position

Utilities for controlling the position of an element's background image.

<PlaygroundWithVariants
  variant='bottom'
  :variants="['bottom', 'center', 'left', 'left-bottom', 'left-top', 'right', 'right-bottom', 'right-top', 'top']"
  prefix='bg'
  fixed='dark:text-white opacity-85'
  nested=true
  appended='mx-auto bg-blue-300 rounded-md w-full bg-no-repeat'
  html='&lt;div class=&quot;mx-auto {class} bg-blue-300 rounded-md w-full bg-no-repeat&quot; style=&quot;background-image:url(&#39;/assets/bg-square.svg&#39;);aspect-ratio: 1 / 1;&quot;&gt;&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    backgroundPosition: {
      'bottom': 'bottom',
      'bottom-4': 'center bottom 1rem',
      'center': 'center',
      'left': 'left',
      'left-bottom': 'left bottom',
      'left-top': 'left top',
      'right': 'right',
      'right-bottom': 'right bottom',
      'right-top': 'right top',
      'top': 'top',
      'top-4': 'center top 1rem',
    },
  },
}
```

</Customizing>

## Background Repeat

Utilities for controlling the repetition of an element's background image.

<PlaygroundWithVariants
  variant='repeat'
  :variants="['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'repeat-round', 'repeat-space']"
  prefix='bg'
  fixed='h-full dark:text-white opacity-85'
  nested=true
  appended='mx-auto w-full bg-blue-300 rounded-md'
  html='&lt;div class=&quot;mx-auto w-full bg-blue-300 rounded-md {class}&quot; style=&quot;background-image:url(&#39;/assets/bg-square.svg&#39;);aspect-ratio: 1 / 1;&quot;&gt;
  &lt;/div&gt;'
/>

## Background Size

Utilities for controlling the background size of an element's background image.

<PlaygroundWithVariants
  variant='auto'
  :variants="['auto', 'cover', 'contain']"
  prefix='bg'
  fixed='dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='w-full h-full bg-no-repeat bg-center'
  html="&lt;div class=&quot;w-full h-full {class} bg-no-repeat bg-center&quot; style=&quot;background-image:url(&#39;/assets/bg-blue.svg&#39;);&quot;&gt;
  &lt;/div&gt;"
/>

<Customizing>

```js
export default {
  theme: {
    backgroundSize: {
      'auto': 'auto',
      'cover': 'cover',
      'contain': 'contain',
      '50%': '50%',
      '16': '4rem',
    },
  },
}
```

</Customizing>

## Background Origin

Utilities for controlling the background origin of an element's background image.

<PlaygroundWithVariants
  variant='border'
  :variants="['border', 'padding', 'content']"
  prefix='bg-origin'
  fixed='dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='p-6 rounded-md border-4 border-blue-400 border-dashed font-extrabold text-white flex justify-center items-center bg-no-repeat'
  html='&lt;div class="{class} bg-no-repeat p-6 rounded-md border-4 border-blue-400 border-dashed font-extrabold text-white flex justify-center items-center" style="background-image: url(/assets/bg-shop.jpg);"&gt;
      &lt;span&gt;Hello World&lt;/span&gt;
    &lt;/div&gt;'
/>
