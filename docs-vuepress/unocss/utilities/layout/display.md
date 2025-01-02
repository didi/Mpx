# Display

## Block

The `block` utility generates a block element box, generating line breaks both before and after the element when in the
normal flow.

<PlaygroundWithVariants
  variant='block'
  :variants="[]"
  nested=true
  fixed='space-y-2 pt-6 pl-12'
  appended='rounded-md bg-teal-500 bg-teal-100 w-8 h-8 bg-red-400 bg-green-400 bg-blue-400'
  html='
&lt;div class="{class} rounded-md bg-red-400 w-8 h-8"&gt;&lt;/div&gt;
&lt;div class="{class} rounded-md bg-green-400 w-8 h-8"&gt;&lt;/div&gt;
&lt;div class="{class} rounded-md bg-blue-400 w-8 h-8"&gt;&lt;/div&gt;'
/>

## Inline Block

The `inline-block` utility generates a block element box that will be flowed with surrounding content as if it were a
single inline box (behaving much like a replaced element would).

<PlaygroundWithVariants
  variant='inline-block'
  :variants="[]"
  nested=true
  fixed='space-x-1 pt-12 pl-4 text-xs'
  appended='rounded-md bg-teal-500 bg-teal-100 w-8 h-8 bg-red-400 bg-green-400 bg-blue-400 text-gray-500'
  html='
&lt;div class="{class} rounded-md bg-red-400 w-8 h-8"&gt;&lt;/div&gt;
&lt;div class="{class} rounded-md bg-green-400 w-8 h-8"&gt;&lt;/div&gt;
&lt;div class="{class} rounded-md bg-blue-400 w-8 h-8"&gt;&lt;/div&gt;
&lt;span class="text-gray-500"&gt;...&lt;/span&gt;'
/>

## Inline

The `inline` utility generates one or more inline element boxes that do not generate line breaks before or after
themselves. In normal flow, the next element will be on the same line if there is space.

<PlaygroundWithVariants
  variant='inline'
  :variants="['inline', 'inline-block']"
  nested=true
  fixed='space-x-1 pt-12 pl-2 text-xs text-white'
  appended='rounded-md bg-teal-500 bg-teal-100 py-2 px-3 bg-red-400 bg-green-400 bg-blue-400 text-gray-500'
  html='
&lt;div class="{class} rounded-md bg-red-400 py-2 px-3"&gt;1&lt;/div&gt;
&lt;div class="{class} rounded-md bg-green-400 py-2 px-3"&gt;2&lt;/div&gt;
&lt;div class="{class} rounded-md bg-blue-400 py-2 px-3"&gt;3&lt;/div&gt;
&lt;span class="text-gray-500"&gt;...&lt;/span&gt;'
/>

## Flow Root

The `flow-root` utility generates a block element box that establishes a new
[block formatting context](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Block_formatting_context), defining
where the formatting root lies.

| Class     | Properties          |
| :-------- | :------------------ |
| flow-root | display: flow-root; |

<PlaygroundWithVariants
  variant='flow-root'
  :variants="[]"
  nested=true
  fixed='space-y-2 pt-2'
  appended='rounded-md bg-teal-500 bg-teal-100 w-8 h-8 m-1 bg-red-400 bg-green-400 bg-blue-400 bg-teal-100'
  html='
&lt;div class="{class} bg-teal-100 rounded-md"&gt;
  &lt;div class="m-1 rounded-md bg-red-400 w-8 h-8"&gt;&lt;/div&gt;
&lt;/div&gt;
&lt;div class="{class} bg-teal-100 rounded-md"&gt;
  &lt;div class="m-1 rounded-md bg-green-400 w-8 h-8"&gt;&lt;/div&gt;
&lt;/div&gt;
&lt;div class="{class} bg-teal-100 rounded-md"&gt;
  &lt;div class="m-1 rounded-md bg-blue-400 w-8 h-8"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

## Contents

The `contents` utilities don't produce a specific box by themselves. They are replaced by their pseudo-box and their
child boxes.

<PlaygroundWithVariants
  variant='contents'
  :variants="['block', 'contents']"
  nested=true
  fixed='pt-10'
  appended='flex items-center rounded-md flex-1 bg-teal-500 bg-teal-100 h-6 bg-red-400 bg-yellow-400 bg-green-400 bg-blue-400 bg-indigo-100 w-10 m-1 p-1'
  html='&lt;div class="flex items-center bg-teal-100 rounded-md p-1"&gt;
&lt;div class="flex-1 rounded-md bg-red-400 h-6 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md w-10 bg-indigo-100 {class}"&gt;
  &lt;div class="flex-1 rounded-md bg-yellow-400 h-6 m-1"&gt;&lt;/div&gt;
  &lt;div class="flex-1 rounded-md bg-green-400 h-6 m-1"&gt;&lt;/div&gt;
&lt;/div&gt;
&lt;div class="flex-1 rounded-md bg-blue-400 h-6 m-1"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

## Hidden

Turns off the `display` of an element so that it has no effect on layout (the document is rendered as though the element
did not exist). All descendant elements also have their display turned off. To have an element take up the space that it
would normally take, but without actually rendering anything, use the [visibility](#visibility) property instead.

<PlaygroundWithVariants
  variant='hidden'
  :variants="['block', 'hidden']"
  nested=true
  fixed='pt-20'
  appended='flex items-center rounded-md bg-teal-500 bg-teal-100 w-8 h-8 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1'
  html='&lt;div class="flex items-center bg-teal-100 rounded-md p-1"&gt;
&lt;div class="rounded-md bg-red-400 w-8 h-8 m-1"&gt;&lt;/div&gt;
&lt;div class="{class} rounded-md bg-green-400 w-8 h-8 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-blue-400 w-8 h-8 m-1"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

## Visibility

Utilities for controlling the visibility of an element. The `visibility` CSS property shows or hides an element without
changing the layout of a document. The property can also hide rows or columns in a `<table>`.

<PlaygroundWithVariants
  variant='visible'
  :variants="['visible', 'invisible']"
  nested=true
  fixed='pt-20'
  appended='flex items-center rounded-md bg-teal-500 bg-teal-100 w-8 h-8 bg-red-400 bg-green-400 bg-blue-400 m-1 p-1'
  html='&lt;div class="flex items-center bg-teal-100 rounded-md p-1"&gt;
&lt;div class="rounded-md bg-red-400 w-8 h-8 m-1"&gt;&lt;/div&gt;
&lt;div class="{class} rounded-md bg-green-400 w-8 h-8 m-1"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-blue-400 w-8 h-8 m-1"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

## Backface Visibility

The `backface` utility sets whether the back face of an element is visible when turned towards the user.

<PlaygroundWithVariants
  variant='hidden'
  :variants="['visible', 'hidden']"
  prefix='backface'
  nested=true
  fixed='!block'
  appended='w-34 h-42 transform hover:rotate-y-180 rotate-y-180 relative preserve-3d transition-all duration-500 absolute z-1 z-2 rounded-lg'
  html='&lt;div class="transform hover:rotate-y-180 relative preserve-3d transition-all duration-500"&gt;
    &lt;img src="/assets/card-front.jpg" class="rounded-lg w-34 h-42 absolute {class} z-1" alt="Card Front" /&gt;
    &lt;img src="/assets/card-back.jpg" class="rounded-lg w-34 h-42 absolute {class} z-2 transform rotate-y-180" alt="Card Back" /&gt;
&lt;/div&gt;'
/>

## List Item

The `list-item` utility generates a `::marker` pseudo-element with the content specified by its
[list-style](/utilities/general/typography#list-style-type) properties (for example a bullet point) together with a
principal box of the specified type for its own contents.

<PlaygroundWithVariants
  variant='list-item'
  :variants="['block', 'list-item']"
  fixed='py-4 px-8 dark:text-white opacity-85'
  nested=true
  appended='list-decimal'
  html="&lt;div class='list-decimal'&gt;
  &lt;div class='{class}'&gt;One&lt;/div&gt;
  &lt;div class='{class}'&gt;Two&lt;/div&gt;
  &lt;div class='{class}'&gt;Three&lt;/div&gt;
&lt;/div&gt;"
/>