# Columns

## Columns

Utilities for controlling the number of columns within an element.

<PlaygroundWithVariants
  variant='8'
  :variants="[
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
  ]"
  prefix="columns"
  nested=true
  fixed='pt-20'
  appended='rounded-md bg-teal-500 bg-teal-100 p-2 flex flex-row space-x-2 aspect-square h-6'
  html='&lt;div class="{class} bg-teal-100 rounded-md p-2 flex flex-row space-x-2"&gt;
&lt;div class="rounded-md bg-teal-500 aspect-square h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 aspect-square h-6"&gt;&lt;/div&gt;
&lt;div class="rounded-md bg-teal-500 aspect-square h-6"&gt;&lt;/div&gt;
&lt;/div&gt;'
/>

## Break After

Utilities for controlling how a column or page should break after an element.

| Class                  | Properties               |
| :--------------------- | :----------------------- |
| break-after-auto       | break-after: auto;       |
| break-after-avoid      | break-after: avoid;      |
| break-after-all        | break-after: all;        |
| break-after-avoid-page | break-after: avoid-page; |
| break-after-page       | break-after: page;       |
| break-after-left       | break-after: left;       |
| break-after-right      | break-after: right;      |
| break-after-column     | break-after: column;     |

## Break Before

Utilities for controlling how a column or page should break before an element.

| Class                   | Properties                |
| :---------------------- | :------------------------ |
| break-before-auto       | break-before: auto;       |
| break-before-avoid      | break-before: avoid;      |
| break-before-all        | break-before: all;        |
| break-before-avoid-page | break-before: avoid-page; |
| break-before-page       | break-before: page;       |
| break-before-left       | break-before: left;       |
| break-before-right      | break-before: right;      |
| break-before-column     | break-before: column;     |

## Break Inside

Utilities for controlling how a column or page should break within an element.

| Class                     | Properties                  |
| :------------------------ | :-------------------------- |
| break-inside-auto         | break-inside: auto;         |
| break-inside-avoid        | break-inside: avoid;        |
| break-inside-avoid-page   | break-inside: avoid-page;   |
| break-inside-avoid-column | break-inside: avoid-column; |
