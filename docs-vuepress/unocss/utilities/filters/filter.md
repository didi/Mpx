# Filter

Utilities for enabling and disabling filters on an element.

<PlaygroundWithVariants
  variant=''
  :variants="['', 'none']"
  prefix='filter'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='!hue-rotate-30 w-24 h-24'
  html='&lt;img src="/assets/logo.png" class="w-24 h-24 {class} !hue-rotate-30"&gt;'
/>

## Filter Blur

<PlaygroundWithVariants
  variant='sm'
  :variants="['', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '0', '1', '2', '3', '9', '12', '24px', '2rem']"
  prefix='blur'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='filter w-24 h-24'
  html='&lt;img src="/assets/logo.png" class="w-24 h-24 filter {class}"&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    blur: {
      '4xl': '72px',
      '5xl': '96px',
      '6xl': '128px',
    },
  },
}
```

</Customizing>

## Filter Brightness

<PlaygroundWithVariants
  variant='100'
  :variants="['0', '50', '75', '90', '95', '100', '105', '110', '115', '125', '150', '175', '200', '251']"
  prefix='brightness'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='filter w-24 h-24'
  html='&lt;img src="/assets/logo.png" class="w-24 h-24 filter {class}"&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    brightness: {
      sm: '50',
      md: '100',
      lg: '150',
    },
  },
}
```

</Customizing>

## Filter Contrast

<PlaygroundWithVariants
  variant='100'
  :variants="['0', '50', '75', '90', '95', '100', '105', '110', '115', '125', '150', '175', '200', '251']"
  prefix='contrast'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='filter w-24 h-24'
  html='&lt;img src="/assets/logo.png" class="w-24 h-24 filter {class}"&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    contrast: {
      sm: '50',
      md: '100',
      lg: '150',
    },
  },
}
```

</Customizing>

## Filter Drop Shadow

<PlaygroundWithVariants
  variant='md'
  :variants="['', 'sm', 'md', 'lg', 'xl', '2xl', 'none']"
  prefix='drop-shadow'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='filter w-24 h-24'
  html='&lt;img src="/assets/logo.png" class="w-24 h-24 filter {class}"&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    dropShadow: {
      '3xl': 'drop-shadow(0 30px 30px rgba(0, 0, 0, 0.2))',
      '4xl': 'drop-shadow(0 40px 40px rgba(0, 0, 0, 0.3))',
    },
  },
}
```

</Customizing>

## Filter Grayscale

<PlaygroundWithVariants
  variant=''
  :variants="['', '0', '5', '10', '20', '25', '30', '40' ,'50', '60', '70', '75', '80', '90', '95', '100']"
  prefix='grayscale'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='filter w-24 h-24'
  html='&lt;img src="/assets/logo.png" class="w-24 h-24 filter {class}"&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    grayscale: {
      50: '0.5',
      80: '0.8',
    },
  },
}
```

</Customizing>

## Filter Hue Rotate

<PlaygroundWithVariants
  variant='45'
  :variants="['0', '15', '30', '45', '60', '90', '120', '180', '-120', '-90', '-60', '-45', '-30', '-15']"
  prefix='hue-rotate'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='w-24 h-24 filter'
  html='&lt;img src="/assets/logo.png" class="w-24 h-24 filter {class}"&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    hueRotate: {
      sm: '60',
      lg: '90',
      xl: '180',
    },
  },
}
```

</Customizing>

## Filter Invert

<PlaygroundWithVariants
  variant=''
  :variants="['', '0', '5', '10', '20', '25', '30', '40' ,'50', '60', '70', '75', '80', '90', '95', '100']"
  prefix='invert'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='filter w-24 h-24'
  html='&lt;img src="/assets/logo.png" class="w-24 h-24 filter {class}"&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    invert: {
      sm: '0.5',
      lg: '0.8',
    },
  },
}
```

</Customizing>

## Filter Saturate

<PlaygroundWithVariants
  variant='0'
  :variants="['', '0', '5', '10', '20', '25', '30', '40' ,'50', '60', '70', '75', '80', '90', '95', '100']"
  prefix='saturate'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='filter w-24 h-24'
  html='&lt;img src="/assets/logo.png" class="w-24 h-24 filter {class}"&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    saturate: {
      sm: '0.5',
      md: '1',
      lg: '1.5',
    },
  },
}
```

</Customizing>

## Filter Sepia

<PlaygroundWithVariants
  variant=''
  :variants="['', '0', '5', '10', '20', '25', '30', '40' ,'50', '60', '70', '75', '80', '90', '95', '100']"
  prefix='sepia'
  fixed='p-2 dark:text-white opacity-85'
  nested=true
  appended='filter w-24 h-24'
  html='&lt;img src="/assets/logo.png" class="w-24 h-24 filter {class}"&gt;'
/>

<Customizing>

```js windi.config.js
export default {
  theme: {
    sepia: {
      sm: '0.5',
      md: '0.8',
    },
  },
}
```

</Customizing>
