import { useWindowDimensions } from 'react-native';
import { layoutForWidth } from '../../theme/tokens';
import type { Layout } from '../../theme/tokens';

export function useLayout(): { layout: Layout; isShortLandscape: boolean } {
  const { width, height } = useWindowDimensions();
  return {
    layout: layoutForWidth(width),
    isShortLandscape: width > height && height < 500,
  };
}
