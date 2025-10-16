'use client'

import { useRouter } from 'next/navigation'
import CreateTaskModal from './CreateTaskModal'

export default function CreateTaskModalWrapper() {
  const router = useRouter()

  const handleClose = () => {
    console.log('CreateTaskModalWrapper handleClose called - NAVIGATING AWAY')
    router.push('/admin/tasks')
  }

  const handleSave = () => {
    console.log('CreateTaskModalWrapper handleSave called - NAVIGATING AWAY')
    router.push('/admin/tasks')
  }

  return (
    <CreateTaskModal 
      onClose={handleClose}
      onSave={handleSave}
    />
  )
}
