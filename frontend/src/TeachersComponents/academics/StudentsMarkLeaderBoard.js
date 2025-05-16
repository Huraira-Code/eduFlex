import React from "react";

function StudentMarksLeaderboard({ students = [], tasks = [] }) {
  const studentScoresMap = {};

  // Accumulate total and acquired marks
  students.forEach((student) => {
    const fullName = `${student.name} ${student.middleName} ${student.surname}`;
    studentScoresMap[fullName] = { total: 0, acquired: 0 };
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

  // Separate into ranked (acquired > 0) and unranked (acquired = 0)
  const ranked = Object.entries(studentScoresMap)
    .filter(([, scores]) => scores.acquired > 0)
    .sort(([, a], [, b]) => b.acquired - a.acquired);

  const unranked = Object.entries(studentScoresMap).filter(
    ([, scores]) => scores.acquired === 0
  );

  // Medals for top 3
  const medalEmojis = ["🥇", "🥈", "🥉"];

  const renderStudentItem = ([name, scores], index, isRanked) => {
    const percentage =
      scores.total > 0 ? (scores.acquired / scores.total) * 100 : 0;
    const medal = isRanked ? medalEmojis[index] || "" : "";

    return (
      <div
        key={name}
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderLeft: `6px solid ${
            isRanked
              ? index === 0
                ? "#ffd700"
                : index === 1
                ? "#c0c0c0"
                : index === 2
                ? "#cd7f32"
                : "#2196f3"
              : "#bbb"
          }`,
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>
          {medal} {name}
        </div>
        <div style={{ fontSize: "14px", color: "#555", marginTop: "5px" }}>
          Acquired: <strong>{scores.acquired}</strong> / {scores.total} (
          {Math.round(percentage)}%)
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        margin: "2rem auto",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        🎖 Leaderboard: Top Scorers
      </h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {ranked.map((entry, index) => renderStudentItem(entry, index, true))}
        {unranked.length > 0 && (
          <>
            <h4 style={{ color: "#777" }}>No Scores Yet</h4>
            {unranked.map((entry) => renderStudentItem(entry, null, false))}
          </>
        )}
      </div>
    </div>
  );
}

export default StudentMarksLeaderboard;
