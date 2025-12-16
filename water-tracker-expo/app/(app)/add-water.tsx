import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

const GLASS_SIZE = 250; // ml
const PRESET_AMOUNTS = [
  { label: '250ml', amount: 250 },
  { label: '500ml', amount: 500 },
  { label: '750ml', amount: 750 },
  { label: '1L', amount: 1000 },
];

export default function AddWaterScreen() {
  const { user } = useAuth();
  const [todayTotal, setTodayTotal] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadTodayData();
    }
  }, [user]);

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

      // Get today's total
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: statsData } = await supabase
        .from('daily_stats')
        .select('total_amount')
        .eq('user_id', user.id)
        .eq('date', today.toISOString().split('T')[0])
        .single();

      if (statsData) {
        setTodayTotal(statsData.total_amount);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWater = async (amount: number) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('water_entries').insert([
        {
          user_id: user.id,
          amount,
          consumed_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Update local state
      setTodayTotal(todayTotal + amount);
      setCustomAmount('');
      
      // Reload data to ensure accuracy
      await loadTodayData();

      Alert.alert('Success', `Added ${amount}ml!`, [
        {
          text: 'OK',
          onPress: () => {
            if (todayTotal + amount >= dailyGoal) {
              Alert.alert('🎉 Goal Reached!', 'Great work! You\'ve hit your daily water goal!');
            }
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add water');
    }
  };

  const handleCustomAmount = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount in ml');
      return;
    }
    addWater(amount);
    setIsCustomModalOpen(false);
  };

  const progress = Math.min(todayTotal / dailyGoal, 1);
  const cupsRemaining = Math.max(0, Math.ceil((dailyGoal - todayTotal) / GLASS_SIZE));
  const percentageText = Math.round(progress * 100);
  const remaining = dailyGoal - todayTotal;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Progress Card */}
      <Animated.View entering={FadeInDown} style={styles.progressCard}>
        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>Today's Progress</Text>
          <Text style={styles.progressPercentage}>{percentageText}%</Text>
        </View>

        {/* Circular Progress */}
        <View style={styles.circleContainer}>
          <View style={styles.progressCircle}>
            <FontAwesome5 name="tint" size={36} color={Colors.light.tint} />
            <Text style={styles.circleAmount}>{todayTotal}</Text>
            <Text style={styles.circleUnit}>/ {dailyGoal}ml</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Status Text */}
        <View style={styles.statusContainer}>
          {remaining > 0 ? (
            <>
              <Text style={styles.statusText}>
                <Text style={styles.statusAmount}>{remaining}ml</Text> more to go
              </Text>
              <Text style={styles.statusHint}>
                {cupsRemaining} cup{cupsRemaining !== 1 ? 's' : ''} remaining
              </Text>
            </>
          ) : (
            <Text style={styles.statusSuccess}>✓ Goal reached!</Text>
          )}
        </View>
      </Animated.View>

      {/* Quick Add Section */}
      <View style={styles.quickAddSection}>
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.presetGrid}>
          {PRESET_AMOUNTS.map((preset) => (
            <TouchableOpacity
              key={preset.amount}
              style={styles.presetButton}
              onPress={() => addWater(preset.amount)}
            >
              <Text style={styles.presetButtonText}>{preset.label}</Text>
              <FontAwesome5 name="plus" size={16} color={Colors.light.tint} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Time & Custom Section */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setIsCustomModalOpen(true)}
        >
          <FontAwesome5 name="pen" size={18} color={Colors.light.tint} />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>Custom Amount</Text>
            <Text style={styles.actionValue}>Enter any amount in ml</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={16} color={Colors.light.icon} />
        </TouchableOpacity>
      </View>

      {/* Custom Amount Modal */}
      <Modal
        visible={isCustomModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCustomModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Custom Amount</Text>
              <TouchableOpacity onPress={() => setIsCustomModalOpen(false)}>
                <FontAwesome5 name="times" size={20} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., 300"
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="number-pad"
                placeholderTextColor={Colors.light.icon}
              />
              <Text style={styles.modalInputUnit}>ml</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setIsCustomModalOpen(false);
                  setCustomAmount('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleCustomAmount}
              >
                <Text style={styles.modalAddText}>Add Water</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  progressCard: {
    margin: 16,
    padding: 24,
    backgroundColor: Colors.light.secondary,
    borderRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  circleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.light.tint,
  },
  circleAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 4,
  },
  circleUnit: {
    fontSize: 11,
    color: Colors.light.icon,
    marginTop: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: 4,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  statusAmount: {
    fontWeight: '700',
    color: Colors.light.tint,
  },
  statusHint: {
    fontSize: 12,
    color: Colors.light.icon,
    marginTop: 4,
  },
  statusSuccess: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.success,
  },
  quickAddSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetGrid: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  presetButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: Colors.light.secondary,
    borderRadius: 10,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  actionsSection: {
    paddingHorizontal: 16,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: Colors.light.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionLabel: {
    fontSize: 12,
    color: Colors.light.icon,
    fontWeight: '500',
  },
  actionValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '600',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.tint,
  },
  modalInputUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.icon,
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  modalAddButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    borderRadius: 10,
  },
  modalAddText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
