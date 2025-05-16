import React, { useEffect, useState } from "react";
import "./ProjectAnalytics.css";

function ProjectsAnalytics({ projectGroup }) {
  const [projectGroupLeader, setProjectGroupLeader] = useState([]);

  useEffect(() => {
    const leaderBoard = () => {
      const updatedLeaders = [];

      projectGroup.forEach((item) => {
        let taskCompleted = 0;
        let taskSubmitted = 0;
        let taskInProgress = 0;

        item.Task.forEach((task) => {
          if (task.Progress === "Completed") {
            taskCompleted += 1;
          } else if (task.Progress === "Submitted") {
            taskSubmitted += 1;
          } else if (task.Progress === "In Progress") {
            taskInProgress += 1;
          }
        });

        const percentage = (taskCompleted / item.Task.length) * 100;

        updatedLeaders.push({
          group: item,
          percentage: percentage,
          taskCompleted,
          taskSubmitted,
          taskInProgress,
        });
      });

      setProjectGroupLeader(updatedLeaders);
    };

    leaderBoard();
  }, [projectGroup]);

  const medals = ["🥇", "🥈", "🥉"];
  const sortedLeaders = [...projectGroupLeader].sort(
    (a, b) => b.percentage - a.percentage
  );

  return (
    <div className="container">
      <h2 className="heading">🚀 Project Leaderboard</h2>
      <div className="grid">
        {sortedLeaders.map((entry, index) => (
          <div
            key={index}
            className={`card ${
              index === 0
                ? "gold"
                : index === 1
                ? "silver"
                : index === 2
                ? "bronze"
                : ""
            }`}
          >
            <div className="card-header">
              <h3>{entry.group?.projectName || `Group ${index + 1}`}</h3>
              <span>{medals[index] || `#${index + 1}`}</span>
            </div>
            <div className="completion">
              Completion: {entry.percentage.toFixed(2)}%
            </div>
            <div className="task-status">
              <p>
                Completed: {entry.taskCompleted} | Submitted: {entry.taskSubmitted} | In Progress: {entry.taskInProgress}
              </p>
            </div>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${entry.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectsAnalytics;
