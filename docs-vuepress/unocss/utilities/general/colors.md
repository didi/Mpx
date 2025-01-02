# Colors

<ColorsPalette />

## Customization

```ts windi.config.js
export default {
  theme: {
    colors: {
      // Configure your color palette here
    },
  },
}
```

### Reuse Colors

All the colors from the palette are enabled by default. If you want to set alias or reuse some colors from the palette, you can import them from `windicss/colors` module.

```ts windi.config.js
import colors from 'windicss/colors'

export default {
  theme: {
    extend: {
      colors: {
        grey: colors.gray,
      },
    },
  },
}
```
