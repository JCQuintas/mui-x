'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled, SxProps, Theme } from '@mui/material/styles';
import clsx from 'clsx';
import { ChartsLabelMarkClasses, useUtilityClasses } from './labelMarkClasses';
import { consumeThemeProps } from '../internals/consumeThemeProps';

export interface ChartsLabelMarkProps {
  /**
   * The type of the mark.
   * @default 'square'
   */
  type?: 'square' | 'circle' | 'line';
  /**
   * The color of the mark.
   */
  color?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<ChartsLabelMarkClasses>;
  className?: string;
  sx?: SxProps<Theme>;
}

const defaultSize = {
  square: 13,
  circle: 15,
  line: 16,
} as const;

const Root = styled('div', {
  name: 'MuiChartsLabelMark',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})<{ ownerState: ChartsLabelMarkProps }>(({ ownerState }) => {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    height: defaultSize[ownerState.type || 'square'],
    width: defaultSize[ownerState.type || 'square'],
    overflow: 'hidden',

    svg: {
      display: 'block',
    },
  };
});

function SvgCircle({ color }: Pick<ChartsLabelMarkProps, 'color'>) {
  return <circle r="12" cx="12" cy="12" fill={color} />;
}

function SvgLine({ color }: Pick<ChartsLabelMarkProps, 'color'>) {
  return <rect y="9" width="24" height="6" rx="4" ry="4" fill={color} />;
}

function SvgSquare({ color }: Pick<ChartsLabelMarkProps, 'color'>) {
  return <rect width="24" height="24" rx="4" ry="4" fill={color} />;
}

/**
 * @ignore - internal component.
 *
 * Generates the label mark for the tooltip and legend.
 */
const ChartsLabelMark = consumeThemeProps(
  'MuiChartsLabelMark',
  {
    classesResolver: useUtilityClasses,
  },
  function ChartsLabelMark(props: ChartsLabelMarkProps, ref: React.Ref<HTMLDivElement>) {
    const { type, color, className, classes, ...other } = props;

    return (
      <Root
        className={clsx(classes?.root, className)}
        ownerState={props}
        aria-hidden="true"
        ref={ref}
        {...other}
      >
        <svg viewBox="0 0 24 24">
          {type === 'circle' && <SvgCircle color={color} />}
          {type === 'line' && <SvgLine color={color} />}
          {type === 'square' && <SvgSquare color={color} />}
        </svg>
      </Root>
    );
  },
);

ChartsLabelMark.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * The color of the mark.
   */
  color: PropTypes.string,
  /**
   * The type of the mark.
   * @default 'square'
   */
  type: PropTypes.oneOf(['circle', 'line', 'square']),
} as any;

export { ChartsLabelMark };
