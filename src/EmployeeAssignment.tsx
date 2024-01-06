import React from "react";
import { useLiveUpdatedEmployeeAndAssignmentDataThoughSocket } from "./hooks";
import { MarketingChannels } from "../types";
import ChannelAssignment from "./ChannelAssignment";

const channels: MarketingChannels[] = ["GoogleAds", "TV", "Newspapers"];

const EmployeeAssignment = () => {
  // This hook will return the latest employee and assignment data for the given channel and product, and re-render whenever it gets new data from the server
  // employees: Employee[];
  // assignments: Assignment[];
  const { employees, assignments, product } = useLiveUpdatedEmployeeAndAssignmentDataThoughSocket();

  const idleEmployees = employees.filter(
    (employee) => !assignments.some(
      (assignment) => assignment.employeeId === employee._id)
  );

  const estimatedSoldProducts = Object.values(product?.marketingPoints || {}).reduce((a, b) => a + b, 0) * 100

  return (
    <div>
      {
        !!idleEmployees.length && 
        (
          <p>Unassigned employees:</p>
        )
      }
      
      {
        !idleEmployees.length && 
        (
          <h3 className="all_employees_assigned">You have assigned all employees!</h3>
        )
      }
      {idleEmployees.map((employee) => (
        <button
          key={employee._id.toString()}
          className="btn_unassigned"
          disabled
        >
          {employee.name}
        </button>
      ))}

      {channels.map((channel) => (
        <ChannelAssignment
          key={channel}
          channel={channel}
          employees={employees}
          product={product}
          idleEmployees={idleEmployees}
          assignments={assignments}
        />
      ))}

      <h2 className="estimated_products_sold">
        Estimated products sold: {estimatedSoldProducts}
      </h2>
    </div>
  );
};

export default EmployeeAssignment;
