// import React from 'react';
// import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, ViewStyle } from 'react-native';
// import dayjs from 'dayjs';
// import { CalendarDayItem, Habit } from '../types';

// interface CalendarProps {
//   habit: Habit;
//   openModal: (selectedDate: string) => void;
// }

// const Calendar: React.FC<CalendarProps> = ({ habit, openModal }) => {
//   if (!habit) return null;

//   const currentMonthStart = dayjs().startOf('month');
//   const currentMonthEnd = dayjs().endOf('month');
//   const daysInMonth = currentMonthEnd.date();

//   const calendarData: CalendarDayItem[] = [];
//   for (let day = 1; day <= daysInMonth; day++) {
//     const currentDay = currentMonthStart.date(day);
//     const formattedDate = currentDay.format('YYYY-MM-DD');
//     const habitData = habit.history.find((entry) => entry.date === formattedDate);

//     const isChecked = Boolean(habitData);
//     const hasPhoto = Boolean(habitData?.photo);
//     const hasNote = Boolean(habitData?.note);
//     const isToday = dayjs().isSame(currentDay, 'day');
//     const isInteractive = hasPhoto || hasNote;

//     calendarData.push({
//       date: formattedDate,
//       isChecked,
//       hasPhoto,
//       hasNote,
//       isToday,
//       isInteractive,
//       photo: habitData?.photo || null,
//     });
//   }

//   const getStyleForDay = (item: CalendarDayItem): ViewStyle => {
//     let cellStyle: ViewStyle = { ...styles.dayCell };

//     if (item.isChecked && !item.hasPhoto) {
//       cellStyle = {
//         ...cellStyle,
//         backgroundColor: '#4CAF50',
//         borderColor: '#ccc',
//       };
//     }

//     if (item.hasNote && !item.hasPhoto) {
//       cellStyle = {
//         ...cellStyle,
//         borderStyle: 'dashed',
//         borderWidth: 2,
//         borderColor: '#FF9800',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.3,
//         shadowRadius: 3,
//         elevation: 3,
//       };
//     }

//     if (item.isToday) {
//       cellStyle = {
//         ...cellStyle,
//         borderWidth: 2,
//         borderColor: '#007bff',
//       };
//     }

//     return cellStyle;
//   };

//   return (
//     <FlatList
//       data={calendarData}
//       numColumns={7}
//       renderItem={({ item }) => {
//         const dayContent = (
//           <View style={getStyleForDay(item)}>
//             {item.hasPhoto && (
//               <Image
//                 source={{ uri: item.photo! }}
//                 style={styles.dayPhoto}
//                 resizeMode="cover"
//               />
//             )}
//             <Text style={styles.dayText}>{dayjs(item.date).date()}</Text>
//           </View>
//         );

//         return item.isInteractive ? (
//           <TouchableOpacity onPress={() => openModal(item.date)}>
//             {dayContent}
//           </TouchableOpacity>
//         ) : (
//           dayContent
//         );
//       }}
//       keyExtractor={(item) => item.date}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   dayCell: {
//     width: 40,
//     height: 40,
//     margin: 2,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     backgroundColor: '#fff',
//     overflow: 'hidden',
//   },
//   dayText: {
//     fontSize: 12,
//     color: '#000',
//     zIndex: 2,
//   },
//   dayPhoto: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     borderRadius: 5,
//   },
// });

// export default Calendar;

import React from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, ViewStyle } from 'react-native'
import dayjs from 'dayjs'
import { CalendarDayItem, Habit } from '../types'
import { theme } from '@/constants/theme'

interface CalendarProps {
  habit: Habit
  openModal: (selectedDate: string) => void
}

const Calendar: React.FC<CalendarProps> = ({ habit, openModal }) => {
  if (!habit) return null

  const currentMonthStart = dayjs().startOf('month')
  const currentMonthEnd = dayjs().endOf('month')
  const daysInMonth = currentMonthEnd.date()

  const calendarData: CalendarDayItem[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDay = currentMonthStart.date(day)
    const formattedDate = currentDay.format('YYYY-MM-DD')
    const habitData = habit.history.find((entry) => entry.date === formattedDate)

    const isChecked = Boolean(habitData)
    const hasPhoto = Boolean(habitData?.photo)
    const hasNote = Boolean(habitData?.note)
    const isToday = dayjs().isSame(currentDay, 'day')
    const isInteractive = hasPhoto || hasNote

    calendarData.push({
      date: formattedDate,
      isChecked,
      hasPhoto,
      hasNote,
      isToday,
      isInteractive,
      photo: habitData?.photo || null,
    })
  }

  const getStyleForDay = (item: CalendarDayItem): ViewStyle => {
    let cellStyle: ViewStyle = { ...styles.dayCell }

    if (item.isChecked && !item.hasPhoto) {
      cellStyle.backgroundColor = theme.primaryDark
      cellStyle.borderColor = theme.border
    }

    if (item.hasNote && !item.hasPhoto) {
      cellStyle = {
        ...cellStyle,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#FF9800',
        shadowColor: theme.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
      }
    }

    if (item.isToday) {
      cellStyle.borderWidth = 2
      cellStyle.borderColor = theme.primary
    }

    return cellStyle
  }

  return (
    <View style={styles.calendarContainer}>
      <FlatList
        data={calendarData}
        numColumns={7}
        renderItem={({ item }) => {
          const dayContent = (
            <View style={getStyleForDay(item)}>
              {item.hasPhoto && (
                <Image source={{ uri: item.photo! }} style={styles.dayPhoto} resizeMode="cover" />
              )}
              <Text
                style={[
                  styles.dayText,
                  {
                    color: item.isChecked ? theme.white : theme.black,
                  },
                ]}
              >
                {dayjs(item.date).date()}
              </Text>
            </View>
          )

          return item.isInteractive ? (
            <TouchableOpacity onPress={() => openModal(item.date)}>{dayContent}</TouchableOpacity>
          ) : (
            dayContent
          )
        }}
        keyExtractor={(item) => item.date}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  calendarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  dayCell: {
    width: 42,
    height: 42,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.primaryLight,
    overflow: 'hidden',
  },
  dayText: {
    fontSize: 12,
    zIndex: 2,
  },
  dayPhoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 5,
  },
})

export default Calendar
