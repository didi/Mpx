# Animation

Utilities for animating elements with CSS animations.

<PlaygroundWithVariants
  variant='bounce'
  :variants="['none', 'spin', 'ping', 'pulse', 'bounce']"
  prefix='animate'
  fixed='p-2 dark:text-white opacity-85 h-full flex flex-col justify-center'
  nested=true
  appended='transition ease-in-out focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 ring-4 ring-blue-500 ring-opacity-50 cursor-pointer transform hover:scale-110 hover:-translate-y-1'
  html='&lt;button tabindex="-1"; class="transition {class} ease-in-out focus:outline-none w-full py-3 rounded font-bold text-white bg-blue-400 ring-4 ring-blue-500 ring-opacity-50 cursor-pointer transform hover:scale-110 hover:-translate-y-1"&gt;
    Click me
  &lt;/button&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
}
```

To add new animation @keyframes, use the keyframes section of your theme configuration:

```js windi.config.js
export default {
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
}
```

</Customizing>