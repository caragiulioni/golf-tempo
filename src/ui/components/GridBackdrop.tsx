// Reuse check: extracted from BeatTimeline, which drew this grid inline. Now shared by the swing scale and
// the Tempo slider box (V2-16), so the grid is defined once. Tokens: timeline.gridLine, timelineSizes.gridSize
// and gridLineWidth (no new tokens).
import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';
import { timeline, timelineSizes as S } from '../../theme';
type Props = {
  width: number;
  height: number;
  /** Unique per picture on a page, because the grid pattern is looked up by this id. */
  patternId: string;
};
/** The fine grid drawn behind the swing scale: faint lines every few pixels. Sits behind its siblings. */
export function GridBackdrop({ width, height, patternId }: Props) {
  if (width <= 0 || height <= 0) return null;
  return (
    <Svg width={width} height={height} style={styles.grid} accessible={false}>
      <Defs>
        <Pattern id={patternId} width={S.gridSize} height={S.gridSize} patternUnits="userSpaceOnUse">
          <Path
            d={`M ${S.gridSize} 0 L 0 0 0 ${S.gridSize}`}
            fill="none"
            stroke={timeline.gridLine}
            strokeWidth={S.gridLineWidth}
          />
        </Pattern>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${patternId})`} />
    </Svg>
  );
}
const styles = StyleSheet.create({
  grid: { position: 'absolute', left: 0, top: 0 },
});
