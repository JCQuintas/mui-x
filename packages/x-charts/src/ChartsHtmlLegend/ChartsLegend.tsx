'use client';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import { PrependKeys } from '@mui/x-internals/types';
import PropTypes from 'prop-types';
import { useLegend } from '../hooks/useLegend';
import { ChartsLegendItem } from './ChartsLegendItem';
import type { ChartsLegendPlacement, ChartsLegendSlotExtension } from './legend.types';
import { SeriesLegendItemContext } from './legendContext.types';
import { ChartsLabelProps } from '../ChartsLabel/ChartsLabel';
import { ChartsLabelMarkProps } from '../ChartsLabel/ChartsLabelMark';
import { seriesContextBuilder } from './onClickContextBuilder';
import { useUtilityClasses, type ChartsLegendClasses } from './chartsLegendClasses';
import { consumeSlots } from '../internals/consumeSlots';

export interface ChartsLegendProps
  extends ChartsLegendPlacement,
    Omit<ChartsLabelProps, 'children'>,
    PrependKeys<Omit<ChartsLabelMarkProps, 'color'>, 'mark'> {
  // TODO: should be handled by the `BarChart/LineChart/etc` components
  // hidden?: boolean
  /**
   * Space between two legend items (in px).
   * @default theme.spacing(2)
   */
  gap?: number;
  /**
   * Space between the mark and the label (in px).
   * @default theme.spacing(1)
   */
  markGap?: number;
  /**
   * Callback fired when a legend item is clicked.
   * @param {React.MouseEvent<HTMLDivElement, MouseEvent>} event The click event.
   * @param {SeriesLegendItemContext} legendItem The legend item data.
   * @param {number} index The index of the clicked legend item.
   */
  onItemClick?: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    legendItem: SeriesLegendItemContext,
    index: number,
  ) => void;
  /**
   * Override or extend the styles applied to the component.
   */
  // eslint-disable-next-line react/no-unused-prop-types
  classes?: Partial<ChartsLegendClasses>;
}

const RootDiv = styled('div', {
  name: 'MuiChartsLegend',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})<{ ownerState: Pick<ChartsLegendProps, 'gap' | 'direction'> }>(({ ownerState, theme }) => ({
  display: 'flex',
  flexDirection: ownerState.direction ?? 'row',
  gap: ownerState.gap ?? theme.spacing(2),
}));

const defaultProps: Partial<ChartsLegendProps> = { direction: 'row' };

const ChartsLegend = consumeSlots(
  'MuiChartsLegend',
  'legend',
  {
    defaultProps,
    classesResolver: useUtilityClasses,
  },
  function ChartsLegend(
    props: ChartsLegendProps & ChartsLegendSlotExtension,
    ref: React.Ref<HTMLDivElement>,
  ) {
    const data = useLegend();
    const {
      direction,
      gap,
      labelStyle,
      markGap,
      markBorderRadius,
      markLineWidth,
      markSize,
      markType,
      onItemClick,
    } = props;

    const classes = useUtilityClasses(props);

    return (
      <RootDiv className={classes.root} ownerState={{ direction, gap }} ref={ref}>
        {data.itemsToDisplay.map((item, i) => {
          return (
            <ChartsLegendItem
              key={item.id}
              labelStyle={labelStyle}
              gap={markGap}
              classes={classes}
              onClick={
                onItemClick
                  ? (event) => onItemClick(event, seriesContextBuilder(item), i)
                  : undefined
              }
              mark={{
                color: item.color,
                type: markType ?? item.markType,
                borderRadius: markBorderRadius,
                lineWidth: markLineWidth,
                size: markSize,
              }}
            >
              {item.label}
            </ChartsLegendItem>
          );
        })}
      </RootDiv>
    );
  },
);

ChartsLegend.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * The direction of the legend layout.
   * The default depends on the chart.
   */
  direction: PropTypes.oneOf(['column', 'row']),
  /**
   * Space between two legend items (in px).
   * @default theme.spacing(2)
   */
  gap: PropTypes.number,
  /**
   * Style applied to legend labels.
   * @default theme.typography.caption
   */
  labelStyle: PropTypes.object,
  /**
   * Space between the mark and the label (in px).
   * @default theme.spacing(1)
   */
  markGap: PropTypes.number,
  /**
   * Callback fired when a legend item is clicked.
   * @param {React.MouseEvent<HTMLDivElement, MouseEvent>} event The click event.
   * @param {SeriesLegendItemContext} legendItem The legend item data.
   * @param {number} index The index of the clicked legend item.
   */
  onItemClick: PropTypes.func,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
} as any;

export { ChartsLegend };
