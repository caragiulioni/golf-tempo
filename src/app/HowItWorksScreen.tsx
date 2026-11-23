// Reuse check: listed src/ui/components and src/theme. Reused as is: AppText (body text and the one bold sentence),
// SectionLabel (the headings, the same style as the "Game length" label), IconButton (back), AppHeader (the
// header and menu, shared with the main screen), theme tokens (maxContentWidth, readingMaxWidth, spacing).
// Nothing new is created. The words are in howItWorksText.ts.
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { maxContentWidth, readingMaxWidth, spacing, useTheme } from '../theme';
import { AppText, IconButton, SectionLabel } from '../ui/components';
import { stopSharedPlayer } from '../ui/hooks/usePlayerSession';
import { AppHeader } from './AppHeader';
import { HOW_IT_WORKS_SECTIONS, HOW_IT_WORKS_TITLE } from './howItWorksText';
import type { TextPiece } from './howItWorksText';
type Props = {
  onBack: () => void;
  /** For the menu in the header. */
  onOpenHowItWorks: () => void;
  onOpenLab: () => void;
};
/** A paragraph: plain text with bold and italic pieces. */
function Paragraph({ pieces }: { pieces: ReadonlyArray<TextPiece> }) {
  return (
    <AppText>
      {pieces.map((piece, i) =>
        typeof piece === 'string' ? (
          piece
        ) : (
          <AppText
            key={i}
            variant={piece.bold ? 'label' : 'ui'}
            size="body"
            style={piece.italic ? styles.italic : undefined}
          >
            {piece.text}
          </AppText>
        ),
      )}
    </AppText>
  );
}
export function HowItWorksScreen({ onBack, onOpenHowItWorks, onOpenLab }: Props) {
  const { colors } = useTheme();
  // Opening this screen stops whatever the main screen was playing.
  useEffect(() => {
    stopSharedPlayer();
  }, []);
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <AppHeader onOpenHowItWorks={onOpenHowItWorks} onOpenLab={onOpenLab} />
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <IconButton icon="back" onPress={onBack} accessibilityLabel="Back" />
              <AppText variant="brand" size="title" accessibilityRole="header" style={styles.title}>
                {HOW_IT_WORKS_TITLE}
              </AppText>
            </View>
            {HOW_IT_WORKS_SECTIONS.map((section, index) => (
              <View key={section.heading ?? index} style={styles.section}>
                {section.heading ? (
                  <SectionLabel accessibilityRole="header">{section.heading}</SectionLabel>
                ) : null}
                {section.paragraphs.map((pieces, i) => (
                  <Paragraph key={i} pieces={pieces} />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  /** ScrollView content: centres the page column. */
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  /** Centred, width-limited column: the same as the main screen's, so the header lines up. */
  page: {
    width: '100%',
    maxWidth: maxContentWidth,
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  /** Everything under the header. The text is kept to a readable width. */
  content: { width: '100%', maxWidth: readingMaxWidth, alignSelf: 'center', gap: spacing.xl },
  /** Back button and the title, under the header. */
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { textTransform: 'uppercase' },
  /** A heading with its paragraphs. */
  section: { gap: spacing.md },
  italic: { fontStyle: 'italic' },
});
