'use client'

import { useRouter } from 'next/navigation'
import CreateTaskModal from './CreateTaskModal'

interface CreateTaskModalWrapperProps {
  onClose?: () => void
  onSave?: () => void
}

export default function CreateTaskModalWrapper({ onClose, onSave }: CreateTaskModalWrapperProps) {
  const router = useRouter()

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      router.push('/admin/tasks')
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
    } else {
      router.push('/admin/tasks')
    }
  }

  return (
    <CreateTaskModal 
      onClose={handleClose}
      onSave={handleSave}
    />
  )
}
