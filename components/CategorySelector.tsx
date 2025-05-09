import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Modal from 'react-native-modal'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/constants/theme'
import { CategoryModalProps } from '@/interfaces'
import { colorCategories } from '@/constants/colorCategory'

const CategoryModal: React.FC<CategoryModalProps> = ({ visible, onClose, onSelect }) => {
  return (
    <Modal isVisible={visible} onBackdropPress={onClose} style={styles.modal} backdropOpacity={0.4}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Select Color</Text>
          <View style={{ width: 24 }} />
        </View>

        {colorCategories.map(({ name, color }) => (
          <TouchableOpacity
            key={name}
            style={styles.option}
            onPress={() => {
              onSelect(color, name)
              onClose()
            }}
          >
            <View style={[styles.colorCircle, { backgroundColor: color }]} />
            <Text style={styles.categoryText}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    color: theme.textPrimary,
  },
})

export default CategoryModal
