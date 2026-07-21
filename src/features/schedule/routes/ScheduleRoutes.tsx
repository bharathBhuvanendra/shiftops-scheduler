import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { ScheduleDatePage } from '../pages/ScheduleDatePage'
import { SchedulePage } from '../pages/SchedulePage'
import { ScheduleRulesPage } from '../pages/ScheduleRulesPage'
import { TeamPage } from '../pages/TeamPage'

function ScheduleNavigation() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'active' : undefined

  return (
    <nav>
      <ul>
        <li>
          <NavLink to="/schedule" className={linkClass}>
            Schedule
          </NavLink>
        </li>
        <li>
          <NavLink to="/schedule-rules" className={linkClass}>
            Schedule Rules
          </NavLink>
        </li>
        <li>
          <NavLink to="/team" className={linkClass}>
            Team
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}

export function ScheduleRoutes() {
  return (
    <>
      <ScheduleNavigation />
      <Routes>
        <Route path="/" element={<Navigate replace to="/schedule" />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/schedule/:date" element={<ScheduleDatePage />} />
        <Route path="/schedule-rules" element={<ScheduleRulesPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="*" element={<main><h1>Page not found</h1></main>} />
      </Routes>
    </>
  )
}
