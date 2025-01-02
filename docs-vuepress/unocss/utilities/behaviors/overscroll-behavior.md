# Overscroll Behavior

Utilities for controlling how the browser behaves when reaching the boundary of a scrolling area.

- Use `auto` to make it possible for the user to continue scrolling a parent scroll area when they reach the boundary of
  the primary scroll area.
- Use `none` to prevent scrolling in the target area from triggering scrolling in the parent element, and also prevent
  "bounce" effects when scrolling past the end of the container.
- Use `contain` to prevent scrolling in the target area from triggering scrolling in the parent element, but preserve
  "bounce" effects when scrolling past the end of the container in operating systems that support it.

<PlaygroundWithVariants
  variant='auto'
  :variants="['auto', 'none', 'contain', 'x-auto', 'x-none', 'x-contain', 'y-auto', 'y-none', 'y-contain']"
  prefix='overscroll'
  fixed='dark:text-white opacity-85 overflow-hidden'
  nested=true
  appended='bg-blue-100 dark:bg-blue-400 p-2 rounded-md text-xs overflow-auto'
  html='&lt;div class="bg-blue-100 dark:bg-blue-400 p-2 rounded-md text-xs overflow-auto {class}"&gt;
The value of Pi is
          3.1415926535897932384626433832795029. The value of e is
          2.7182818284590452353602874713526625.
        Michaelmas term lately over, and the Lord Chancellor sitting in Lincolns Inn Hall. Implacable November weather. As much mud in the streets as if the waters had but newly retired from the face of the earth.
&lt;/div&gt;'
/>