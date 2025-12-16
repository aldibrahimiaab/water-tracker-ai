import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Profile {
  full_name: string;
  email: string;
  daily_goal: number;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('2000');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, daily_goal')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setNewGoal(data.daily_goal.toString());
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    if (!user || !profile) return;

    const goal = parseInt(newGoal);
    if (isNaN(goal) || goal <= 0) {
      Alert.alert('Error', 'Please enter a valid goal amount');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ daily_goal: goal })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({
        ...profile,
        daily_goal: goal,
      });

      setEditingGoal(false);
      Alert.alert('Success', 'Daily goal updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update goal');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/login');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to logout');
          }
        },
      },
    ]);
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
      {/* Profile Header */}
      <Animated.View entering={FadeInDown} style={styles.headerSection}>
        <View style={styles.avatarContainer}>
          <FontAwesome5 name="user-circle" size={80} color={Colors.light.tint} />
        </View>
        {profile && (
          <View style={styles.headerText}>
            <Text style={styles.nameText}>{profile.full_name || 'User'}</Text>
            <Text style={styles.emailText}>{profile.email}</Text>
          </View>
        )}
      </Animated.View>

      {/* Daily Goal Card */}
      <Animated.View entering={FadeInDown} style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalLeft}>
            <FontAwesome5 name="bullseye" size={28} color={Colors.light.tint} />
            <View style={styles.goalInfo}>
              <Text style={styles.goalLabel}>Daily Goal</Text>
              {profile && (
                <Text style={styles.goalValue}>{profile.daily_goal} ml</Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditingGoal(true)}
          >
            <FontAwesome5 name="edit" size={20} color={Colors.light.tint} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Stats Summary */}
      <Animated.View entering={FadeInDown} style={styles.statsCard}>
        <Text style={styles.statsTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <FontAwesome5 name="water" size={24} color={Colors.light.tint} />
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statName}>glasses/day</Text>
          </View>
          <View style={styles.statItem}>
            <FontAwesome5 name="calendar-alt" size={24} color={Colors.light.tint} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statName}>days tracked</Text>
          </View>
          <View style={styles.statItem}>
            <FontAwesome5 name="chart-line" size={24} color={Colors.light.tint} />
            <Text style={styles.statValue}>0%</Text>
            <Text style={styles.statName}>completion</Text>
          </View>
        </View>
      </Animated.View>

      {/* Account Section */}
      <Animated.View entering={FadeInDown} style={styles.accountSection}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <FontAwesome5 name="envelope" size={20} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Email</Text>
              {profile && (
                <Text style={styles.settingValue}>{profile.email}</Text>
              )}
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <FontAwesome5 name="sign-out-alt" size={20} color="#ff3b30" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Edit Goal Modal */}
      <Modal
        visible={editingGoal}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingGoal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Daily Goal</Text>
            <Text style={styles.modalSubtitle}>Set your daily water intake goal (in ml)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., 2000"
              value={newGoal}
              onChangeText={setNewGoal}
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setEditingGoal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveGoal}
              >
                <Text style={styles.modalSaveText}>Save</Text>
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
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  headerText: {
    alignItems: 'center',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  goalCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  goalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginTop: 4,
  },
  editButton: {
    padding: 8,
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  statName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  accountSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginTop: 2,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  logoutButtonText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalCancelText: {
    textAlign: 'center',
    color: '#666',
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
  },
  modalSaveText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
});
