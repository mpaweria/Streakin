import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Modal from 'react-native-modal'
import EmojiSelector from 'react-native-emoji-selector'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/constants/theme'
import { EmojiModalProps } from '@/interfaces'

const EmojiModal: React.FC<EmojiModalProps> = ({ visible, onClose, onSelect, selected }) => {
  const [tempSelectedEmoji, setTempSelectedEmoji] = useState<string | null>(selected)

  const handleEmojiSelect = (emoji: string) => {
    setTempSelectedEmoji(emoji)
  }

  const handleSaveEmoji = () => {
    if (tempSelectedEmoji) {
      onSelect(tempSelectedEmoji)
    }
    onClose()
  }

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.4}
      avoidKeyboard={false}
    >
      <View style={styles.popupContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Select Icon</Text>
            <TouchableOpacity onPress={handleSaveEmoji}>
              <Ionicons name="checkmark" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.emojiPreview}>
            <Text style={styles.emoji}>{tempSelectedEmoji || '😀'}</Text>
          </View>

          <View style={styles.picker}>
            <EmojiSelector
              onEmojiSelected={handleEmojiSelect}
              showSearchBar={true}
              showHistory={true}
              showTabs={true}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  popupContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 8,
    flexDirection: 'column',
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  emojiPreview: {
    alignItems: 'center',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 64,
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 30,
    overflow: 'hidden',
  },
  picker: {
    flex: 1,
    paddingBottom: 0,
    backgroundColor: 'white',
  },
})

export default EmojiModal
