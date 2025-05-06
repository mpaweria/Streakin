import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  TextInput,
  Modal,
  Image,
  SafeAreaView,
  Button,
  Alert,
  Platform,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isBetween from 'dayjs/plugin/isBetween';
import isSame from 'dayjs';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);
dayjs.extend(isSame);

import { Habit } from '../types';
import scheduleNotifications from '@/services/notificationService';
import { useNotificationSetup } from '../services/notificationSetup';
import { theme } from '@/constants/theme';

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [currentHabitId, setCurrentHabitId] = useState<string | null>(null);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const router = useRouter();

  useNotificationSetup();

  const getHabits = async (): Promise<Habit[]> => {
    const habitsJSON = await AsyncStorage.getItem('habits');
    return habitsJSON ? JSON.parse(habitsJSON) : [];
  };

  const fetchHabits = async () => {
    try {
      const habitsList = await getHabits();
      const today = dayjs().startOf('day'); // Define today once outside the map
  
      const updatedHabits = habitsList.map((habit: Habit) => {
        let calculatedStreak = 0; // Default streak is 0
  
        // Calculate streak *only* based on history
        if (habit.history && habit.history.length > 0) {
          
          // Sort history dates in descending order (newest first)
          const sortedDates = [...habit.history]
            .map(entry => dayjs(entry.date).startOf('day')) // Map to dayjs objects at start of day
            .sort((a, b) => b.diff(a)); // Newest first using diff
  
          const mostRecentDate = sortedDates[0];
  
          // Check if the most recent entry is today or yesterday - streak is potentially active
          const isRecentEntry = mostRecentDate.isSame(today, 'day') ||
                                mostRecentDate.isSame(today.subtract(1, 'day'), 'day');
  
          if (isRecentEntry) {
            calculatedStreak = 1; // Start with 1 for the most recent day
            let currentDate = mostRecentDate;
  
            // Iterate through the rest of the sorted history
            for (let i = 1; i < sortedDates.length; i++) {
              const prevDate = sortedDates[i];
  
              // Check if the previous date is exactly one day before the current date
              if (currentDate.diff(prevDate, 'day') === 1) {
                calculatedStreak++; // Increment streak for consecutive day
                currentDate = prevDate; // Move to the previous date for the next comparison
              } else {
                // If dates are not consecutive, the streak is broken
                break;
              }
            }
          }
          // If isRecentEntry is false (most recent entry is older than yesterday),
          // calculatedStreak remains 0, correctly indicating no active streak.
        }
  
        // Return the original habit data spread, overriding only the streak
        // Also, ensure lastChecked aligns with the latest history entry if necessary,
        // though relying on it primarily for the 'isCheckedToday' flag is safer.
        // Let's keep lastChecked as is unless logic dictates otherwise.
        // If history exists, maybe align lastChecked for consistency?
        const latestHistoryDate = (habit.history && habit.history.length > 0)
           ? habit.history.map(e => e.date).sort().reverse()[0]
           : null;
  
        return {
          ...habit,
          streak: calculatedStreak,
          // Optional: Update lastChecked based on history if it seems out of sync
          // lastChecked: latestHistoryDate ? new Date(latestHistoryDate).toISOString() : habit.lastChecked
        };
      });
  
      // Save the potentially updated streaks back to storage
      // This ensures that if streaks were wrong before, they are corrected on load.
      await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
  
      // Update the component state
      setHabits(updatedHabits);
  
    } catch (error) {
      console.error('Error loading and processing habits:', error);
      // Optionally show an alert to the user
      // Alert.alert("Error", "Could not load habits.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
      scheduleNotifications();
    }, [])
  );

  const handleCheckIn = async () => {
    if (!currentHabitId) return;
  
    const habitsList = await getHabits();
    let habitCheckedIn: Habit | null = null;
  
    const updatedHabits = habitsList.map((habit: Habit) => {
      if (habit.id === currentHabitId) {
        const today = dayjs().startOf('day');
        const lastCheck = habit.lastChecked ? dayjs(habit.lastChecked).startOf('day') : null;
  
        if (lastCheck?.isSame(today, 'day')) {
          habitCheckedIn = habit;
          return habit;
        }
  
        const todayISO = today.format('YYYY-MM-DD');
        const history = habit.history || [];
        const todaysEntryIndex = history.findIndex(entry => dayjs(entry.date).isSame(today, 'day'));
  
        let updatedHistory;
        if (todaysEntryIndex > -1) {
          updatedHistory = [...history];
          updatedHistory[todaysEntryIndex] = { ...updatedHistory[todaysEntryIndex], note: note || updatedHistory[todaysEntryIndex].note, photo: photo || updatedHistory[todaysEntryIndex].photo };
        } else {
          updatedHistory = [...history, { date: todayISO, note: note || undefined, photo: photo || undefined }];
        }
  
        // Calculate streak based on history
        const sortedDates = [...updatedHistory]
          .map(entry => dayjs(entry.date).startOf('day'))
          .sort((a, b) => b.diff(a));
        
        let streak = 1;
        let currentDate = sortedDates[0];
        
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = sortedDates[i];
          
          if (currentDate.diff(prevDate, 'day') === 1) {
            streak++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
  
        habitCheckedIn = {
          ...habit,
          lastChecked: new Date().toISOString(),
          streak: streak,
          history: updatedHistory,
        };
        return habitCheckedIn;
      }
      return habit;
    });
  
    await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
    setHabits(updatedHabits);
  
    if (currentHabitId && swipeableRefs.current[currentHabitId]) {
      swipeableRefs.current[currentHabitId]?.close();
    }
    setModalVisible(false);
    setNote('');
    setPhoto(null);
    setCurrentHabitId(null);
  };

  const handleCancelCheckIn = () => {
    if (currentHabitId && swipeableRefs.current[currentHabitId]) {
        swipeableRefs.current[currentHabitId]?.close();
    }
    setModalVisible(false);
    setNote('');
    setPhoto(null);
    setCurrentHabitId(null);
  };

  const deleteHabit = async (id: string) => {
    try {
      const currentHabits = await getHabits();
      const updatedHabits = currentHabits.filter(h => h.id !== id);
      await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
      if (swipeableRefs.current[id]) {
        swipeableRefs.current[id]?.close();
        delete swipeableRefs.current[id];
      }
    } catch(error) {
      console.error("Failed to delete habit:", error);
      Alert.alert("Error", "Failed to delete habit.");
    }
  };

  const confirmDeleteHabit = (id: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {
          if (swipeableRefs.current[id]) {
            swipeableRefs.current[id]?.close();
          }
        }},
        { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(id) },
      ],
      { cancelable: true }
    );
  };

  const openModalForHabit = (id: string) => {
    setNote('');
    setPhoto(null);
    setCurrentHabitId(id);
    setModalVisible(true);
  };

  const pickImage = async () => {
    try {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'Permission to access gallery is required!');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhoto(result.assets[0].uri);
        }
    } catch (error) {
        console.error("Error picking image:", error);
        Alert.alert("Error", "Failed to pick image.");
    }
  };

  const takePhoto = async () => {
    try {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission Required','Camera permission is required!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhoto(result.assets[0].uri);
        }
    } catch (error) {
        console.error("Error taking photo:", error);
        Alert.alert("Error", "Failed to take photo.");
    }
  };

  const renderHabit = ({ item }: { item: Habit }) => {
    const isCheckedToday = item.lastChecked ? dayjs(item.lastChecked).isSame(dayjs(), 'day') : false;
    const containerStyle = [styles.habitItem, isCheckedToday && styles.completedHabit];

    const RightActions = () => (
        <View style={isCheckedToday ? styles.disabledSwipeAction : styles.checkInSwipeAction}>
            <Text style={isCheckedToday ? styles.disabledSwipeText : styles.swipeText}>
                {isCheckedToday ? 'Done!' : 'Mark Done'}
            </Text>
        </View>
    );

    const LeftActions = () => (
         <View style={styles.deleteAction}>
             <Text style={styles.swipeText}>Delete</Text>
         </View>
    );

    return (
      <Swipeable
        ref={(ref) => {
          if (ref) {
            swipeableRefs.current[item.id] = ref;
          }
        }}
        onSwipeableOpen={(direction) => {
            if (direction === 'right') {
                if (!isCheckedToday) {
                    openModalForHabit(item.id);
                } else {
                    setTimeout(() => swipeableRefs.current[item.id]?.close(), 600);
                }
            } else if (direction === 'left') {
                confirmDeleteHabit(item.id);
            }
        }}
        renderRightActions={RightActions}
        renderLeftActions={LeftActions}
        overshootFriction={8}
        rightThreshold={isCheckedToday ? Number.MAX_SAFE_INTEGER : 40}
        leftThreshold={40}
      >
        <Pressable
          style={containerStyle}
          onPress={() =>
            router.push({
              pathname: '/streakCalendar',
              params: { id: item.id, streak: item.streak || 0, name: item.name },
            })
          }
        >
          <View style={styles.habitContent}>
            <Text style={styles.habitName}>{item.name}</Text>
            <Text style={styles.streakText}>Streak: {item.streak || 0}</Text>
            {isCheckedToday && (
              <Text style={styles.completedIndicator}>✓ Completed Today</Text>
            )}
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GestureHandlerRootView style={styles.container}>
        <Link href="/addHabit" asChild>
           <Pressable style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Add New Habit</Text>
           </Pressable>
        </Link>

        {habits.length === 0 ? (
          <View style={styles.emptyContainer}>
             <Text style={styles.emptyText}>No habits yet. Tap '+' to add one!</Text>
          </View>
        ) : (
          <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={renderHabit}
            contentContainerStyle={styles.listContentContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        <Modal
           visible={modalVisible}
           animationType="fade"
           transparent={true}
           onRequestClose={handleCancelCheckIn}
        >
          <Pressable style={styles.modalOverlay} onPress={handleCancelCheckIn}>
            <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
                <Text style={styles.modalTitle}>Check-in: {habits.find(h => h.id === currentHabitId)?.name}</Text>
                <Text style={styles.modalSubText}>Add an optional note or photo for today.</Text>

                <TextInput
                    placeholder="Add your note here..."
                    value={note}
                    onChangeText={setNote}
                    style={styles.input}
                    multiline
                    placeholderTextColor={theme.textSecondary}
                />

                <View style={styles.modalButtonRow}>
                    <Button title="Pick Photo" onPress={pickImage} color={Platform.OS === 'ios' ? theme.primary : undefined} />
                    <Button title="Take Photo" onPress={takePhoto} color={Platform.OS === 'ios' ? theme.primary : undefined}/>
                </View>

                {photo && (
                    <View style={styles.photoPreviewContainer}>
                        <Image source={{ uri: photo }} style={styles.photoPreview} />
                        <Pressable onPress={() => setPhoto(null)} style={styles.removePhoto}>
                             <Text style={styles.removePhotoText}>✕</Text>
                        </Pressable>
                    </View>
                )}

                <View style={[styles.modalButtonRow, styles.actionButtons]}>
                    <Button title="Cancel" onPress={handleCancelCheckIn} color={theme.textSecondary} />
                    <Button title="Save Check-in" onPress={handleCheckIn} color={Platform.OS === 'ios' ? theme.primary : undefined} />
                </View>
            </Pressable>
          </Pressable>
        </Modal>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
   addButton: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      alignSelf: 'center',
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 4,
   },
   addButtonText: {
       color: theme.white,
       fontSize: 16,
       fontWeight: '600',
   },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 17,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  listContentContainer: {
    paddingBottom: 30,
  },
  separator: {
      height: 10,
  },
  habitItem: {
    padding: 18,
    borderRadius: 12,
    backgroundColor: theme.cardBackground,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: theme.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  habitContent: {
    flex: 1,
    paddingRight: 10,
  },
  habitName: {
    fontSize: 17,
    fontWeight: '500',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  streakText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  completedHabit: {
    backgroundColor: theme.primaryLight,
    shadowOpacity: 0.05,
    elevation: 1,
  },
  completedIndicator: {
    color: theme.primaryDark,
    fontSize: 14,
    marginTop: 5,
    fontWeight: '600',
  },
  checkInSwipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    borderRadius: 12,
    backgroundColor: theme.primary,
    flex: 1,
    marginVertical: -1,
  },
  deleteAction: {
     justifyContent: 'center',
     alignItems: 'center',
     width: 90,
     borderRadius: 12,
    backgroundColor: theme.accentNegative,
    flex: 1,
    marginVertical: -1,
  },
  disabledSwipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    borderRadius: 12,
    backgroundColor: theme.disabledBackground,
    flex: 1,
    marginVertical: -1,
  },
  swipeText: {
    color: theme.white,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
   disabledSwipeText: {
     color: theme.disabledText,
     fontWeight: '600',
     fontSize: 14,
     textAlign: 'center',
     paddingHorizontal: 5,
   },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '95%',
    maxWidth: 380,
    padding: 25,
    backgroundColor: theme.cardBackground,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalTitle: {
     fontSize: 20,
     fontWeight: '600',
     marginBottom: 8,
     color: theme.textPrimary,
     textAlign: 'center',
  },
  modalSubText: {
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.white,
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: '100%',
    marginBottom: 20,
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    color: theme.textPrimary,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 15,
  },
  actionButtons: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
    paddingTop: 20,
    marginBottom: 0,
  },
  photoPreviewContainer: {
    position: 'relative',
    marginVertical: 20,
    alignItems: 'center',
  },
  photoPreview: {
    width: 130,
    height: 130,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  removePhoto: {
     position: 'absolute',
     top: -8,
     right: -8,
     backgroundColor: theme.textSecondary,
     borderRadius: 15,
     width: 30,
     height: 30,
     justifyContent: 'center',
     alignItems: 'center',
     borderWidth: 2,
     borderColor: theme.white,
     elevation: 3,
     shadowColor: theme.black,
     shadowOffset: {width: 0, height: 1},
     shadowOpacity: 0.3,
     shadowRadius: 1,
  },
  removePhotoText: {
      color: theme.white,
      fontWeight: 'bold',
      fontSize: 16,
      lineHeight: 18,
  },
});