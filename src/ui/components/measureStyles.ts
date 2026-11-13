import { StyleSheet } from 'react-native';

/** Shared by components that render a hidden copy of their content only to read its width. */
export const measureStyles = StyleSheet.create({
  /** Invisible, pinned to the top-left corner, takes no space in the layout. */
  measureCopy: { position: 'absolute', left: 0, top: 0, opacity: 0 },
});
