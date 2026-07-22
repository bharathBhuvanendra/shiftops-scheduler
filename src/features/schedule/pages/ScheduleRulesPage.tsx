import { useState } from 'react'
import { FixedScheduleRuleForm } from '../components/FixedScheduleRuleForm'
import { RecurringRuleChangeForm } from '../components/RecurringRuleChangeForm'
import type { EmployeeRole } from '../domain/employee.types'
import type { FixedScheduleRule } from '../domain/fixed-schedule-rule.types'
import { useScheduleStore } from '../store/schedule.store'

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const roleLabels: Record<EmployeeRole, string> = {
  manager: 'Manager',
  front_desk: 'Front Desk',
  trainer: 'Trainer',
  cleaner: 'Cleaner',
  staff: 'Staff',
}

export function ScheduleRulesPage() {
  const { employees, fixedRules, addFixedRule, replaceFixedRuleFromDate } = useScheduleStore()
  const [isCreating, setIsCreating] = useState(false)
  const [editingRule, setEditingRule] = useState<FixedScheduleRule | null>(null)

  const employeeNames = new Map(employees.map((employee) => [employee.id, employee.name]))

  return (
    <main>
      <div className="schedule-rules__title-row">
        <div>
          <h1>Schedule Rules</h1>
          <p>Manage the recurring rules used to generate calendar shifts.</p>
        </div>
        <button
          type="button"
          className="schedule-rules__create"
          onClick={() => {
            setIsCreating(true)
            setEditingRule(null)
          }}
        >
          Add recurring rule
        </button>
      </div>

      {isCreating ? (
        <FixedScheduleRuleForm
          employees={employees}
          onCancel={() => setIsCreating(false)}
          onCreate={(rule) => {
            addFixedRule(rule)
            setIsCreating(false)
          }}
        />
      ) : null}

      {editingRule ? (
        <RecurringRuleChangeForm
          date={new Date().toLocaleDateString('en-CA')}
          rule={editingRule}
          onCancel={() => setEditingRule(null)}
          onApply={(newRule) => {
            replaceFixedRuleFromDate({
              oldRuleId: editingRule.id,
              effectiveFrom: newRule.effectiveFrom,
              newRule,
            })
            setEditingRule(null)
          }}
        />
      ) : null}

      <section className="schedule-rules" aria-labelledby="fixed-rules-heading">
        <div className="schedule-rules__header">
          <h2 id="fixed-rules-heading">Fixed schedule rules</h2>
          <p>{fixedRules.length} rule{fixedRules.length === 1 ? '' : 's'}</p>
        </div>

        <div className="schedule-rules__table-wrap">
          <table className="schedule-rules__table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Weekdays</th>
                <th>Time</th>
                <th>Role</th>
                <th>Effective dates</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fixedRules.map((rule) => (
                <tr key={rule.id}>
                  <td>{employeeNames.get(rule.employeeId) ?? rule.employeeId}</td>
                  <td>{rule.weekdays.map((weekday) => weekdayLabels[weekday]).join(', ')}</td>
                  <td>{rule.startTime}–{rule.endTime}</td>
                  <td>{roleLabels[rule.role]}</td>
                  <td>{rule.effectiveFrom} to {rule.effectiveTo ?? 'Ongoing'}</td>
                  <td>{rule.isActive ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button
                      type="button"
                      className="schedule-rules__edit"
                      disabled={!rule.isActive}
                      onClick={() => {
                        setEditingRule(rule)
                        setIsCreating(false)
                      }}
                    >
                      Change from date
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
