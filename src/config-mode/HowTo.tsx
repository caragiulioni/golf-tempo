// Reuse check: Card, AppText, Button, SectionLabel and spacing tokens. Nothing new is created.
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../theme';
import { AppText, Button, Card, SectionLabel } from '../ui/components';
import { HOW_TO_STEPS, HOW_TO_TITLE } from './howToSteps';

/** A button that opens and closes a short numbered list. Closed to start with. */
export function HowTo() {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.wrap}>
      <Button
        label={open ? `Hide ${HOW_TO_TITLE.toLowerCase()}` : HOW_TO_TITLE}
        onPress={() => setOpen((o) => !o)}
        accessibilityLabel={open ? 'Hide how to' : 'Show how to'}
      />
      {open ? (
        <Card accessibilityLabel={HOW_TO_TITLE} style={styles.card}>
          <SectionLabel>{HOW_TO_TITLE}</SectionLabel>
          {HOW_TO_STEPS.map((step, i) => (
            <View key={step} style={styles.step}>
              <AppText variant="num" color="accent" style={styles.number}>
                {i + 1}
              </AppText>
              <AppText style={styles.stepText}>{step}</AppText>
            </View>
          ))}
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { gap: spacing.md },
  /** Number and sentence side by side. */
  step: { flexDirection: 'row', gap: spacing.md },
  /** Fixed width so the sentences line up. */
  number: { width: spacing.xl },
  stepText: { flex: 1 },
});
