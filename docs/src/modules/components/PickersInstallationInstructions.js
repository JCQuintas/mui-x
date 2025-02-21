import * as React from 'react';
import InstallationInstructions from './InstallationInstructions';

// #default-branch-switch

const packages = {
  Community: '@mui/x-date-pickers@next',
  Pro: '@mui/x-date-pickers-pro@next',
};

const peerDependency = {
  label: 'Date library',
  packages: ['dayjs', 'date-fns', 'luxon', 'moment'],
};

export default function PickersInstallationInstructions() {
  return <InstallationInstructions packages={packages} peerDependency={peerDependency} />;
}
