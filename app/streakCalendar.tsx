import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Link, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from '../types';
import Calendar from '../components/Calendar';
import Trend from '../components/Trend';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { theme } from '@/constants/theme';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);


const StreakCalendar = () => {
  const { id, streak: streakParam } = useLocalSearchParams<{ id: string; streak?: string }>();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'trend'>('calendar');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHabitInfo, setSelectedHabitInfo] = useState<{
    date: string;
    note: string | null;
    photo: string | null;
  } | null>(null);

  const fetchHabit = useCallback(async () => {
    if (!id) {
        setError("Habit ID is missing.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    setHabit(null);

    try {
      const habitsJSON = await AsyncStorage.getItem('habits');

      if (habitsJSON) {
        const allHabits: Habit[] = JSON.parse(habitsJSON);
        const currentHabit = allHabits.find((h: Habit) => h.id === id);

        if (currentHabit) {
          setHabit(currentHabit);
        } else {
           setError(`Habit data not found. It might have been deleted or the ID is incorrect.`);
        }
      } else {
         setError('No habits found in storage.');
      }
    } catch (e: any) {
       setError(`Failed to load habit data: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      const run = async () => {
        await fetchHabit();
      };
      run();
      return;
    }, [fetchHabit])
  );

  const openModal = (selectedDate: string) => {
    if (!habit || !habit.history) {
        return;
    }

    const habitData = habit.history.find((entry) => entry.date === selectedDate);

    if (habitData) {
      setSelectedHabitInfo({
        date: selectedDate,
        note: habitData.note ?? null,
        photo: habitData.photo ?? null,
      });
      setModalVisible(true);
    } else {
      setSelectedHabitInfo({ date: selectedDate, note: "No check-in recorded for this date.", photo: null });
      setModalVisible(true);
    }
  };

  const getHabitStats = useCallback(() => {
    if (!habit || !habit.history || habit.history.length === 0) return null;

    const doneDays = habit.history.map(entry => entry.date);
    const sorted = [...new Set(doneDays)].sort();

    let longestStreak = 0;
    let currentCalcStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sorted.length; i++) {
        if (i === 0 || dayjs(sorted[i]).diff(dayjs(sorted[i - 1]), 'day') === 1) {
            tempStreak += 1;
        } else {
              if (dayjs(sorted[i]).diff(dayjs(sorted[i-1]), 'day') > 1) {
                tempStreak = 1;
             }
        }
         longestStreak = Math.max(longestStreak, tempStreak);
    }

    const todayStr = dayjs().format('YYYY-MM-DD');
    const yesterdayStr = dayjs().subtract(1, 'day').format('YYYY-MM-DD');


     if (sorted.includes(todayStr)) {
        currentCalcStreak = 1;
        let dayToCheck = dayjs(todayStr).subtract(1, 'day');
        while (sorted.includes(dayToCheck.format('YYYY-MM-DD'))) {
            currentCalcStreak += 1;
            dayToCheck = dayToCheck.subtract(1, 'day');
        }
     } else if (sorted.includes(yesterdayStr)) {
           currentCalcStreak = 1;
           let dayToCheck = dayjs(yesterdayStr).subtract(1, 'day');
             while (sorted.includes(dayToCheck.format('YYYY-MM-DD'))) {
                 currentCalcStreak += 1;
                 dayToCheck = dayToCheck.subtract(1, 'day');
             }
     } else {
        currentCalcStreak = 0;
     }

    const totalCompletions = sorted.length;
    const now = dayjs();
    const daysInCurrentMonth = now.daysInMonth();
    const firstDayOfMonth = now.startOf('month');
    const lastDayOfMonth = now.endOf('month');

    const doneThisMonth = sorted.filter(d => {
        const dateObj = dayjs(d);
        return dateObj.isSameOrAfter(firstDayOfMonth, 'day') && dateObj.isSameOrBefore(lastDayOfMonth, 'day');
    }).length;

    const consistency = daysInCurrentMonth > 0 ? Math.round((doneThisMonth / daysInCurrentMonth) * 100) : 0;

    return {
      currentStreak: currentCalcStreak,
      longestStreak,
      totalCompletions,
      consistency,
    };
  }, [habit]);

  const stats = getHabitStats();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading Calendar...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
     return (
        <SafeAreaView style={styles.centered}>
            <Text style={styles.errorText}>Error:</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Link href="/">
                <Text style={styles.link}>Go Back Home</Text>
            </Link>
        </SafeAreaView>
     );
  }

  if (!habit) {
     return (
        <SafeAreaView style={styles.centered}>
            <Text>Habit data could not be loaded or not found.</Text>
            <Link href="/">
                <Text style={styles.link}>Go Back Home</Text>
            </Link>
        </SafeAreaView>
     );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>{habit.name}</Text>
        <Text style={styles.streakText}>Current Streak: {stats?.currentStreak ?? streakParam ?? 0}</Text>

        <View style={styles.toggleContainer}>
           <TouchableOpacity onPress={() => setViewMode('calendar')} style={viewMode === 'calendar' ? styles.activeToggle : styles.inactiveToggle}>
            <Text style={viewMode === 'calendar' ? styles.activeToggleText : styles.toggleText}>Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('trend')} style={viewMode === 'trend' ? styles.activeToggle : styles.inactiveToggle}>
            <Text style={viewMode === 'trend' ? styles.activeToggleText : styles.toggleText}>Trend</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
            {viewMode === 'calendar' ? (
            <Calendar habit={habit} openModal={openModal} />
            ) : (
            <Trend habit={habit} />
            )}
        </View>

         {stats ? (
            <View style={styles.summaryContainer}>
               <Text style={styles.summaryTitle}>Habit Statistics</Text>
               <Text style={styles.summaryText}>🔥 Current Streak: {stats.currentStreak}</Text>
               <Text style={styles.summaryText}>🏆 Longest Streak: {stats.longestStreak}</Text>
               <Text style={styles.summaryText}>✅ Total Days Done: {stats.totalCompletions}</Text>
               <Text style={styles.summaryText}>📅 This Month's Consistency: {stats.consistency}%</Text>
            </View>
            ) : (
            <Text style={styles.noStatsText}>
                Start tracking this habit to see statistics!
            </Text>
        )}

        <Link href={{ pathname: '/addHabit', params: { id: habit.id } }} asChild>
           <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit Habit</Text>           
           </TouchableOpacity>
        </Link>


      </View>
       <Modal
        visible={modalVisible}
         animationType="fade"
         transparent={true}
         onRequestClose={() => setModalVisible(false)}
       >
         <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setModalVisible(false)}
         >
            <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                <Text style={styles.modalDate}>{selectedHabitInfo?.date ? `Details for ${dayjs(selectedHabitInfo.date).format('MMMM D, YYYY')}` : 'Details'}</Text>
                {selectedHabitInfo?.note && (
                <Text style={styles.modalNote}>{selectedHabitInfo.note}</Text>
                )}
                {selectedHabitInfo?.photo ? (
                  <View> 
                    <Image
                      source={{ uri: selectedHabitInfo.photo }}
                      style={styles.modalImage}
                      resizeMode="contain"
                      onError={(e) => {
                        console.error(`Image failed to load: ${selectedHabitInfo.photo}`);
                        console.error(e.nativeEvent.error);
                      }}
                    />
                  </View>
                ) : (
                  selectedHabitInfo?.date && !selectedHabitInfo?.note && <Text style={styles.modalNote}>Check-in recorded (no photo).</Text>
                )}
                {!selectedHabitInfo?.photo && !selectedHabitInfo?.note && selectedHabitInfo?.note?.includes("No check-in") && (
                     <Text style={styles.modalNote}>{selectedHabitInfo.note}</Text>
                )}

                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: theme.textPrimary,
  },
  streakText: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 15,
    color: theme.textSecondary,
  },
  link: {
    color: theme.primary,
    marginTop: 10,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
    backgroundColor: theme.borderLight,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  inactiveToggle: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  activeToggle: {
    backgroundColor: theme.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  toggleText: {
    color: theme.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeToggleText: {
    color: theme.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 15,
    marginHorizontal: 5,
    shadowColor: theme.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: theme.textPrimary,
  },
  summaryText: {
    fontSize: 15,
    marginBottom: 8,
    color: theme.textSecondary,
  },
  noStatsText: {
    textAlign: 'center',
    marginTop: 15,
    color: theme.disabledText,
    fontStyle: 'italic',
  },
  editButton: {
    backgroundColor: theme.disabledBackground,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  editButtonText: {
    color: theme.textPrimary,
    fontWeight: '500',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.modalOverlay,
  },
  modalContainer: {
    width: '85%',
    maxWidth: 350,
    backgroundColor: theme.cardBackground,
    padding: 25,
    borderRadius: 20,
  },
  modalDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: theme.textPrimary,
  },
  modalNote: {
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 10,
  },
  modalImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
  },
  closeButton: {
    backgroundColor: theme.primary,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: theme.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
      color: theme.accentNegative,
      textAlign: 'center',
      marginBottom: 5,
  },
});


export default StreakCalendar;