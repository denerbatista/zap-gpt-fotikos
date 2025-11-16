import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

interface Props {
  status: 'ON_TIME' | 'LATE' | 'ABSENT';
}

const textByStatus = {
  ON_TIME: 'Pontual',
  LATE: 'Atraso',
  ABSENT: 'Ausência',
};

const backgroundByStatus = {
  ON_TIME: colors.success,
  LATE: colors.warning,
  ABSENT: colors.danger,
};

export const StatusPill = memo(({ status }: Props) => {
  return (
    <View style={[styles.container, { backgroundColor: backgroundByStatus[status] }]}>
      <Text style={styles.text}>{textByStatus[status]}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});
