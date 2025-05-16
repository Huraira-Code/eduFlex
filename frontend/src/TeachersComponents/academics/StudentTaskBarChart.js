// StudentTaskBarChart.js
import React from "react";
import { Bar } from "react-chartjs-2"; // For Chart.js v2

function StudentTaskBarChart({ students = [], tasks = [] }) {
  // Initialize task status per student
  const studentTaskMap = {};

  students.forEach((student) => {
    const fullName = `${student.name} ${student.middleName} ${student.surname}`;
    studentTaskMap[fullName] = {
      "Completed": 0,
      "Submitted": 0,
      "In Progress": 0,
    };
  });

  tasks.forEach((task) => {
    const student = task.AssignTo;
    if (!student) return;

    const fullName = `${student.name} ${student.middleName} ${student.surname}`;
    const status = task.Progress?.toLowerCase();

    if (!studentTaskMap[fullName]) {
      studentTaskMap[fullName] = {
        "Completed": 0,
        "Submitted": 0,
        "In Progress": 0,
      };
    }

    if (status === "completed") {
      studentTaskMap[fullName]["Completed"]++;
    } else if (status === "submitted") {
      studentTaskMap[fullName]["Submitted"]++;
    } else if (status === "in progress") {
      studentTaskMap[fullName]["In Progress"]++;
    }
  });

  const labels = Object.keys(studentTaskMap);

  const data = {
    labels,
    datasets: [
      {
        label: "Completed Tasks",
        data: labels.map((name) => studentTaskMap[name]["Completed"]),
        backgroundColor: "#4caf50",
      },
      {
        label: "Submitted Tasks",
        data: labels.map((name) => studentTaskMap[name]["Submitted"]),
        backgroundColor: "#ff9800",
      },
      {
        label: "In Progress",
        data: labels.map((name) => studentTaskMap[name]["In Progress"]),
        backgroundColor: "#2196f3",
      },
    ],
  };

  const options = {
    responsive: true,
    legend: {
      position: "top",
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            precision: 0,
          },
        },
      ],
    },
  };

  return (
    <div>
      <Bar data={data} options={options} />
    </div>
  );
}

export default StudentTaskBarChart;
