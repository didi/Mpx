# Border

## Border Radius

Utilities for controlling the border radius of an element.

<PlaygroundWithBox
  variant='3xl'
  :variants="['none', 'sm', '', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '1/2', 'full']"
  prefix='rounded'
  fixed='bg-teal-500 w-full h-full text-transparent transition-all duration-300'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      DEFAULT: '4px',
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px',
      large: '12px',
    },
  },
}
```

</Customizing>

## Border Width

Utilities for controlling the width of an element's borders.

<PlaygroundWithBox
  mode='edges'
  variant=''
  :variants="['', '0', 1, 2, 3, 4, 5]"
  prefix='border'
  fixed='bg-gray-500 bg-opacity-5 border-teal-500 w-full h-full text-transparent transition-all'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    borderWidth: {
      DEFAULT: '1px',
      none: '0',
      sm: '2px',
    },
  },
}
```

</Customizing>

## Border Color

Utilities for controlling the color of an element's borders.

<PlaygroundWithVariants
  variant='gray-500'
  type='color'
  prefix='border'
  fixed='bg-gray-500 bg-opacity-5 border-3 border-teal-500 w-full h-full text-transparent transition-all'
/>

<Customizing>

You can customize your color palette by editing the `theme.colors` section of your `windi.config.js` file, or customize just your border colors using the theme.borderColor section.

```js windi.config.js
export default {
  theme: {
    borderColor: theme => ({
      ...theme('colors'),
      DEFAULT: theme('colors.gray.300', 'currentColor'),
      primary: '#3490dc',
      secondary: '#ffed4a',
      danger: '#e3342f',
    }),
  },
}
```

</Customizing>

## Border Opacity

Utilities for controlling the opacity of an element's border color.

<PlaygroundWithVariants
  variant='50'
  type='opacity'
  prefix='border-opacity'
  fixed='bg-gray-500 bg-opacity-5 border-3 border-teal-500 w-full h-full text-transparent transition-all'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    extend: {
      borderOpacity: {
        light: '0.1',
      },
    },
  },
}
```

</Customizing>

## Border Style

Utilities for controlling the style of an element's borders.

<PlaygroundWithVariants
  variant='solid'
  :variants="['solid', 'dashed', 'dotted', 'double', 'none']"
  prefix='border'
  fixed='bg-gray-500 bg-opacity-5 border-3 border-teal-500 w-full h-full text-transparent transition-all'
/>
