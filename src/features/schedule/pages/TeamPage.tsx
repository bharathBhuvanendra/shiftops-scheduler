import { useMemo, useState, type FormEvent } from 'react'
import { useScheduleStore } from '../store/schedule.store'
import { employeeRoleOptions } from '../components/shift-editor.schema'
import type { EmployeeRole } from '../domain/employee.types'

const roleLabels: Record<EmployeeRole, string> = {
  manager: 'Manager',
  front_desk: 'Front Desk',
  trainer: 'Trainer',
  cleaner: 'Cleaner',
  staff: 'Staff',
}

export function TeamPage() {
  const { employees, addEmployee, toggleEmployeeActive } = useScheduleStore()
  const activeEmployees = useMemo(() => employees.filter((employee) => employee.isActive), [employees])

  const [name, setName] = useState('')
  const [role, setRole] = useState<EmployeeRole>('staff')
  const [color, setColor] = useState('#2563eb')
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim()) {
      setError('Employee name is required.')
      return
    }

    const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `employee-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    addEmployee({
      id,
      name: name.trim(),
      role,
      color,
      isActive: true,
    })

    setName('')
    setRole('staff')
    setColor('#2563eb')
    setError('')
  }

  return (
    <main>
      <h1>Team</h1>
      <section className="team-overview" aria-labelledby="team-overview-heading">
        <div className="team-overview__header">
          <h2 id="team-overview-heading">Employees</h2>
          <p>{activeEmployees.length} active employee{activeEmployees.length === 1 ? '' : 's'}</p>
        </div>

        <div className="team-overview__list">
          <table className="team-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Color</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{roleLabels[employee.role]}</td>
                  <td>
                    <span className="team-color-swatch" style={{ background: employee.color }} aria-label={`${employee.name} color`} />
                    {employee.color}
                  </td>
                  <td>{employee.isActive ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button
                      type="button"
                      className="team-toggle-status"
                      onClick={() => toggleEmployeeActive(employee.id)}
                    >
                      {employee.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="team-creation" aria-labelledby="team-creation-heading">
        <h2 id="team-creation-heading">Add employee</h2>
        <form className="team-form" onSubmit={handleSubmit}>
          <div className="team-form__row">
            <label htmlFor="employee-name">Name</label>
            <input
              id="employee-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="team-form__row">
            <label htmlFor="employee-role">Role</label>
            <select
              id="employee-role"
              value={role}
              onChange={(event) => setRole(event.target.value as EmployeeRole)}
            >
              {employeeRoleOptions.map((option) => (
                <option key={option} value={option}>
                  {roleLabels[option]}
                </option>
              ))}
            </select>
          </div>

          <div className="team-form__row">
            <label htmlFor="employee-color">Color</label>
            <input
              id="employee-color"
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
            />
          </div>

          {error ? <div className="team-form__error">{error}</div> : null}

          <button type="submit" className="team-form__submit">
            Add employee
          </button>
        </form>
      </section>
    </main>
  )
}
