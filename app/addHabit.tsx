// import React, { useEffect, useState } from 'react'
// import { Text, TextInput, Button, Alert, SafeAreaView, StyleSheet } from 'react-native'
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import uuid from 'react-native-uuid'
// import { useLocalSearchParams, useRouter } from 'expo-router'
// import { Habit } from '@/types'

// const AddHabit = () => {
//     const { id } = useLocalSearchParams()
//     const isEditing = !!id
//     const [habit, setHabit] = useState('')
//     const router = useRouter()

//     useEffect(() => {
//         const loadHabitToEdit = async () => {
//           if (id) {
//             const habitsJSON = await AsyncStorage.getItem('habits')
//             const habits: Habit[] = habitsJSON ? JSON.parse(habitsJSON) : []
//             const habitToEdit = habits.find(h => h.id === id)
//             if (habitToEdit) 
//                 setHabit(habitToEdit.name)
//           }
//         }
//         loadHabitToEdit()
//       }, [id])

//     const handleAddHabit = async () => {
//         if(!habit.trim()) {
//             Alert.alert('Please enter a habit!')
//             return;
//         }

//         try {
//             const existingHabitJSON = await AsyncStorage.getItem('habits')
//             const existingHabits = existingHabitJSON ? JSON.parse(existingHabitJSON) : []
//             let updatedHabits;

//             if(isEditing) {
//                 updatedHabits = existingHabits.map(((h: Habit) => h.id === id ? {...h, name: habit} : h))
//             } else {
//                 const newHabit: Habit = {
//                     id: uuid.v4(),
//                     name: habit,
//                     createdAt: new Date().toISOString(),
//                     streak: 0,
//                     lastChecked: null,
//                     history: []
//                 }
//                 updatedHabits = [...existingHabits, newHabit]
//             }
//             await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits))
//             Alert.alert(isEditing ? 'Habit Updated!' : 'Habit saved!')
//             setHabit('')
//             router.back()
//         } catch(error) {
//             console.error('Error saving the habit', error)
//         }
//     }

//     return (
//         <SafeAreaView style={styles.container}>
//           <Text style={styles.title}>{isEditing ? 'Edit Habit' : 'Add Habit'}</Text>
//           <TextInput 
//             value={habit}
//             onChangeText={setHabit}
//             placeholder='Add new Habit!'
//             style={styles.input}
//           />
//           <Button title={isEditing ? 'Update Habit' : 'Save Habit'} onPress={handleAddHabit} />
//         </SafeAreaView>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       padding: 20,
//       justifyContent: 'center',
//     },
//     input: {
//       borderWidth: 1,
//       padding: 10,
//       marginVertical: 10,
//       borderRadius: 5,
//     },
//     title: {
//       fontSize: 24,
//       fontWeight: 'bold',
//       marginBottom: 20
//     }
//   })
  

// export default AddHabit

import React, { useEffect, useState } from 'react'
import {
  Text,
  TextInput,
  Button,
  Alert,
  SafeAreaView,
  StyleSheet,
  View
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import uuid from 'react-native-uuid'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Habit } from '@/types'
import { theme } from '@/constants/theme'

const AddHabit = () => {
  const { id } = useLocalSearchParams()
  const isEditing = !!id
  const [habit, setHabit] = useState('')
  const router = useRouter()

  useEffect(() => {
    const loadHabitToEdit = async () => {
      if (id) {
        const habitsJSON = await AsyncStorage.getItem('habits')
        const habits: Habit[] = habitsJSON ? JSON.parse(habitsJSON) : []
        const habitToEdit = habits.find(h => h.id === id)
        if (habitToEdit) setHabit(habitToEdit.name)
      }
    }
    loadHabitToEdit()
  }, [id])

  const handleAddHabit = async () => {
    if (!habit.trim()) {
      Alert.alert('Please enter a habit!')
      return
    }

    try {
      const existingHabitJSON = await AsyncStorage.getItem('habits')
      const existingHabits = existingHabitJSON
        ? JSON.parse(existingHabitJSON)
        : []
      let updatedHabits

      if (isEditing) {
        updatedHabits = existingHabits.map((h: Habit) =>
          h.id === id ? { ...h, name: habit } : h
        )
      } else {
        const newHabit: Habit = {
          id: uuid.v4() as string,
          name: habit,
          createdAt: new Date().toISOString(),
          streak: 0,
          lastChecked: null,
          history: []
        }
        updatedHabits = [...existingHabits, newHabit]
      }

      await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits))
      Alert.alert(isEditing ? 'Habit Updated!' : 'Habit Saved!')
      setHabit('')
      router.back()
    } catch (error) {
      console.error('Error saving the habit', error)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primaryDark }]}>
        {isEditing ? 'Edit Habit' : 'Add Habit'}
      </Text>

      <TextInput
        value={habit}
        onChangeText={setHabit}
        placeholder="Enter your habit..."
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            borderColor: theme.border,
            color: theme.textPrimary,
            backgroundColor: theme.cardBackground
          }
        ]}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={isEditing ? 'Update Habit' : 'Save Habit'}
          onPress={handleAddHabit}
          color={theme.primaryDark}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center'
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20
  },
  buttonContainer: {
    marginTop: 10
  }
})

export default AddHabit
