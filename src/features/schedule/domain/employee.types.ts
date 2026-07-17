export type EmployeeRole = "manager" | "front_desk" | "trainer" | "cleaner" | "staff";

export type Employee = {
  id: string;
  name: string;
  role: EmployeeRole;
  color: string;
  isActive: boolean;
};