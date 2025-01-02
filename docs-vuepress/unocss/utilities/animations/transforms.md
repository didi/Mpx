# Transforms

## Transform Type

Utilities for controlling transform behavior.

<PlaygroundWithVariants
  variant=''
  :variants="['', 'gpu', 'none']"
  prefix='transform'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='!rotate-180 w-24 h-24'
  html='&lt;img src="/assets/logo.svg" class="w-24 h-24 {class} !rotate-180"&gt;'
/>

## Transform Style

The transform-style utility sets whether children of an element are positioned in the 3D space or are flattened in the plane of the element.

<PlaygroundWithVariants
  variant='3d'
  :variants="['flat', '3d']"
  prefix='preserve'
  fixed='pl-6 pt-6'
  nested=true
  appended='w-full h-32 text-white text-4xl text-center w-full h-full backface-visible perspect-650 perspect-origin-[150%_150%] absolute flex items-center justify-center w-24 h-24 transform translate-z-12 rotate-y-180 rotate-y-90 -rotate-y-90 rotate-x-90 -rotate-x-90 bg-opacity-30 bg-opacity-70 bg-black bg-green-500 bg-red-500 bg-blue-500 bg-yellow-500 bg-pink-500'
  html='&lt;div class="w-full h-32 text-white text-4xl text-center perspect-650 perspect-origin-[150%_150%]"&gt;
  &lt;div class="w-full h-full backface-visible {class}"&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-black bg-opacity-30 transform translate-z-12"&gt;1&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-green-500 bg-opacity-70 transform rotate-y-180 translate-z-12"&gt;2&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-red-500 bg-opacity-70 transform rotate-y-90 translate-z-12"&gt;3&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-blue-500 bg-opacity-70 transform -rotate-y-90 translate-z-12"&gt;4&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-yellow-500 bg-opacity-70 transform rotate-x-90 translate-z-12"&gt;5&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-pink-500 bg-opacity-70 transform -rotate-x-90 translate-z-12"&gt;6&lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;'
/>

## Transform Origin

Utilities for specifying the origin for an element's transformations.

<PlaygroundWithVariants
  variant='center'
  :variants="['center', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left']"
  prefix='origin'
  fixed='p-2 dark:text-white opacity-85 w-full h-full'
  nested=true
  appended='mx-auto transform rotate-90 w-16 h-16 bg-teal-300 rounded-full'
  html='&lt;div class="mx-auto w-16 h-16 bg-teal-300 rounded-full"&gt;
      &lt;img class="h-16 w-16 {class} transform rotate-90" src="/assets/logo.svg"&gt;
    &lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      transformOrigin: {
        24: '6rem',
        full: '100%',
      },
    },
  },
}
```

</Customizing>

## Transform Rotate

Utilities for rotating elements with transform.

<PlaygroundWithVariants
  variant='90'
  :variants="['0', '6', '12', '45', '72.5', '90', '180', '-180', '-90', '-72.5', '-45', '-12', '-6']"
  prefix='rotate'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='w-24 h-24 transform'
  html='&lt;img src="/assets/logo.svg" class="w-24 h-24 transform {class}"&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    rotate: {
      sq: '90deg',
    },
  },
}
```

</Customizing>

### Rotate X

<PlaygroundWithVariants
  variant='30'
  :variants="['0', '6', '12', '30', '45', '72.5', '90', '180', '-180', '-90', '-72.5', '-45', '-12', '-6']"
  prefix='rotate-x'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='w-24 h-24 transform'
  html='&lt;img src="/assets/logo.svg" class="w-24 h-24 transform {class}"&gt;'
/>

### Rotate Y

<PlaygroundWithVariants
  variant='45'
  :variants="['0', '6', '12', '30', '45', '72.5', '90', '180', '-180', '-90', '-72.5', '-45', '-12', '-6']"
  prefix='rotate-y'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='w-24 h-24 transform'
  html='&lt;img src="/assets/logo.svg" class="w-24 h-24 transform {class}"&gt;'
/>

### Rotate Z

<PlaygroundWithVariants
  variant='12'
  :variants="['0', '6', '12', '30', '45', '72.5', '90', '180', '-180', '-90', '-72.5', '-45', '-12', '-6']"
  prefix='rotate-z'
  fixed='pl-6 pt-6'
  nested=true
  appended='w-full h-32 text-white text-4xl text-center w-full h-full backface-visible preserve-3d perspect-650 perspect-origin-[150%_150%] absolute flex items-center justify-center w-24 h-24 transform translate-z-12 rotate-y-180 rotate-y-90 -rotate-y-90 rotate-x-90 -rotate-x-90 bg-opacity-30 bg-opacity-70 bg-black bg-green-500 bg-red-500 bg-blue-500 bg-yellow-500 bg-pink-500'
  html='&lt;div class="w-full h-32 text-white text-4xl text-center perspect-650 perspect-origin-[150%_150%]"&gt;
  &lt;div class="w-full h-full backface-visible preserve-3d transform {class}"&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-black bg-opacity-30 transform translate-z-12"&gt;1&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-green-500 bg-opacity-70 transform rotate-y-180 translate-z-12"&gt;2&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-red-500 bg-opacity-70 transform rotate-y-90 translate-z-12"&gt;3&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-blue-500 bg-opacity-70 transform -rotate-y-90 translate-z-12"&gt;4&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-yellow-500 bg-opacity-70 transform rotate-x-90 translate-z-12"&gt;5&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-pink-500 bg-opacity-70 transform -rotate-x-90 translate-z-12"&gt;6&lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;'
/>

## Transform Scale

Utilities for scaling elements with transform.

<PlaygroundWithVariants
  variant='90'
  :variants="['0', '25', '50', '75', '90', '95', '100', '105', '110', '125', '150']"
  prefix='scale'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='w-24 h-24 transform'
  html='&lt;img src="/assets/logo.svg" class="w-24 h-24 transform {class}"&gt;'
/>

### Scale X

<PlaygroundWithVariants
  variant='90'
  :variants="['0', '25', '50', '75', '90', '95', '100', '105', '110', '125', '150']"
  prefix='scale-x'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='w-24 h-24 transform'
  html='&lt;img src="/assets/logo.svg" class="w-24 h-24 transform {class}"&gt;'
/>

### Scale Y

<PlaygroundWithVariants
  variant='90'
  :variants="['0', '25', '50', '75', '90', '95', '100', '105', '110', '125', '150']"
  prefix='scale-y'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='w-24 h-24 transform'
  html='&lt;img src="/assets/logo.svg" class="w-24 h-24 transform {class}"&gt;'
/>

### Scale Z

<PlaygroundWithVariants
  variant='90'
  :variants="['0', '25', '50', '75', '90', '95', '100', '105', '110', '125', '150']"
  prefix='scale-z'
  fixed='pl-6 pt-6'
  nested=true
  appended='w-full h-32 text-white text-4xl text-center w-full h-full backface-visible preserve-3d perspect-650 perspect-origin-[150%_150%] absolute flex items-center justify-center w-24 h-24 transform translate-z-12 rotate-y-180 rotate-y-90 -rotate-y-90 rotate-x-90 -rotate-x-90 bg-opacity-30 bg-opacity-70 bg-black bg-green-500 bg-red-500 bg-blue-500 bg-yellow-500 bg-pink-500'
  html='&lt;div class="w-full h-32 text-white text-4xl text-center perspect-650 perspect-origin-[150%_150%]"&gt;
  &lt;div class="w-full h-full backface-visible preserve-3d transform {class}"&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-black bg-opacity-30 transform translate-z-12"&gt;1&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-green-500 bg-opacity-70 transform rotate-y-180 translate-z-12"&gt;2&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-red-500 bg-opacity-70 transform rotate-y-90 translate-z-12"&gt;3&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-blue-500 bg-opacity-70 transform -rotate-y-90 translate-z-12"&gt;4&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-yellow-500 bg-opacity-70 transform rotate-x-90 translate-z-12"&gt;5&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-pink-500 bg-opacity-70 transform -rotate-x-90 translate-z-12"&gt;6&lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    scale: {
      half: '.5',
      full: '1',
    },
  },
}
```

</Customizing>

## Transform Skew

Utilities for skewing elements with transform.

### Skew X

<PlaygroundWithVariants
  variant='45'
  :variants="['0', '6', '12', '45', '72.5', '90', '180', '-180', '-90', '-72.5', '-45', '-12', '-6']"
  prefix='skew-x'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='w-24 h-24 transform'
  html='&lt;img src="/assets/logo.svg" class="w-24 h-24 transform {class}"&gt;'
/>

### Skew Y

<PlaygroundWithVariants
  variant='45'
  :variants="['0', '6', '12', '45', '72.5', '90', '180', '-180', '-90', '-72.5', '-45', '-12', '-6']"
  prefix='skew-y'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='w-24 h-24 transform'
  html='&lt;img src="/assets/logo.svg" class="w-24 h-24 transform {class}"&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      skew: {
        sq: '90deg',
      },
    },
  },
}
```

</Customizing>

## Transform Translate

Utilities for translating elements with transform.

### Translate X

<PlaygroundWithVariants
  variant='0'
  :variants="['0', 'px', 'full', '6', '12', '7.5', '1/2', '2/3', '3/4', '3/5', '3.5rem', '42px', '6em', '-px', '-full', '-6', '-12', '-7.5', '-1/2', '-2/3', '-3/4', '-3/5', '-3.5rem', '-42px']"
  prefix='translate-x'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='w-24 h-24 transform'
  html='&lt;img src="/assets/logo.svg" class="w-24 h-24 transform {class}"&gt;'
/>

### Translate Y

<PlaygroundWithVariants
  variant='0'
  :variants="['0', 'px', 'full', '6', '12', '7.5', '1/2', '2/3', '3/4', '3/5', '3.5rem', '42px', '6em', '-px', '-full', '-6', '-12', '-7.5', '-1/2', '-2/3', '-3/4', '-3/5', '-3.5rem', '-42px']"
  prefix='translate-y'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='w-24 h-24 transform'
  html='&lt;img src="/assets/logo.svg" class="w-24 h-24 transform {class}"&gt;'
/>

### Translate Z

<PlaygroundWithVariants
  variant='0'
  :variants="['0', 'px', 'full', '6', '12', '7.5', '1/2', '2/3', '3/4', '3/5', '3.5rem', '42px', '6em', '-px', '-full', '-6', '-12', '-7.5', '-1/2', '-2/3', '-3/4', '-3/5', '-3.5rem', '-42px']"
  prefix='translate-z'
  fixed='pl-6 pt-6'
  nested=true
  appended='w-full h-32 text-white text-4xl text-center w-full h-full backface-visible preserve-3d perspect-650 perspect-origin-[150%_150%] absolute flex items-center justify-center w-24 h-24 transform translate-z-12 rotate-y-180 rotate-y-90 -rotate-y-90 rotate-x-90 -rotate-x-90 bg-opacity-30 bg-opacity-70 bg-black bg-green-500 bg-red-500 bg-blue-500 bg-yellow-500 bg-pink-500'
  html='&lt;div class="w-full h-32 text-white text-4xl text-center perspect-650 perspect-origin-[150%_150%]"&gt;
  &lt;div class="w-full h-full backface-visible preserve-3d transform {class}"&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-black bg-opacity-30 transform translate-z-12"&gt;1&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-green-500 bg-opacity-70 transform rotate-y-180 translate-z-12"&gt;2&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-red-500 bg-opacity-70 transform rotate-y-90 translate-z-12"&gt;3&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-blue-500 bg-opacity-70 transform -rotate-y-90 translate-z-12"&gt;4&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-yellow-500 bg-opacity-70 transform rotate-x-90 translate-z-12"&gt;5&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-pink-500 bg-opacity-70 transform -rotate-x-90 translate-z-12"&gt;6&lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;'
/>

<Customizing>

You can customize the global spacing scale in the theme.spacing or theme.extend.spacing sections of your windi.config.js file:

```js windi.config.js
export default {
  theme: {
    extend: {
      spacing: {
        72: '18rem',
        84: '21rem',
        96: '24rem',
      },
    },
  },
}
```

To customize the translate scale separately, use the theme.translate section of your windi.config.js file.

```js windi.config.js
export default {
  theme: {
    extend: {
      translate: {
        '1/7': '14.2857143%',
        '2/7': '28.5714286%',
        '3/7': '42.8571429%',
        '4/7': '57.1428571%',
        '5/7': '71.4285714%',
        '6/7': '85.7142857%',
      },
    },
  },
}
```

</Customizing>

## Perspective

The `perspect` utility determines the distance between the z=0 plane and the user in order to give a 3D-positioned element some perspective.

<PlaygroundWithVariants
  variant='lg'
  :variants="['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '100', '200', '300', '400', '500', '600', '700', '800px', '23rem']"
  prefix='perspect'
  fixed='pl-6 pt-6'
  nested=true
  appended='w-full h-32 text-white text-4xl text-center w-full h-full backface-visible preserve-3d perspect-650 perspect-origin-[150%_150%] absolute flex items-center justify-center w-24 h-24 transform translate-z-12 rotate-y-180 rotate-y-90 -rotate-y-90 rotate-x-90 -rotate-x-90 bg-opacity-30 bg-opacity-70 bg-black bg-green-500 bg-red-500 bg-blue-500 bg-yellow-500 bg-pink-500'
  html='&lt;div class="w-full h-32 text-white text-4xl text-center {class} perspect-origin-[150%_150%]"&gt;
  &lt;div class="w-full h-full backface-visible preserve-3d"&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-black bg-opacity-30 transform translate-z-12"&gt;1&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-green-500 bg-opacity-70 transform rotate-y-180 translate-z-12"&gt;2&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-red-500 bg-opacity-70 transform rotate-y-90 translate-z-12"&gt;3&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-blue-500 bg-opacity-70 transform -rotate-y-90 translate-z-12"&gt;4&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-yellow-500 bg-opacity-70 transform rotate-x-90 translate-z-12"&gt;5&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-pink-500 bg-opacity-70 transform -rotate-x-90 translate-z-12"&gt;6&lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      perspective: {
        '8xl': '96rem',
        '9xl': '128rem',
      },
    },
  },
}
```

</Customizing>


## Perspective Origin

The `perspect-origin` utility determines the position at which the viewer is looking. It is used as the vanishing point by the [perspect](#perspective) utility.

<PlaygroundWithVariants
   variant='center'
  :variants="['center', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left', '[150%]', '[-150%]', '[150%_150%]']"
  prefix='perspect-origin'
  fixed='pl-6 pt-6'
  nested=true
  appended='w-full h-32 text-white text-4xl text-center w-full h-full backface-visible preserve-3d perspect-650 absolute flex items-center justify-center w-24 h-24 transform translate-z-12 rotate-y-180 rotate-y-90 -rotate-y-90 rotate-x-90 -rotate-x-90 bg-opacity-30 bg-opacity-70 bg-black bg-green-500 bg-red-500 bg-blue-500 bg-yellow-500 bg-pink-500'
  html='&lt;div class="w-full h-32 text-white text-4xl text-center perspect-650 {class}"&gt;
  &lt;div class="w-full h-full backface-visible preserve-3d"&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-black bg-opacity-30 transform translate-z-12"&gt;1&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-green-500 bg-opacity-70 transform rotate-y-180 translate-z-12"&gt;2&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-red-500 bg-opacity-70 transform rotate-y-90 translate-z-12"&gt;3&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-blue-500 bg-opacity-70 transform -rotate-y-90 translate-z-12"&gt;4&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-yellow-500 bg-opacity-70 transform rotate-x-90 translate-z-12"&gt;5&lt;/div&gt;
    &lt;div class="absolute flex items-center justify-center w-24 h-24 bg-pink-500 bg-opacity-70 transform -rotate-x-90 translate-z-12"&gt;6&lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      perspectiveOrigin: {
        tb150: '150% 150%',
        tb200: '200% 200%',
      },
    },
  },
}
```

</Customizing>