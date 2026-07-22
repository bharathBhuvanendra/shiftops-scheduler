import { BrowserRouter } from 'react-router-dom'
import { ScheduleRoutes } from './features/schedule/routes/ScheduleRoutes'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <ScheduleRoutes />
    </BrowserRouter>
  )
}

export default App
