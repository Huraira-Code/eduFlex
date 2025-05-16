import React from "react";

function ProjectProgressBar({ tasks = [] }) {
  console.log("Tasks:", tasks); // Debugging

  // Convert all task statuses to lowercase to ensure case insensitivity
  const totalTasks = tasks.length;
  const inProgress = tasks.filter(
    (task) => task?.Progress?.toLowerCase() === "in progress"
  ).length;
  const submitted = tasks.filter(
    (task) => task?.Progress?.toLowerCase() === "submitted"
  ).length;
  const completed = tasks.filter(
    (task) => task?.Progress?.toLowerCase() === "completed"
  ).length;

  // Calculate the percentage for each status based on the total number of tasks
  const inProgressPercentage = (inProgress / totalTasks) * 100 || 0;
  const submittedPercentage = (submitted / totalTasks) * 100 || 0;
  const completedPercentage = (completed / totalTasks) * 100 || 0;

  // Total progress: just completed and submitted counts
  const totalProgress = submittedPercentage + completedPercentage;

  return (
    <div style={{ width: "100%", margin: "2rem auto" }}>
      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Project Progress - Tasks Overview
      </h3>
      <div
        style={{
          backgroundColor: "#e0e0e0",
          borderRadius: "10px",
          height: "25px",
          overflow: "hidden",
          display: "flex",
        }}
      >
        {/* In Progress tasks - Blue */}
        <div
          style={{
            width: `${inProgressPercentage}%`,
            backgroundColor: "#f44336", // Blue for "In Progress"
            height: "100%",
          }}
        ></div>

        {/* Submitted tasks - Yellow */}
        <div
          style={{
            width: `${submittedPercentage}%`,
            backgroundColor: "#ffeb3b", // Yellow for "Submitted"
            height: "100%",
          }}
        ></div>

        {/* Completed tasks - Green */}
        <div
          style={{
            width: `${completedPercentage}%`,
            backgroundColor: "#4caf50", // Green for "Completed"
            height: "100%",
          }}
        ></div>
      </div>

      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <strong>Total Progress: {Math.round(totalProgress)}%</strong>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: "20px",
          textAlign: "center",
        }}
      >
        <div>
          <strong>Total Tasks:</strong> {totalTasks}
        </div>
        <div>
          <strong>Total Tasks In Progress:</strong> {inProgress}
        </div>
        <div>
          <strong>Total Tasks Submitted:</strong> {submitted}
        </div>
        <div>
          <strong>Total Tasks Completed:</strong> {completed}
        </div>
      </div>
    </div>
  );
}

export default ProjectProgressBar;
