import React, { useEffect, useRef, useState } from 'react'
import {
  Text,
  TextInput,
  Button,
  Alert,
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import uuid from 'react-native-uuid'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Habit } from '@/types'
import { theme } from '@/constants/theme'
import EmojiModal from '@/components/EmojiSelector'
import CategoryModal from '@/components/CategorySelector'

const AddHabit = () => {
  const { id } = useLocalSearchParams()
  const isEditing = !!id
  const [habit, setHabit] = useState('')
  const [habitIcon, setHabitIcon] = useState('')
  const [habitColor, setHabitColor] = useState('')
  const [habitCategory, setHabitCategory] = useState('')
  const [iconModalVisible, setIconModalVisible] = useState(false)
  const [categoryModalVisible, setCategoryModalVisible] = useState(false)
  const router = useRouter()
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    const loadHabitToEdit = async () => {
      if (id) {
        const habitsJSON = await AsyncStorage.getItem('habits')
        const habits: Habit[] = habitsJSON ? JSON.parse(habitsJSON) : []
        const habitToEdit = habits.find((h) => h.id === id)
        if (habitToEdit) {
          setHabit(habitToEdit.name)
          setHabitIcon(habitToEdit.icon)
          setHabitColor(habitToEdit.color)
          setHabitCategory(habitToEdit.category)
        }
      }
    }
    loadHabitToEdit()
    const timeout = setTimeout(() => {
      inputRef.current?.focus()
    }, 300)
    return () => clearTimeout(timeout)
  }, [id])

  const handleAddHabit = async () => {
    if (!habit.trim()) {
      Alert.alert('Please enter a habit!')
      return
    }

    try {
      const existingHabitJSON = await AsyncStorage.getItem('habits')
      const existingHabits = existingHabitJSON ? JSON.parse(existingHabitJSON) : []
      let updatedHabits

      if (isEditing) {
        updatedHabits = existingHabits.map((h: Habit) =>
          h.id === id
            ? { ...h, name: habit, icon: habitIcon, color: habitColor, category: habitCategory }
            : h
        )
      } else {
        const newHabit: Habit = {
          id: uuid.v4() as string,
          name: habit,
          icon: habitIcon,
          color: habitColor,
          category: habitCategory,
          createdAt: new Date().toISOString(),
          streak: 0,
          lastChecked: null,
          history: [],
        }
        updatedHabits = [...existingHabits, newHabit]
      }

      await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits))
      Alert.alert(isEditing ? 'Habit Updated!' : 'Habit Saved!')
      setHabit('')
      setHabitIcon('')
      router.back()
    } catch (error) {
      console.error('Error saving the habit', error)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.primaryDark }]}>
          {isEditing ? 'Edit Habit' : 'Add Habit'}
        </Text>

        <View style={styles.row}>
          <TouchableOpacity onPress={() => setIconModalVisible(true)} style={styles.selectorBox}>
            <View style={[styles.iconPreview, { backgroundColor: habitColor || '#FFDBD1' }]}>
              <Text style={styles.iconEmoji}>{habitIcon || '➕'}</Text>
            </View>
            <Text style={styles.selectorLabel}>Icon</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCategoryModalVisible(true)}
            style={styles.selectorBox}
          >
            <View style={[styles.colorCircle, { backgroundColor: habitColor || '#FFDBD1' }]} />
            <Text style={styles.selectorLabel}>Category</Text>
          </TouchableOpacity>
        </View>

        <EmojiModal
          visible={iconModalVisible}
          onClose={() => setIconModalVisible(false)}
          selected={habitIcon}
          onSelect={(emoji) => {
            setHabitIcon(emoji)
            setIconModalVisible(false)
          }}
        />

        <CategoryModal
          visible={categoryModalVisible}
          onClose={() => setCategoryModalVisible(false)}
          selected={habitColor}
          onSelect={(color, category) => {
            setHabitColor(color)
            setHabitCategory(category)
            setCategoryModalVisible(false)
          }}
        />

        <TextInput
          value={habit}
          onChangeText={setHabit}
          placeholder="Enter your habit..."
          placeholderTextColor={theme.textSecondary}
          ref={inputRef}
          style={styles.input}
        />

        <View style={styles.button}>
          <Button
            title={isEditing ? 'Update Habit' : 'Save Habit'}
            onPress={handleAddHabit}
            color={theme.primaryDark}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    borderColor: theme.border,
    color: theme.textPrimary,
    backgroundColor: theme.cardBackground,
  },
  button: {
    marginTop: 10,
  },
  iconInput: {
    alignSelf: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: 36,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginVertical: 16,
  },
  selectorBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 24,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
})

export default AddHabit
