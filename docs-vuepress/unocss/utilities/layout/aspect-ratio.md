# Aspect Ratio

## Utilities

| Class                | Properties                                                                                                                                                                                                                               |
| :------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aspect-auto`        | aspect-ratio: auto;   |
| `aspect-square`      | aspect-ratio: 1 / 1;  |
| `aspect-video`       | aspect-ratio: 16 / 9; |
| `aspect-none`        | position: 'static';<br>paddingBottom: '0';<br>'> *': {<br>&emsp;position: 'static';<br>&emsp;height: 'auto';<br>&emsp;width: 'auto';<br>&emsp;top: 'auto';<br>&emsp;right: 'auto';<br>&emsp;bottom: 'auto';<br>&emsp;left: 'auto';<br>}  |
| `aspect-w-${float}`  | --tw-aspect-w: `${float};`                                                                                                                                                                                                               |
| `aspect-h-${float}`  | --tw-aspect-h: `${float};`                                                                                                                                                                                                               |
| `aspect-${fraction}` | position: 'relative';<br>paddingBottom: `${percent};`<br>'> *': {<br>&emsp;position: 'absolute';<br>&emsp;height: '100%';<br>&emsp;width: '100%';<br>&emsp;top: '0';<br>&emsp;right: '0';<br>&emsp;bottom: '0';<br>&emsp;left: '0';<br>} |

***

`aspect-w-${float}` will add the following base styles:

```css
.aspect-w-${float} {
  position: 'relative';
  padding-bottom: 'calc(var(--tw-aspect-h) / var(--tw-aspect-w) * 100%)';
}

.aspect-w-${float} > * {
  position: 'absolute';
  height: '100%';
  width: '100%';
  top: '0';
  right: '0';
  bottom: '0';
  left: '0';
}
```

## Usage

```js windi.config.js
export default {
  theme: {
    // ...
  },
  plugins: [
    require('windicss/plugin/aspect-ratio'),
    // ...
  ],
}
```
