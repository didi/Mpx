# Scroll Snap

## Scroll Snap Align

| Class                         | Properties                                                                                         | Description                                                                  |
| :---------------------------- | :------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| `snap-start`                  | scroll-snap-align: start                                                                           |                                                                              |
| `snap-end`                    | scroll-snap-align: end                                                                             |                                                                              |
| `snap-center`                 | scroll-snap-align: center                                                                          |                                                                              |

## Scroll Snap Stop

| Class                         | Properties                                                                                         | Description                                                                  |
| :---------------------------- | :------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| `snap-normal`                 | scroll-snap-stop: normal                                                                           |                                                                              |
| `snap-always`                 | scroll-snap-stop: always                                                                           |                                                                              |

## Scroll Snap Type

| Class                         | Properties                                                                                         | Description                                                                  |
| :---------------------------- | :------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| `snap`                        | scroll-snap-type: <br> var(--scroll-snap-axis, both) <br> var(--scroll-snap-strictness, mandatory) | main snap class                                                              |
| __Strictness__                |                                                                                                    |                                                                              |
| `snap-none`                   | --scroll-snap-strictness: none                                                                     |                                                                              |
| `snap-mandatory`              | --scroll-snap-strictness: mandatory                                                                |                                                                              |
| `snap-proximity`              | --scroll-snap-strictness: proximity                                                                |                                                                              |
| __Axis__                      |                                                                                                    |                                                                              |
| `snap-x`                      | --scroll-snap-axis: x                                                                              |                                                                              |
| `snap-y`                      | --scroll-snap-axis: y                                                                              |                                                                              |
| `snap-block`                  | --scroll-snap-axis: block                                                                          |                                                                              |
| `snap-inline`                 | --scroll-snap-axis: inline                                                                         |                                                                              |
| `snap-both`                   | --scroll-snap-axis: both                                                                           |                                                                              |

## Margin, Padding and Other

| Class                         | Properties                                                                                         | Description                                                                  |
| :---------------------------- | :------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| __Margin__                    |                                                                                                    |                                                                              |
| `snap-m${direction}-${value}` | scroll-snap-margin`${direction}`: `${value}`                                                       | same [Margin Utilities](/utilities/layout/spacing#margin)                      |
| __Padding__                   |                                                                                                    |                                                                              |
| `snap-p${direction}-${value}` | scroll-snap-padding`${direction}`: `${value}`                                                      | same [Padding Utilities](/utilities/layout/spacing#padding)                    |
| __Other__                     |                                                                                                    |                                                                              |
| `scrollbar-hide`              | scrollbar-width: none<br>::-webkit-scrollbar: {<br>&nbsp;&nbsp;display: none<br>}                  | visual hide scrollbar                                                        |