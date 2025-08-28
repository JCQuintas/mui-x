import { clampAngle } from '../internals/clampAngle';
import { doesTextFitInRect, ellipsize } from '../internals/ellipsize';
import { getStringSize } from '../internals/domUtils';
import { TickItemType } from '../hooks/useTicks';
import { ChartDrawingArea } from '../hooks/useDrawingArea';

export function shortenLabels(
  visibleLabels: Set<TickItemType>,
  drawingArea: Pick<ChartDrawingArea, 'left' | 'width' | 'right'>,
  maxHeight: number,
  isRtl: boolean,
  props: { style?: React.CSSProperties } = {},
) {
  const tickLabelStyle = props?.style ?? {};

  const shortenedLabels = new Map<TickItemType, string>();
  const angle = clampAngle('angle' in tickLabelStyle ? (tickLabelStyle?.angle as number) : 0);

  // Multiplying the space available to the left of the text position by leftBoundFactor returns the max width of the text.
  // Same for rightBoundFactor
  let leftBoundFactor = 1;
  let rightBoundFactor = 1;

  if (tickLabelStyle?.textAnchor === 'start') {
    leftBoundFactor = Infinity;
    rightBoundFactor = 1;
  } else if (tickLabelStyle?.textAnchor === 'end') {
    leftBoundFactor = 1;
    rightBoundFactor = Infinity;
  } else {
    leftBoundFactor = 2;
    rightBoundFactor = 2;
  }

  if (angle > 90 && angle < 270) {
    [leftBoundFactor, rightBoundFactor] = [rightBoundFactor, leftBoundFactor];
  }

  if (isRtl) {
    [leftBoundFactor, rightBoundFactor] = [rightBoundFactor, leftBoundFactor];
  }

  for (const item of visibleLabels) {
    if (item.formattedValue) {
      // That maximum width of the tick depends on its proximity to the axis bounds.
      const width = Math.min(
        (item.offset + item.labelOffset) * leftBoundFactor,
        (drawingArea.left +
          drawingArea.width +
          drawingArea.right -
          item.offset -
          item.labelOffset) *
          rightBoundFactor,
      );

      const doesTextFit = (text: string) =>
        doesTextFitInRect(text, {
          width,
          height: maxHeight,
          angle,
          measureText: (string: string) => getStringSize(string, props),
        });

      shortenedLabels.set(item, ellipsize(item.formattedValue.toString(), doesTextFit));
    }
  }

  return shortenedLabels;
}
