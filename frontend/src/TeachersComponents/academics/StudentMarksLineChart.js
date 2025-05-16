import React from "react";

function StudentMarksLineChart({ students = [], tasks = [] }) {
  const studentScoresMap = {};

  students.forEach((student) => {
    const fullName = `${student.name} ${student.middleName} ${student.surname}`;
    studentScoresMap[fullName] = {
      total: 0,
      acquired: 0,
    };
  });

  tasks.forEach((task) => {
    const student = task.AssignTo;
    if (!student) return;

    const fullName = `${student.name} ${student.middleName} ${student.surname}`;

    if (!studentScoresMap[fullName]) {
      studentScoresMap[fullName] = { total: 0, acquired: 0 };
    }

    studentScoresMap[fullName].total += task.TotalNumber || 0;
    studentScoresMap[fullName].acquired += task.AcquireNumber || 0;
  });

  return (
    <div style={{ maxWidth: "100%", overflowX: "auto", padding: "1rem" }}>
      <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        Total vs Acquired Marks
      </h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {Object.entries(studentScoresMap).map(([name, scores]) => {
          const percentage =
            scores.total > 0 ? (scores.acquired / scores.total) * 100 : 0;
          return (
            <div
              key={name}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "1rem",
                minWidth: "200px",
                flexShrink: 0,
              }}
            >
              <strong>{name}</strong>
              <div
                style={{
                  backgroundColor: "#e0e0e0",
                  borderRadius: "10px",
                  overflow: "hidden",
                  height: "20px",
                  marginTop: "5px",
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: percentage >= 50 ? "#00bcd4" : "#f44336",
                    height: "100%",
                    transition: "width 0.5s ease-in-out",
                    textAlign: "right",
                    paddingRight: "8px",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                >
                  {Math.round(percentage)}%
                </div>
              </div>
              <div
                style={{
                  marginTop: "5px",
                  fontSize: "14px",
                  color: "#333",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Total: {scores.total}</span>
                <span>Acquired: {scores.acquired}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StudentMarksLineChart;
