import * as React from 'react';
import Box from '@mui/material/Box';
import { FunnelChart } from '@mui/x-charts-pro/FunnelChart';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function FunnelLegend() {
  const [hideLegend, setHideLegend] = React.useState(false);

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      <FunnelToggle hideLegend={hideLegend} setHideLegend={setHideLegend} />
      <FunnelChart
        series={[
          {
            data: [
              { value: 200, label: 'A' },
              { value: 180, label: 'B' },
              { value: 90, label: 'C' },
              { value: 50, label: 'D' },
            ],
          },
        ]}
        hideLegend={hideLegend}
        {...funnelProps}
      />
    </Box>
  );
}

const funnelProps = {
  height: 300,
  slotProps: { legend: { position: { vertical: 'bottom' } } },
} as const;

function FunnelToggle({
  hideLegend,
  setHideLegend,
}: {
  hideLegend: boolean;
  setHideLegend: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={hideLegend}
          onChange={() => setHideLegend((prev) => !prev)}
        />
      }
      label="Hide legend"
    />
  );
}
