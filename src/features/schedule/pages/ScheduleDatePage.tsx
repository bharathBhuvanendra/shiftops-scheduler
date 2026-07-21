import { useParams } from 'react-router-dom'

export function ScheduleDatePage() {
  const { date } = useParams<{ date: string }>()

  return (
    <main>
      <h1>Schedule date</h1>
      <p>Viewing schedule for: <strong>{date ?? 'unknown date'}</strong></p>
      <p>This is a placeholder page for a specific schedule date.</p>
    </main>
  )
}
