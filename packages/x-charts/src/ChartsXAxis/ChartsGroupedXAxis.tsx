'use client';
import * as React from 'react';
import useSlotProps from '@mui/utils/useSlotProps';
import { useThemeProps, useTheme } from '@mui/material/styles';
import { useRtl } from '@mui/system/RtlProvider';
import { ChartsXAxisProps, type AxisGrouping } from '../models/axis';
import { ChartsText, ChartsTextProps } from '../ChartsText';
import { useDrawingArea } from '../hooks/useDrawingArea';
import { isInfinity } from '../internals/isInfinity';
import { isBandScale } from '../internals/isBandScale';
import { useChartContext } from '../context/ChartProvider/useChartContext';
import { useXAxes } from '../hooks/useAxis';
import { getDefaultBaseline, getDefaultTextAnchor } from '../ChartsText/defaultTextPlacement';
import { invertTextAnchor } from '../internals/invertTextAnchor';
import { defaultProps, TICK_LABEL_GAP, XAxisRoot, useUtilityClasses } from './utilities';
import { useTicksGrouped } from '../hooks/useTicksGrouped';

const DEFAULT_GROUPING_BAND: Omit<Required<AxisGrouping>, 'getGrouping' | 'axes'> = {
  tickSize: 6,
  offset: 'auto',
  mode: 'combined',
};

const DEFAULT_GROUPING_OTHER: Omit<Required<AxisGrouping>, 'getGrouping' | 'axes'> = {
  tickSize: 6,
  offset: 10,
  mode: 'isolated',
};

/**
 * @ignore - internal component.
 */
function ChartsGroupedXAxis(inProps: ChartsXAxisProps) {
  const { xAxis, xAxisIds } = useXAxes();
  const { scale: xScale, tickNumber, reverse, ...settings } = xAxis[inProps.axisId ?? xAxisIds[0]];

  // eslint-disable-next-line material-ui/mui-name-matches-component-name
  const themedProps = useThemeProps({ props: { ...settings, ...inProps }, name: 'MuiChartsXAxis' });

  const defaultizedProps = {
    ...defaultProps,
    ...themedProps,
  };

  const {
    position,
    disableLine,
    disableTicks,
    tickLabelStyle,
    label,
    labelStyle,
    tickSize,
    valueFormatter,
    slots,
    slotProps,
    tickInterval,
    tickPlacement,
    tickLabelPlacement,
    sx,
    offset,
    height: axisHeight,
    grouping: groupingConfig,
  } = defaultizedProps;

  const theme = useTheme();
  const isRtl = useRtl();
  const classes = useUtilityClasses(defaultizedProps);
  const drawingArea = useDrawingArea();
  const { left, top, width, height } = drawingArea;
  const { instance } = useChartContext();

  const positionSign = position === 'bottom' ? 1 : -1;

  const Line = slots?.axisLine ?? 'line';
  const Tick = slots?.axisTick ?? 'line';
  const TickLabel = slots?.axisTickLabel ?? ChartsText;
  const Label = slots?.axisLabel ?? ChartsText;

  const defaultTextAnchor = getDefaultTextAnchor(
    (position === 'bottom' ? 0 : 180) - (tickLabelStyle?.angle ?? 0),
  );
  const defaultDominantBaseline = getDefaultBaseline(
    (position === 'bottom' ? 0 : 180) - (tickLabelStyle?.angle ?? 0),
  );
  const isScaleBand = isBandScale(xScale);

  const getGroupConfig = React.useCallback(
    (groupIndex: number) => {
      const config = groupingConfig?.axes?.[groupIndex] ?? {};
      const DEFAULTS = isScaleBand ? DEFAULT_GROUPING_BAND : DEFAULT_GROUPING_OTHER;

      return {
        ...DEFAULTS,
        ...groupingConfig,
        ...config,
        tickSize: config?.tickSize ?? tickSize ?? DEFAULTS.tickSize,
      };
    },
    [groupingConfig, tickSize, isScaleBand],
  );

  const axisTickLabelProps = useSlotProps({
    elementType: TickLabel,
    externalSlotProps: slotProps?.axisTickLabel,
    additionalProps: {
      style: {
        ...theme.typography.caption,
        fontSize: 12,
        lineHeight: 1.25,
        textAnchor: isRtl ? invertTextAnchor(defaultTextAnchor) : defaultTextAnchor,
        dominantBaseline: defaultDominantBaseline,
        ...tickLabelStyle,
      },
    } as Partial<ChartsTextProps>,
    className: classes.tickLabel,
    ownerState: {},
  });

  const axisLabelProps = useSlotProps({
    elementType: Label,
    externalSlotProps: slotProps?.axisLabel,
    additionalProps: {
      style: {
        ...theme.typography.body1,
        lineHeight: 1,
        fontSize: 14,
        textAnchor: 'middle',
        dominantBaseline: position === 'bottom' ? 'text-after-edge' : 'text-before-edge',
        ...labelStyle,
      },
    } as Partial<ChartsTextProps>,
    ownerState: {},
  });

  const xTicks = useTicksGrouped({
    scale: xScale,
    tickNumber,
    valueFormatter,
    tickInterval,
    tickPlacement,
    tickLabelPlacement,
    direction: 'x',
    getGrouping: groupingConfig!.getGrouping,
    getGroupConfig,
  });

  const domain = xScale.domain();
  // Skip axis rendering if no data is available
  // - The domain is an empty array for band/point scales.
  // - The domains contains Infinity for continuous scales.
  // - The position is set to 'none'.
  if (
    (isScaleBand && domain.length === 0) ||
    (!isScaleBand && domain.some(isInfinity)) ||
    position === 'none'
  ) {
    return null;
  }

  const labelRefPoint = {
    x: left + width / 2,
    y: positionSign * axisHeight,
  };

  return (
    <XAxisRoot
      transform={`translate(0, ${position === 'bottom' ? top + height + offset : top - offset})`}
      className={classes.root}
      sx={sx}
    >
      {!disableLine && (
        <Line x1={left} x2={left + width} className={classes.line} {...slotProps?.axisLine} />
      )}

      {xTicks.map((group) => {
        return (
          <g
            transform={`translate(0, ${positionSign * group.groupOffset})`}
            data-group-index={group.groupIndex}
            key={group.groupIndex}
          >
            {group.ticks.map((item, index) => {
              const { offset: tickOffset, labelOffset } = item;
              const xTickLabel = labelOffset ?? 0;

              const showTick = instance.isXInside(tickOffset);
              const tickLabel = item.formattedValue;
              const ignoreTick = item.ignoreTick ?? false;
              const groupIndex = item.groupIndex ?? 0;
              const groupConfig = getGroupConfig(groupIndex);

              const tickYSize = positionSign * groupConfig.tickSize;
              const labelPositionY = positionSign * (groupConfig.tickSize + TICK_LABEL_GAP);

              return (
                <g
                  key={index}
                  transform={`translate(${tickOffset}, 0)`}
                  className={classes.tickContainer}
                >
                  {!disableTicks && !ignoreTick && showTick && (
                    <Tick y2={tickYSize} className={classes.tick} {...slotProps?.axisTick} />
                  )}

                  {tickLabel !== undefined && (
                    <TickLabel
                      x={xTickLabel}
                      y={labelPositionY}
                      data-testid="ChartsXAxisTickLabel"
                      {...axisTickLabelProps}
                      style={{
                        ...axisTickLabelProps.style,
                        dominantBaseline:
                          groupIndex === 0
                            ? axisTickLabelProps?.style?.dominantBaseline
                            : 'central',
                      }}
                      text={tickLabel}
                    />
                  )}
                </g>
              );
            })}
          </g>
        );
      })}

      {label && (
        <g className={classes.label}>
          <Label {...labelRefPoint} {...axisLabelProps} text={label} />
        </g>
      )}
    </XAxisRoot>
  );
}

ChartsGroupedXAxis.propTypes = {} as any;

export { ChartsGroupedXAxis };
