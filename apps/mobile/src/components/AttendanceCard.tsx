import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AttendanceRecord } from '@/services/api';
import { StatusPill } from './StatusPill';
import { colors } from '@/theme/colors';

interface Props {
  record: AttendanceRecord;
}

export const AttendanceCard = memo(({ record }: Props) => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{record.studentId}</Text>
        <StatusPill status={record.status} />
      </View>
      <Text style={styles.timestamp}>
        {new Date(record.timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
      {record.minutesLate ? (
        <Text style={styles.detail}>Atraso de {record.minutesLate} min.</Text>
      ) : null}
      {record.reason ? <Text style={styles.detail}>{record.reason}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  timestamp: {
    marginTop: 4,
    color: colors.muted,
  },
  detail: {
    marginTop: 4,
    color: colors.text,
  },
});
