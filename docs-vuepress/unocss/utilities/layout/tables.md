# Tables

## Table

The `table` utility behaves like HTML `<table>` element. It defines a block-level box. Table element represents tabular data — that is, information presented in a two-dimensional table comprised of rows and columns of cells containing data.

<PlaygroundWithVariants
  variant='table'
  :variants='[]'
  fixed='dark:text-white opacity-85'
  nested=true
  appended='table-caption border-collapse text-center table-header-group table-row table-cell table-row-group table-footer-group text-xs border border-emerald-500 bg-emerald-200 p-1 py-2 text-emerald-600 font-medium font-bold'
  html='&lt;div class="{class} text-xs border-collapse"&gt;
    &lt;div class="table-caption text-center text-emerald-600 py-2 font-bold"&gt;Council budget&lt;/div&gt;
    &lt;div class="table-header-group bg-emerald-200"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium"&gt;Items&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium" scope="col"&gt;Expenditure&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-row-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Donuts&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;3,000&lt;/div&gt;
        &lt;/div&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Stationery&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;18,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-footer-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Totals&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;21,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;'
/>

## Inline Table

The `inline-table` utility does not have a direct mapping in HTML. It behaves like an HTML `<table>` element, but as an inline box, rather than a block-level box. Inside the table box is a block-level context.

<PlaygroundWithVariants
  variant='inline-table'
  :variants='[]'
  fixed='dark:text-white opacity-85'
  nested=true
  appended='table-caption border-collapse text-center table-header-group table-row table-cell table-row-group table-footer-group text-xs border border-emerald-500 bg-emerald-200 p-1 py-2 text-emerald-600 font-medium font-bold'
  html='&lt;div class="{class} text-xs border-collapse"&gt;
    &lt;div class="table-caption text-center text-emerald-600 py-2 font-bold"&gt;Council budget&lt;/div&gt;
    &lt;div class="table-header-group bg-emerald-200"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium"&gt;Items&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium" scope="col"&gt;Expenditure&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-row-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Donuts&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;3,000&lt;/div&gt;
        &lt;/div&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Stationery&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;18,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-footer-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Totals&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;21,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;'
/>

| inline-table | display: inline-table; |

## Table Caption

The `table-caption` utility behaves like `<caption>` HTML element. The HTML `<caption>` element specifies the caption (or title) of a table.

<PlaygroundWithVariants
  variant='table-caption'
  :variants='[]'
  fixed='dark:text-white opacity-85'
  nested=true
  appended='table border-collapse text-center table-header-group table-row table-cell table-row-group table-footer-group text-xs border border-emerald-500 bg-emerald-200 p-1 py-2 text-emerald-600 font-medium font-bold ring ring-amber-400'
  html='&lt;div class="table text-xs border-collapse"&gt;
    &lt;div class="{class} text-center text-emerald-600 py-2 font-bold ring ring-amber-400"&gt;Council budget&lt;/div&gt;
    &lt;div class="table-header-group bg-emerald-200"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium"&gt;Items&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium" scope="col"&gt;Expenditure&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-row-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Donuts&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;3,000&lt;/div&gt;
        &lt;/div&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Stationery&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;18,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-footer-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Totals&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;21,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;'
/>

## Table Cell

The `table-cell` utility behaves like `<td>` HTML element. The HTML `<td>` element defines a cell of a table that contains data. It participates in the table model.

<PlaygroundWithVariants
  variant='table-cell'
  :variants='[]'
  fixed='dark:text-white opacity-85'
  nested=true
  appended='table border-collapse table-caption text-center table-header-group table-row table-row-group table-footer-group text-xs border border-emerald-500 bg-emerald-200 p-1 py-2 text-emerald-600 font-medium font-bold ring ring-offset-2 ring-amber-400'
  html='&lt;div class="table text-xs border-collapse"&gt;
    &lt;div class="table-caption text-center text-emerald-600 py-2 font-bold"&gt;Council budget&lt;/div&gt;
    &lt;div class="table-header-group bg-emerald-200"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium"&gt;Items&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium" scope="col"&gt;Expenditure&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-row-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell ring ring-offset-2 ring-amber-400 border border-emerald-500 p-1 text-emerald-600"&gt;Donuts&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;3,000&lt;/div&gt;
        &lt;/div&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Stationery&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;18,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-footer-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Totals&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;21,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;'
/>

## Table Row

The `table-row` utility behaves like `<tr>` HTML element. The HTML `<tr>` element defines a row of cells in a table. The row's cells can then be established using a mix of `<td>` (data cell) and `<th>` (header cell) elements.

<PlaygroundWithVariants
  variant='table-row'
  :variants='[]'
  fixed='dark:text-white opacity-85'
  nested=true
  appended='table border-collapse text-center table-caption table-header-group table-row table-cell table-row-group table-footer-group text-xs border border-emerald-500 bg-emerald-200 p-1 py-2 text-emerald-600 font-medium font-bold ring ring-offset-2 ring-amber-400'
  html='&lt;div class="table text-xs border-collapse"&gt;
    &lt;div class="table-caption text-center text-emerald-600 py-2 font-bold"&gt;Council budget&lt;/div&gt;
    &lt;div class="table-header-group bg-emerald-200"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium"&gt;Items&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium" scope="col"&gt;Expenditure&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-row-group"&gt;
        &lt;div class="table-row ring ring-offset-2 ring-amber-400"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Donuts&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;3,000&lt;/div&gt;
        &lt;/div&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Stationery&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;18,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-footer-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Totals&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;21,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;'
/>

## Table Column

The `table-column` utility behaves like `<col>` HTML element. The HTML `<col>` element defines a column within a table and is used for defining common semantics on all common cells. It is generally found within a `<colgroup>` element.

<PlaygroundWithVariants
  variant='table-column'
  :variants='[]'
  fixed='dark:text-white opacity-85'
  nested=true
  appended='table text-center border-collapse table-caption table-column-group table-column table-row table-cell text-xs border border-emerald-500 bg-emerald-200 bg-teal-200 bg-yellow-200 bg-green-200 p-1 py-2 text-emerald-600 font-medium font-bold'
  html='&lt;div class="table border-collapse text-xs text-emerald-600"&gt;
    &lt;div class="table-caption text-center text-emerald-600 py-2 font-bold"&gt;Superheros&lt;/div&gt;
    &lt;div class="table-column-group"&gt;
        &lt;div class="table-column bg-emerald-200"&gt;&lt;/div&gt;
        &lt;div class="table-column bg-teal-200"&gt;&lt;/div&gt;
        &lt;div class="table-column bg-yellow-200"&gt;&lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-row"&gt;
        &lt;div class="table-cell p-1 border border-emerald-500 font-medium"&gt;Hero&lt;/div&gt;
        &lt;div class="table-cell p-1 border border-emerald-500"&gt;Batman&lt;/div&gt;
        &lt;div class="table-cell p-1 border border-emerald-500"&gt;Flash&lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-row"&gt;
        &lt;div class="table-cell p-1 border border-emerald-500 font-medium"&gt;Skill&lt;/div&gt;
        &lt;div class="table-cell p-1 border border-emerald-500"&gt;Smarts&lt;/div&gt;
        &lt;div class="table-cell p-1 border border-emerald-500"&gt;Speed&lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;'
/>

## Table Row Group

The `table-row-group` utility behaves like `<tbody>` HTML element. The HTML Table Body element (`<tbody>`) encapsulates a set of table rows (`<tr>` elements), indicating that they comprise the body of the table (`<table>`).

<PlaygroundWithVariants
  variant='table-row-group'
  :variants='[]'
  fixed='dark:text-white opacity-85'
  nested=true
  appended='table border-collapse text-center table-caption table-header-group table-row table-cell table-row-group table-footer-group text-xs border border-emerald-500 bg-emerald-200 p-1 py-2 text-emerald-600 font-medium font-bold ring ring-offset-2 ring-amber-400'
  html='&lt;div class="table text-xs text-emerald-600 border-collapse"&gt;
    &lt;div class="table-caption text-center py-2 font-bold"&gt;Council budget&lt;/div&gt;
    &lt;div class="table-header-group bg-emerald-200"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 font-medium"&gt;Items&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 font-medium" scope="col"&gt;Expenditure&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-row-group ring ring-offset-2 ring-amber-400"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1"&gt;Donuts&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1"&gt;3,000&lt;/div&gt;
        &lt;/div&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1"&gt;Stationery&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1"&gt;18,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-footer-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1"&gt;Totals&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1"&gt;21,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;'
/>

## Table Column Group

The `table-column-group` utility behaves like `<colgroup>` HTML element. The HTML `<colgroup>` element defines a group of columns within a table.

<PlaygroundWithVariants
  variant='table-column-group'
  :variants='[]'
  fixed='dark:text-white opacity-85'
  nested=true
  appended='table text-center table-caption border-collapse table-column-group table-column table-row table-cell text-xs border border-emerald-500 bg-emerald-200 bg-teal-200 bg-yellow-200 bg-green-200 p-1 py-2 text-emerald-600 font-medium font-bold'
  html='&lt;div class="table text-xs text-emerald-600 border-collapse"&gt;
    &lt;div class="table-caption text-center text-emerald-600 py-2 font-bold"&gt;Superheros&lt;/div&gt;
    &lt;div class="table-column-group"&gt;
        &lt;div class="table-column bg-emerald-200"&gt;&lt;/div&gt;
        &lt;div class="table-column bg-teal-200"&gt;&lt;/div&gt;
        &lt;div class="table-column bg-yellow-200"&gt;&lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-row"&gt;
        &lt;div class="table-cell p-1 border border-emerald-500 font-medium"&gt;Hero&lt;/div&gt;
        &lt;div class="table-cell p-1 border border-emerald-500"&gt;Batman&lt;/div&gt;
        &lt;div class="table-cell p-1 border border-emerald-500"&gt;Flash&lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-row"&gt;
        &lt;div class="table-cell p-1 border border-emerald-500 font-medium"&gt;Skill&lt;/div&gt;
        &lt;div class="table-cell p-1 border border-emerald-500"&gt;Smarts&lt;/div&gt;
        &lt;div class="table-cell p-1 border border-emerald-500"&gt;Speed&lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;'
/>

## Table Header Group

The `table-header-group` utility behaves like `<thead>` HTML element. The HTML `<thead>` element defines a set of rows defining the head of the columns of the table.

<PlaygroundWithVariants
  variant='table-header-group'
  :variants='[]'
  fixed='dark:text-white opacity-85'
  nested=true
  appended='table text-center table-caption border-collapse table-header-group table-row table-cell table-row-group table-footer-group text-xs border border-emerald-500 bg-emerald-200 p-1 py-2 text-emerald-600 font-medium font-bold ring ring-offset-2 ring-amber-400'
  html='&lt;div class="table text-xs border-collapse"&gt;
    &lt;div class="table-caption text-center text-emerald-600 py-2 font-bold"&gt;Council budget&lt;/div&gt;
    &lt;div class="table-header-group bg-emerald-200 ring ring-offset-2 ring-amber-400"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium"&gt;Items&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium" scope="col"&gt;Expenditure&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-row-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Donuts&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;3,000&lt;/div&gt;
        &lt;/div&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Stationery&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;18,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-footer-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Totals&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;21,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;'
/>

## Table Footer Group

The `table-footer-group` utility behaves like `<tfoot>` HTML element. The HTML `<tfoot>` element defines a set of rows summarizing the columns of the table.

<PlaygroundWithVariants
  variant='table-footer-group'
  :variants='[]'
  fixed='dark:text-white opacity-85'
  nested=true
  appended='table text-center table-caption border-collapse table-header-group table-row table-cell table-row-group table-footer-group text-xs border border-emerald-500 bg-emerald-200 p-1 py-2 text-emerald-600 font-medium font-bold ring ring-offset-2 ring-amber-400'
  html='&lt;div class="table text-xs border-collapse"&gt;
    &lt;div class="table-caption text-center text-emerald-600 py-2 font-bold"&gt;Council budget&lt;/div&gt;
    &lt;div class="table-header-group bg-emerald-200"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium"&gt;Items&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium" scope="col"&gt;Expenditure&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-row-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Donuts&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;3,000&lt;/div&gt;
        &lt;/div&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Stationery&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;18,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-footer-group ring ring-offset-2 ring-amber-400"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Totals&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;21,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;'
/>

## Table Layout

Utilities for controlling the table layout algorithm.

<PlaygroundWithVariants
  variant='auto'
  :variants="['auto', 'fixed']"
  prefix='table'
  fixed='dark:text-white opacity-85'
  nested=true
  appended='border-collapse text-center text-xs border border-emerald-500 bg-emerald-200 p-1 py-2 text-emerald-600 font-medium font-bold w-2/3'
  html='&lt;table class="{class} text-xs border-collapse w-2/3"&gt;
    &lt;caption class="text-center text-emerald-600 py-2 font-bold"&gt;Council budget&lt;/caption&gt;
    &lt;thead class="bg-emerald-200"&gt;
        &lt;tr&gt;
            &lt;th class="border border-emerald-500 p-1 text-emerald-600 font-medium"&gt;Items&lt;/th&gt;
            &lt;th class="border border-emerald-500 p-1 text-emerald-600 font-medium"&gt;Expenditure&lt;/th&gt;
        &lt;/tr&gt;
    &lt;/thead&gt;
    &lt;tbody&gt;
        &lt;tr&gt;
            &lt;td class="border border-emerald-500 p-1 text-emerald-600"&gt;Donuts&lt;/td&gt;
            &lt;td class="border border-emerald-500 p-1 text-emerald-600"&gt;3,000&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td class="border border-emerald-500 p-1 text-emerald-600"&gt;Stationery&lt;/td&gt;
            &lt;td class="border border-emerald-500 p-1 text-emerald-600"&gt;18,000&lt;/td&gt;
        &lt;/tr&gt;
    &lt;/tbody&gt;
    &lt;tfoot&gt;
        &lt;tr&gt;
            &lt;td class="border border-emerald-500 p-1 text-emerald-600"&gt;Totals&lt;/td&gt;
            &lt;td class="border border-emerald-500 p-1 text-emerald-600"&gt;21,000&lt;/td&gt;
        &lt;/tr&gt;
    &lt;/tfoot&gt;
&lt;/table&gt;'
/>

## Table Border Collapse

Utilities for controlling whether table borders should collapse or be separated.

<PlaygroundWithVariants
  variant='collapse'
  :variants="['collapse', 'separate']"
  prefix='border'
  fixed='dark:text-white opacity-85'
  nested=true
  appended='table table-caption text-center table-header-group table-row table-cell table-row-group table-footer-group text-xs border border-emerald-500 bg-emerald-200 p-1 py-2 text-emerald-600 font-medium font-bold'
  html='&lt;div class="table {class} text-xs"&gt;
    &lt;div class="table-caption text-center text-emerald-600 py-2 font-bold"&gt;Council budget&lt;/div&gt;
    &lt;div class="table-header-group bg-emerald-200"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium"&gt;Items&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium" scope="col"&gt;Expenditure&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-row-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Donuts&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;3,000&lt;/div&gt;
        &lt;/div&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Stationery&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;18,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-footer-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Totals&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;21,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;'
/>

## Table Caption Side

The `caption` utility puts the content of a table's `<caption>` on the specified side. The values are relative to the writing-mode of the table.

<PlaygroundWithVariants
  variant='top'
  :variants="['top', 'bottom']"
  prefix='caption'
  fixed='dark:text-white opacity-85'
  nested=true
  appended='table table-caption text-center table-header-group table-row table-cell table-row-group table-footer-group text-xs border border-emerald-500 bg-emerald-200 p-1 py-2 text-emerald-600 font-medium font-bold'
  html='&lt;div class="table {class} text-xs"&gt;
    &lt;div class="table-caption text-center text-emerald-600 py-2 font-bold"&gt;Council budget&lt;/div&gt;
    &lt;div class="table-header-group bg-emerald-200"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium"&gt;Items&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600 font-medium" scope="col"&gt;Expenditure&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-row-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Donuts&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;3,000&lt;/div&gt;
        &lt;/div&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Stationery&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;18,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="table-footer-group"&gt;
        &lt;div class="table-row"&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;Totals&lt;/div&gt;
            &lt;div class="table-cell border border-emerald-500 p-1 text-emerald-600"&gt;21,000&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;'
/>

## Table Empty Cells

The `empty-cells` utility sets whether borders and backgrounds appear around `<table>`cells that have no visible content. A good use case for empty-cells could be a situation where you may not know whether a table will or will not contain empty data points and you decide to hide them.

<PlaygroundWithVariants
  variant='visible'
  :variants="['visible', 'hidden']"
  prefix='empty-cells'
  fixed='dark:text-white opacity-85 text-xs'
  nested=true
  appended='border-separate text-emerald-600 border border-emerald-500 p-1 font-medium font-bold py-2 text-center'
  html='&lt;table class="border-separate text-emerald-600 {class}"&gt;
  &lt;caption class="text-center py-2 font-bold"&gt;Client Info&lt;/caption&gt;
  &lt;tbody&gt;
    &lt;tr&gt;
      &lt;th class="border border-emerald-500 p-1 font-medium"&gt;Client Name&lt;/th&gt;
    	&lt;th class="border border-emerald-500 p-1 font-medium"&gt;Age&lt;/th&gt;
    &lt;/tr&gt;
    &lt;tr&gt;
    	&lt;td class="border border-emerald-500 p-1"&gt;&lt;/td&gt;
    	&lt;td class="border border-emerald-500 p-1"&gt;25&lt;/td&gt;
    &lt;/tr&gt;
    &lt;tr&gt;
      &lt;td class="border border-emerald-500 p-1"&gt;Louise Q.&lt;/td&gt;
      &lt;td class="border border-emerald-500 p-1"&gt;&lt;/td&gt;
    &lt;/tr&gt;
    &lt;tr&gt;
      &lt;td class="border border-emerald-500 p-1"&gt;Owen B.&lt;/td&gt;
      &lt;td class="border border-emerald-500 p-1"&gt;&lt;/td&gt;
    &lt;/tr&gt;
  &lt;/tbody&gt;
&lt;/table&gt;'
/>

## Example Of Table Utilities

Use above utilities to create elements that behave like their respective table elements.

### Raw Html Tags

```html
<table>
    <caption>Council budget</caption>
    <thead>
        <tr>
            <th>Items</th>
            <th scope="col">Expenditure</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">Donuts</th>
            <td>3,000</td>
        </tr>
        <tr>
            <th scope="row">Stationery</th>
            <td>18,000</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <th scope="row">Totals</th>
            <td>21,000</td>
        </tr>
    </tfoot>
</table>
```

### With Windi Utilities

```html
<div class="table">
    <div class="table-caption">Council budget</div>
    <div class="table-header-group">
        <div class="table-row">
            <div class="table-cell">Items</div>
            <div class="table-cell">Expenditure</div>
        </div>
    </div>
    <div class="table-row-group">
        <div class="table-row">
            <div class="table-cell">Donuts</div>
            <div class="table-cell">3,000</div>
        </div>
        <div class="table-row">
            <div class="table-cell">Stationery</div>
            <div class="table-cell">18,000</div>
        </div>
    </div>
    <div class="table-footer-group">
        <div class="table-row">
            <div class="table-cell">Totals</div>
            <div class="table-cell">21,000</div>
        </div>
    </div>
</div>
```
