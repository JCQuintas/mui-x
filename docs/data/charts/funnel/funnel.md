---
title: React Funnel chart
productId: x-charts
components: FunnelChart, FunnelPlot
---

# Charts - Funnel [<span class="plan-pro"></span>](/x/introduction/licensing/#pro-plan 'Pro plan')🚧

<p class="description">Funnel charts allow to express quantity evolution along a process, such as audience engagement, population education levels or yields of multiple processes.</p>

## Basics

The funnel accepts a series which must have a data property containing an array of objects. Those objects should contain a property `value`. They can also have other optional properties, like `label` and `id`.

{{"demo": "BasicFunnel.js"}}

### Display legends

The funnel chart displays a legend by default. The only requirement is to provide a `label` value in the data objects.

To disable the legend, set the `hideLegend` property to `true`.

{{"demo": "FunnelLegend.js"}}

## Labels

The funnel chart displays labels by default. It shows the `value` of the data item in each section.
To format the labels, a `valueFormatter` function can be provided.

{{"demo": "FunnelLabels.js"}}

### Positioning labels

The labels can be positioned relative to the section they represent. The `sectionLabel` property accepts an object with the following properties:

- `position.vertical`: The vertical position of the label. It can be `top`, `center` or `bottom`.
- `position.horizontal`: The horizontal position of the label. It can be `start`, `middle` or `end`.
- `margin`: The margin between the label and the section.
- `dominantBaseline`: The vertical alignment of the text. It can be `auto`, `baseline`, `text-before-edge`, `text-after-edge`, `central`, `hanging` or `middle`.
- `textAnchor`: The horizontal alignment of the text. It can be `start`, `middle` or `end`.

The `sectionLabel` property can be set to `false` to hide the labels.
It also accepts a function that receives the data object and should return the label configuration.

{{"demo": "FunnelLabelPositioningNoSnap.js"}}

## Curve interpolation

The interpolation between data points can be customized by the `curve` property.
This property expects one of the following string values, corresponding to the interpolation method: `'linear'`, `'bumpX'`, `'bumpY'` and `'step'`.

This series property adds the option to control the interpolation of a series.
Different series could even have different interpolations.

{{"demo": "FunnelCurvesNoSnap.js"}}

## Colors

The funnel colors can be customized in two ways.

1. You can provide a [color palette](/x/react-charts/styling/#color-palette). Each section of the funnel will be colored according to this palette.
2. You can provide a `color` property in `data` objects which overrides the palette.

```jsx
<FunnelChart
  colors={['red', 'blue', 'green']} // Use palette
  series={[
    {
      data: [
        { value: 10, color: 'orange' }, // Use color property
        // ...
      ],
    },
  ]}
/>
```

{{"demo": "FunnelColor.js"}}

## Stacking sections

By default, multiple series are stacked on top of each other.

Simply provide multiple series to the funnel chart and make sure that they have different colors or styles to differentiate them.

The order of the series in the array will determine the stacking order. The first series will be at the bottom and the last will be at the top.

{{"demo": "FunnelStacked.js"}}

## Highlight

The hovered element can be highlighted by setting `highlightScope.highlight` property to one of the possible values.

To fade elements which are not hovered, set the `highlightScope.fade` property.

{{"demo": "HighlightFunnel.js"}}

## Scaled sections

By default, the sections have the same size because they use the `band` scale type.
A linear scale, is also available, and will scale the the sections based on their value.
To do so, set the `scaleType` property to `linear`.

{{"demo": "FunnelLinearScale.js"}}

## Display axis

The funnel chart does not display an axis by default.
To display an axis, pass the `ChartsXAxis` and `ChartsYAxis` components as a child of the `FunnelChart` component.

{{"demo": "FunnelAxis.js"}}
