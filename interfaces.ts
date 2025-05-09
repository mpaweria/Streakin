export interface EmojiModalProps {
  visible: boolean
  onClose: () => void
  onSelect: (choice: string) => void
  selected: string
}

export interface CategoryModalProps {
  visible: boolean
  onClose: () => void
  onSelect: (color: string, category: string) => void
  selected: string
}
