import { useEffect, useState } from "react";
import { socket } from "./socket";
import { Assignment, Employee, Product } from "../types";

export const useLiveUpdatedEmployeeAndAssignmentDataThoughSocket = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const data = { product, employees, assignments };

  useEffect(() => {
    // Get inital data
    socket.emit("initial");

    socket.on("employees", (employees: Employee[]) => {
      setEmployees(employees);
    });

    socket.on("assignments", (assignments: Assignment[]) => {
      setAssignments(assignments);
    });

    socket.on("product", (updatedProduct: Product) => {
      setProduct(updatedProduct);
    });

    socket.on("assignment_add", (assignment: Assignment) => {
      console.log("New assignment received", assignment);
      setAssignments((assignments) => [
        ...assignments,
        assignment,
      ]);
    });

    socket.on("assignment_remove", (assignmentId: string) => {
      setAssignments(assignments => [
        ...assignments.filter(
          assignment => assignment._id.toString() !== assignmentId)
      ]);
    });

    socket.on("reconnect", () => {
      socket.emit("initial");
    });

    return () => {
      socket.off("employees");
      socket.off("assignments");
      socket.off("product");
      socket.off("assignment_add");
      socket.off("assignment_remove");
      socket.off("reconnect");
    }
  }, []);

  return data;
}
