import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const GLASS_SIZE = 250; // ml

interface WaterEntry {
  id: string;
  amount: number;
  consumed_at: string;
}

export default function StatsScreen() {
  const { user } = useAuth();
  const [todayTotal, setTodayTotal] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<WaterEntry[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadTodayData();
      }
      return () => {};
    }, [user])
  );

  const loadTodayData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get daily goal
      const { data: profileData } = await supabase
        .from('profiles')
        .select('daily_goal')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setDailyGoal(profileData.daily_goal);
      }

      // Get today's entries
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: entriesData } = await supabase
        .from('water_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('consumed_at', today.toISOString())
        .lt('consumed_at', tomorrow.toISOString())
        .order('consumed_at', { ascending: false });

      if (entriesData) {
        setEntries(entriesData);
        const total = entriesData.reduce((sum, entry) => sum + entry.amount, 0);
        setTodayTotal(total);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (entryId: string) => {
    Alert.alert('Delete Entry', 'Remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('water_entries')
              .delete()
              .eq('id', entryId);

            if (error) throw error;

            await loadTodayData();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete entry');
          }
        },
      },
    ]);
  };

  const progress = Math.min(todayTotal / dailyGoal, 1);
  const cupsConsumed = Math.floor(todayTotal / GLASS_SIZE);
  const cupsRemaining = Math.max(0, Math.ceil((dailyGoal - todayTotal) / GLASS_SIZE));
  const percentageText = Math.round(progress * 100);
  const goalReached = todayTotal >= dailyGoal;

  const renderEntry = ({ item }: { item: WaterEntry }) => {
    const time = new Date(item.consumed_at);
    return (
      <View style={styles.entryItem}>
        <View style={styles.entryLeft}>
          <View style={styles.entryIcon}>
            <FontAwesome5 name="tint" size={18} color={Colors.light.tint} />
          </View>
          <View style={styles.entryContent}>
            <Text style={styles.entryAmount}>{item.amount}ml</Text>
            <Text style={styles.entryTime}>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => deleteEntry(item.id)}
          style={styles.deleteButton}
        >
          <FontAwesome5 name="trash-alt" size={16} color={Colors.light.icon} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Main Progress Card */}
      <Animated.View entering={FadeInDown} style={styles.mainCard}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>Today</Text>
          {goalReached && (
            <View style={styles.badge}>
              <FontAwesome5 name="check" size={12} color="#FFFFFF" />
              <Text style={styles.badgeText}>Goal Reached</Text>
            </View>
          )}
        </View>

        {/* Large Progress Circle */}
        <View style={styles.progressCircleContainer}>
          <View style={styles.progressCircle}>
            <Text style={styles.percentageText}>{percentageText}%</Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{todayTotal}</Text>
            <Text style={styles.statLabel}>Consumed</Text>
            <Text style={styles.statUnit}>ml</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{dailyGoal}</Text>
            <Text style={styles.statLabel}>Goal</Text>
            <Text style={styles.statUnit}>ml</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Cups Status */}
        <View style={styles.cupsStatus}>
          <View style={styles.cupsItem}>
            <FontAwesome5 name="check-circle" size={20} color={Colors.light.success} />
            <View style={styles.cupsTextContainer}>
              <Text style={styles.cupsNumber}>{cupsConsumed}</Text>
              <Text style={styles.cupsStatusLabel}>cups consumed</Text>
            </View>
          </View>
          {!goalReached && (
            <View style={styles.cupsItem}>
              <FontAwesome5 name="circle" size={20} color={Colors.light.icon} />
              <View style={styles.cupsTextContainer}>
                <Text style={styles.cupsNumber}>{cupsRemaining}</Text>
                <Text style={styles.cupsStatusLabel}>cups to go</Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Entries Section */}
      {entries.length > 0 ? (
        <View style={styles.entriesSection}>
          <Text style={styles.sectionTitle}>Today's Log</Text>
          <View style={styles.entriesList}>
            <FlatList
              scrollEnabled={false}
              data={entries}
              renderItem={renderEntry}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={styles.entrySeparator} />}
            />
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <FontAwesome5 name="water" size={48} color={Colors.light.border} />
          <Text style={styles.emptyTitle}>No entries yet</Text>
          <Text style={styles.emptySubtext}>Start logging your water intake</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  mainCard: {
    margin: 16,
    padding: 24,
    backgroundColor: Colors.light.secondary,
    borderRadius: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressCircleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.light.tint,
  },
  percentageText: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.icon,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  statUnit: {
    fontSize: 11,
    color: Colors.light.icon,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.icon,
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 12,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: 3,
  },
  cupsStatus: {
    gap: 12,
  },
  cupsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  cupsTextContainer: {
    flex: 1,
  },
  cupsNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  cupsStatusLabel: {
    fontSize: 12,
    color: Colors.light.icon,
    marginTop: 2,
  },
  entriesSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  entriesList: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  entryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryContent: {
    flex: 1,
  },
  entryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  entryTime: {
    fontSize: 12,
    color: Colors.light.icon,
    marginTop: 2,
  },
  entrySeparator: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.light.icon,
    marginTop: 6,  },
});