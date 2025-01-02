# Box Decoration Break

Utilities for controlling how element fragments should be rendered across multiple lines, columns, or pages.

<PlaygroundWithVariants
  variant='slice'
  :variants="['slice', 'clone']"
  prefix='decoration'
  fixed='dark:text-white opacity-85 overflow-hidden p-2 h-full'
  nested=true
  appended='text-5xl font-extrabold bg-gradient-to-r from-green-400 to-blue-500 rounded-16px px-4 text-sm text-white'
  html="
&lt;div&gt;
  &lt;span class=&quot;{class} bg-gradient-to-r px-4 from-green-400 to-blue-500 text-sm text-white rounded-16px&quot;&gt;The&lt;br&gt;quick&lt;br&gt;brown fox&lt;br&gt;over the lazy dog&lt;/span&gt;
&lt;/div&gt;"
/>
