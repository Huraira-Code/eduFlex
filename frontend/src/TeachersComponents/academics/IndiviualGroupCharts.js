import React from "react";
import { Doughnut } from "react-chartjs-2";
import StudentTaskBarChart from "./StudentTaskBarChart";
import StudentMarksLineChart from "./StudentMarksLineChart";
import StudentMarksLeaderboard from "./StudentsMarkLeaderBoard";
import ProjectProgressBar from "./ProjectProgressBar";

function IndiviualGroupCharts({ item }) {
  const taskStatusCounts = {
    inProgress: 0,
    completed: 0,
    submitted: 0,
  };

  item.Task.forEach((t) => {
    const status = t.Progress?.toLowerCase();

    if (status === "in progress") {
      taskStatusCounts.inProgress++;
    } else if (status === "completed") {
      taskStatusCounts.completed++;
    } else if (status === "submitted") {
      taskStatusCounts.submitted++;
    }
  });
  const completed = taskStatusCounts?.completed || 0;
  const submitted = taskStatusCounts?.submitted || 0;
  const inProgress = taskStatusCounts?.inProgress || 0;

  const data = {
    labels: ["Completed Tasks", "Submitted Task", "In Progress"],
    datasets: [
      {
        label: "Task Distribution",
        data: [completed, submitted, inProgress],
        backgroundColor: ["#4caf50", "#ff9800", "#2196f3"],
        borderColor: ["#4caf50", "#ff9800", "#2196f3"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    legend: {
      position: "top",
    },
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          const label = data.labels[tooltipItem.index] || "";
          const value =
            data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          return `${label}: ${value}`;
        },
      },
    },
  };

  return (
    <div>
      <h3>Analytics for {item?.projectName || "Project"}</h3>
      <ProjectProgressBar tasks={item.Task} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "50%", padding: "10px", boxSizing: "border-box" }}>
          <Doughnut data={data} options={options} />
        </div>
        <div style={{ width: "50%", padding: "10px", boxSizing: "border-box" }}>
          <StudentTaskBarChart students={item.students} tasks={item.Task} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "50%", padding: "10px", boxSizing: "border-box" }}>
          <StudentMarksLineChart students={item.students} tasks={item.Task} />
        </div>
        <div style={{ width: "50%", padding: "10px", boxSizing: "border-box" }}>
          <StudentMarksLeaderboard students={item.students} tasks={item.Task} />
        </div>
      </div>
    </div>
  );
}

export default IndiviualGroupCharts;
