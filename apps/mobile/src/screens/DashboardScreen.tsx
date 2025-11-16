import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAttendanceFeed } from '@/hooks/useAttendanceFeed';
import { AttendanceCard } from '@/components/AttendanceCard';
import { colors } from '@/theme/colors';

export function DashboardScreen() {
  const { data, loading, error, reload } = useAttendanceFeed();

  const totals = data.reduce(
    (acc, record) => {
      acc.overall += 1;
      acc[record.status] += 1;
      return acc;
    },
    { overall: 0, ON_TIME: 0, LATE: 0, ABSENT: 0 }
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Portaria inteligente</Text>
      <Text style={styles.subtitle}>Atualizado automaticamente a cada 10 segundos.</Text>
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Presentes</Text>
          <Text style={styles.metricValue}>{totals.ON_TIME}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Atrasos</Text>
          <Text style={styles.metricValue}>{totals.LATE}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Ausentes</Text>
          <Text style={styles.metricValue}>{totals.ABSENT}</Text>
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
      >
        {data.map((record) => (
          <AttendanceCard key={record.id} record={record} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    color: colors.muted,
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  metricLabel: {
    color: colors.muted,
    marginBottom: 8,
  },
  metricValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
  },
  scroll: {
    flex: 1,
  },
});
