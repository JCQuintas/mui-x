import { GridPrivateOnlyApiCommon } from '@mui/x-data-grid/internals';
import {
  GridApiCommon,
  GridColumnPinningApi,
  GridDetailPanelApi,
  GridDetailPanelPrivateApi,
  GridRowPinningApi,
  GridRowMultiSelectionApi,
  GridColumnReorderApi,
  GridRowProApi,
} from '@mui/x-data-grid-pro';
import { GridInitialStatePremium, GridStatePremium } from './gridStatePremium';
import type { GridRowGroupingApi, GridExcelExportApi, GridAggregationApi } from '../hooks';
import { GridCellSelectionApi } from '../hooks/features/cellSelection/gridCellSelectionInterfaces';
import type { DataGridPremiumProcessedProps } from './dataGridPremiumProps';
import type {
  GridDataSourcePremiumPrivateApi,
  GridDataSourceApiPremium,
} from '../hooks/features/dataSource/models';
import type { GridAggregationPrivateApi } from '../hooks/features/aggregation/gridAggregationInterfaces';
import type {
  GridPivotingApi,
  GridPivotingPrivateApi,
} from '../hooks/features/pivoting/gridPivotingInterfaces';
import { GridAiAssistantApi } from '../hooks/features/aiAssistant/gridAiAssistantInterfaces';
import { GridSidebarApi } from '../hooks/features/sidebar/gridSidebarInterfaces';

/**
 * The api of Data Grid Premium.
 * TODO: Do not redefine manually the pro features
 */
export interface GridApiPremium
  extends GridApiCommon<GridStatePremium, GridInitialStatePremium>,
    GridRowProApi,
    GridColumnPinningApi,
    GridDetailPanelApi,
    GridRowGroupingApi,
    GridExcelExportApi,
    GridAggregationApi,
    GridRowPinningApi,
    GridDataSourceApiPremium,
    GridCellSelectionApi,
    GridPivotingApi,
    GridAiAssistantApi,
    GridSidebarApi,
    // APIs that are private in Community plan, but public in Pro and Premium plans
    GridRowMultiSelectionApi,
    GridColumnReorderApi {}

export interface GridPrivateApiPremium
  extends GridApiPremium,
    GridPrivateOnlyApiCommon<GridApiPremium, GridPrivateApiPremium, DataGridPremiumProcessedProps>,
    GridDataSourcePremiumPrivateApi,
    GridAggregationPrivateApi,
    GridDetailPanelPrivateApi,
    GridPivotingPrivateApi {}
