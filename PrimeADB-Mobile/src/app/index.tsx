import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container} type="background">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            PrimeADB
          </ThemedText>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PRO</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Status Card */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText type="subtitle">ADB Status</ThemedText>
              <View style={[styles.dot, styles.dotDisconnected]} />
            </View>
            <ThemedText type="default" style={styles.cardText}>
              Disconnected. Please connect a device via USB or Wireless Debugging.
            </ThemedText>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Scan for Devices</Text>
            </TouchableOpacity>
          </ThemedView>

          {/* Quick Actions */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <View style={styles.grid}>
            {[
              { icon: '📱', label: 'App Manager' },
              { icon: '⚡', label: 'Fastboot' },
              { icon: '📁', label: 'File Explorer' },
              { icon: '📺', label: 'Screen Mirror' },
              { icon: '🔄', label: 'Reboot Options' },
              { icon: '⚙️', label: 'Shell' },
            ].map((item, index) => (
              <ThemedView key={index} type="backgroundElement" style={styles.gridItem}>
                <Text style={styles.gridIcon}>{item.icon}</Text>
                <ThemedText type="default" style={styles.gridLabel}>{item.label}</ThemedText>
              </ThemedView>
            ))}
          </View>

          {/* Device Info (Mock) */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Devices
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.listCard}>
            <View style={styles.listItem}>
              <Text style={styles.listIcon}>📱</Text>
              <View style={styles.listBody}>
                <ThemedText type="defaultSemiBold">Pixel 7 Pro</ThemedText>
                <ThemedText type="small">192.168.1.15:5555</ThemedText>
              </View>
              <TouchableOpacity style={styles.connectButton}>
                <Text style={styles.connectButtonText}>Connect</Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotDisconnected: {
    backgroundColor: '#FF3B30',
  },
  cardText: {
    opacity: 0.7,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  listCard: {
    borderRadius: 16,
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  listBody: {
    flex: 1,
  },
  connectButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  connectButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
