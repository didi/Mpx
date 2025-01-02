# Image Rendering

The `image-render` utility defines how the browser should render an image if it is scaled up or down from its original
dimensions. By default, each browser will attempt to apply aliasing to this scaled image in order to prevent distortion,
but this can sometimes be a problem if we want the image to preserve its original pixelated form.

<PlaygroundWithVariants
  variant='pixel'
  :variants="['auto', 'pixel', 'edge']"
  prefix='image-render'
  fixed='p-2 dark:text-white opacity-85'
  appended='w-full h-32'
  nested=true
  html="&lt;img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAACdJREFUCB1j9Pf3/88ABMmMjCCKgQlMIhGMu3btAquY9mMDWBhDBQAutwfDrUlKzQAAAABJRU5ErkJggg==' class='{class} w-full h-32'&gt;"
/>
