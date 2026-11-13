import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { iconStrokeWidth, useTheme } from '../../theme';
import type { Colors } from '../../theme';

export type IconName = 'play' | 'pause' | 'check' | 'menu' | 'back';

type Props = {
  name: IconName;
  /** Width and height in points. */
  size: number;
  /** Theme color key. */
  color?: keyof Colors;
};

// All paths drawn on a 24 x 24 grid. Filled shapes use fill, line shapes use stroke.
const FILLED: Partial<Record<IconName, string>> = {
  play: 'M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z',
  pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
};

const STROKED: Partial<Record<IconName, string>> = {
  check: 'M4 12.5l5 5L20 6.5',
  menu: 'M4 6.5h16M4 12h16M4 17.5h16',
  back: 'M15 5l-7 7 7 7',
};


export function Icon({ name, size, color = 'text' }: Props) {
  const { colors } = useTheme();
  const tint = colors[color];
  const filled = FILLED[name];
  const stroked = STROKED[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      {filled ? <Path d={filled} fill={tint} /> : null}
      {stroked ? (
        <Path
          d={stroked}
          fill="none"
          stroke={tint}
          strokeWidth={iconStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </Svg>
  );
}
