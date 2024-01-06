import React from "react";
import { Assignment, Employee, MarketingChannels, Product } from "../types";
import { socket } from "./socket";

type Props = {
  employees: Employee[];
  idleEmployees: Employee[];
  assignments: Assignment[];
  channel: MarketingChannels;
  product: Product | null;
}

const ChannelAssignment = (props: Props) => {
  const {
    channel,
    employees,
    idleEmployees,
    assignments,
    product
  } = props;

  const assignmentsForChannelProduct = assignments.filter(
    (assignment) => assignment.channel === channel
  );

  const handleUnassign = (assignment: Assignment) => {
    socket.emit("unassign", assignment._id);
    console.warn('unassigned the following employee: ', assignment)
  }

  const handleAssign = () => {
    const idleEmployee = idleEmployees[0];
    socket.emit("assign", {
      channel,
      employeeId: idleEmployee._id,
    });
    console.warn("assigned the following employee: ", idleEmployee)
  }

  return (
    <div>
      <p>{product?.marketingPoints[channel] || 0} Assignments in {channel}</p>

      {assignmentsForChannelProduct.map((assignment) => (
        <button
          key={assignment._id.toString()}
          onClick={() => handleUnassign(assignment)}
          className="btn_assigned"
        >
          Unassign {employees.find(e => e._id === assignment.employeeId)?.name || "<Could not find employee>"}
        </button>
      ))}

      {!!idleEmployees.length && (
        <button onClick={handleAssign} className="btn_assign">
          Assign Employee To {channel}
        </button>
      )}
    </div>
  );
};

export default ChannelAssignment;
