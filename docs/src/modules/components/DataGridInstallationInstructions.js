import * as React from 'react';
import InstallationInstructions from './InstallationInstructions';

// #npm-tag-reference

const packages = {
  Community: '@mui/x-data-grid',
  Pro: '@mui/x-data-grid-pro',
  Premium: '@mui/x-data-grid-premium',
};

export default function DataGridInstallationInstructions() {
  return <InstallationInstructions packages={packages} />;
}
