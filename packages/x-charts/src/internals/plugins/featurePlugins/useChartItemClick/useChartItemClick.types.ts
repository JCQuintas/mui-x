import type { ChartPluginSignature } from '../../models';
import type { ChartSeriesType } from '../../../../models/seriesType/config';
import type { SeriesItemIdentifierWithType } from '../../../../models/seriesType';
import type { ChartSeriesTypeRequiredPlugins } from '../../corePlugins/useChartSeriesConfig';
import type { ItemActivationEvent } from '../../../../models/featureFlags';

export interface UseChartItemClickParameters<SeriesType extends ChartSeriesType = ChartSeriesType> {
  /**
   * The callback fired when an item is clicked, or when it is activated with the Enter or Space keys.
   * Activation with the Enter and Space keys requires the `enableKeyboardClickEvents` experimental feature.
   *
   * @param {React.MouseEvent<HTMLDivElement, MouseEvent>} event The event that activated the item. It is a `KeyboardEvent` on Enter or Space activation. Import `@mui/x-charts/moduleAugmentation/keyboardItemActivation` for correct typing.
   * @param {SeriesItemIdentifierWithType<SeriesType>} item The clicked item.
   */
  onItemClick?: (
    event: ItemActivationEvent<React.MouseEvent<HTMLDivElement, MouseEvent>>,
    item: SeriesItemIdentifierWithType<SeriesType>,
  ) => void;
}

export interface UseChartItemClickInstance {
  handleClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export interface UseChartItemClickState {}

export type UseChartItemClickSignature<SeriesType extends ChartSeriesType = ChartSeriesType> =
  ChartPluginSignature<{
    params: UseChartItemClickParameters<SeriesType>;
    defaultizedParams: UseChartItemClickParameters<SeriesType>;
    instance: UseChartItemClickInstance;
    dependencies: ChartSeriesTypeRequiredPlugins<SeriesType>;
  }>;
