# Overflow

Utilities for controlling how an element handles content that is too large for the container.

<PlaygroundWithVariants
  variant='auto'
  :variants="['auto', 'hidden', 'visible', 'scroll', 'x-auto', 'x-hidden', 'x-visible', 'x-scroll', 'y-auto', 'y-hidden', 'y-visible', 'y-scroll']"
  prefix='overflow'
  fixed='dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='bg-blue-100 dark:bg-blue-400 p-2 rounded-md text-xs'
  html='&lt;div class="bg-blue-100 dark:bg-blue-400 p-2 rounded-md text-xs {class}"&gt;
The value of Pi is
          3.1415926535897932384626433832795029. The value of e is
          2.7182818284590452353602874713526625.
        Michaelmas term lately over, and the Lord Chancellor sitting in Lincolns Inn Hall. Implacable November weather. As much mud in the streets as if the waters had but newly retired from the face of the earth.
&lt;/div&gt;'
/>
