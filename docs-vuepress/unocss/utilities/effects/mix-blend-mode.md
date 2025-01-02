# Mix Blend Mode

Utilities for controlling how an element should blend with the background.

<PlaygroundWithVariants
  variant='multiply'
  :variants="['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']"
  prefix='mix-blend'
  fixed='dark:text-white opacity-85 overflow-hidden h-full'
  appended='flex justify-center items-center bg-teal-300 bg-yellow-300 w-36 h-36 w-24 h-24 rounded-md'
  nested=true
  html='&lt;div class=&quot;flex justify-center&quot;&gt;
    &lt;div class=&quot;flex items-center justify-center rounded-md bg-teal-300 h-24 w-36&quot;&gt;
      &lt;div class=&quot;{class} rounded-md h-36 w-24 bg-yellow-300&quot;&gt;&lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;'
/>
