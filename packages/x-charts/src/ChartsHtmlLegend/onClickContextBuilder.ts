import { LegendItemParams, SeriesLegendItemContext } from './legend.types';

export const seriesContextBuilder = (context: LegendItemParams): SeriesLegendItemContext =>
  ({
    type: 'series',
    color: context.color,
    label: context.label,
    seriesId: context.seriesId!,
    itemId: context.itemId,
  }) as const;
