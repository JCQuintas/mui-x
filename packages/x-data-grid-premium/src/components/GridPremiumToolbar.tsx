import * as React from 'react';
import { GridToolbar, GridToolbarProps } from '@mui/x-data-grid-pro/internals';
import { ToolbarButton } from '@mui/x-data-grid-pro';
import { ExportExcel } from './export';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { PivotPanelTrigger } from './pivotPanel/PivotPanelTrigger';
import { isPivotingAvailable } from '../hooks/features/pivoting/utils';

export function GridPremiumToolbar(props: GridToolbarProps) {
  const rootProps = useGridRootProps();
  const apiRef = useGridApiContext();
  const { excelOptions, ...other } = props;

  const additionalItems = isPivotingAvailable(rootProps) ? (
    <PivotPanelTrigger
      render={(triggerProps, state) => (
        <rootProps.slots.baseTooltip title={apiRef.current.getLocaleText('toolbarPivot')}>
          <ToolbarButton {...triggerProps} color={state.active ? 'primary' : 'default'}>
            <rootProps.slots.pivotIcon fontSize="small" />
          </ToolbarButton>
        </rootProps.slots.baseTooltip>
      )}
    />
  ) : undefined;

  const additionalExportMenuItems = !props.excelOptions?.disableToolbarButton
    ? (onMenuItemClick: () => void) => (
        <ExportExcel
          render={<rootProps.slots.baseMenuItem {...rootProps.slotProps?.baseMenuItem} />}
          options={props.excelOptions}
          onClick={onMenuItemClick}
        >
          {apiRef.current.getLocaleText('toolbarExportExcel')}
        </ExportExcel>
      )
    : undefined;

  return (
    <GridToolbar
      {...other}
      additionalItems={additionalItems}
      additionalExportMenuItems={additionalExportMenuItems}
    />
  );
}
