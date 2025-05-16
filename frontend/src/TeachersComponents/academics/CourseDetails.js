import React, { useState, useEffect } from "react";
import axios from "../../store/axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";
import { Link, useParams } from "react-router-dom";
import ListTable from "../../components/courses/NotesTable";
import ProjectTable from "../../components/courses/ProjectTable";
import { getCapitalize, errorAlert } from "../../utils";
import IndiviualGroupCharts from "./IndiviualGroupCharts";
import ProjectsAnalytics from "./ProjectsAnalytics";

const tableHeader = [
  { id: "date", name: "Project Name" },
  { id: "descripton", name: "Project Details" },
];

const LectureHeader = [
  { id: "date", name: "Date" },
  { id: "title", name: "Lecture" },
  { id: "descripition", name: "Details" },
  { id: "file", name: "Attachment" },
];

const NotesHeader = [
  { id: "date", name: "Date" },
  { id: "title", name: "Topic" },
  { id: "descripition", name: "Notes" },
  { id: "file", name: "Attachment" },
];

function CourseDetails() {
  const [course, setcourse] = useState([]);
  const [loading, setloading] = useState(false);
  const [notes, setnotes] = useState([]);
  const [projectGroup, setprojectGroup] = useState([]);
  const [lecture, setlectures] = useState([]);
  const [showNotes, setShowNotes] = useState(false); // New toggle state
  const [showProjectGroup, setShowProjectGroup] = useState(false); // New toggle state
  const [showProjectsAnalytics, setShowProjectsAnalytics] = useState(false); // New toggle state
  const [showLecture, setShowLecture] = useState(false); // New toggle state
  const [modalVisible, setModalVisible] = useState(false);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false); // State to toggle analytics view
  const [selectedProject, setSelectedProject] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskData, setTaskData] = useState({
    task: "",
    AssignTo: "",
    TaskDescription: "",
    TotalNumber: "",
    Attachment: [],
  });
  const [solutionData, setSolutionData] = useState({
    solution: "",
    Attachment: [],
  });
  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleFileChange = (e) => {
    setTaskData({ ...taskData, Attachment: Array.from(e.target.files) });
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();

    if (!taskData.Attachment || taskData.Attachment.length === 0) {
      return errorAlert("Please select at least one file");
    }

    try {
      setloading(true);

      // Handle file uploads
      const formData = new FormData();
      taskData.Attachment.forEach((file) => formData.append("files", file));

      const uploadResponse = await axios.post(
        "/upload/uploadAdvance",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (uploadResponse.data.error) {
        setloading(false);
        return errorAlert(uploadResponse.data.error);
      }

      const uploadedFiles = uploadResponse.data.files; // Assuming the backend returns an array of file URLs

      // Prepare the task data
      const selectedStudent = selectedProject.students.find(
        (student) => student.userID === taskData.AssignTo
      );

      const taskPayload = {
        ...taskData,
        Attachment: uploadedFiles, // Attach uploaded file URLs
        AssignTo: selectedStudent, // Pass the full student object
      };

      // Send the task data to the backend
      const response = await axios.post("/notes/findGroup&AddTask", {
        groupId: selectedProject._id,
        task: taskPayload,
      });

      if (response.data.error) {
        setloading(false);
        return errorAlert(response.data.error);
      }

      setloading(false);
      setShowTaskForm(false);
      alert("Task added successfully!");
    } catch (err) {
      console.error("Error submitting task:", err);
      errorAlert("An error occurred while submitting the task.");
      setloading(false);
    }
  };

  const { id, classID } = useParams();
  const user = useSelector(selectUser);
  useEffect(() => {
    axios.get(`/courses/courseCode/${id}`).then((res) => {
      setcourse(res.data.docs);
    });
  }, [id]);

  useEffect(() => {
    setloading(true);
    axios.get(`/notes/course/${id}`).then((res) => {
      setloading(false);
      setnotes(res.data.docs);
    });
  }, [id]);

  useEffect(() => {
    setloading(true);
    axios.get(`/notes/courseProject/${id}`).then((res) => {
      setloading(false);
      const yourArray = res.data.docs;
      const result = yourArray.filter((item) =>
        item.students?.some((studentObj) => studentObj.userId === user.userID)
      );
      if (user?.role === "teacher") {
        setprojectGroup(res.data.docs);
      } else if (user?.role === "student") {
        setprojectGroup(
          res.data.docs.filter((e) =>
            e.students.some((s) => s.userID === user?.id)
          )
        );
      }
    });
  }, [id]);

  useEffect(() => {
    setloading(true);
    axios.get(`/notes/courseLecture/${id}`).then((res) => {
      setloading(false);
      setlectures(res.data.docs);
    });
  }, [id]);

  const handleDelete = (id) => {
    axios.delete(`/notes/delete/${id}`).then((res) => {
      if (res.data.error) {
        errorAlert(res.data.error);
      }
      setnotes(notes.filter((e) => e._id !== id));
    });
  };
  const handleDeleteLecture = (id) => {
    axios.delete(`/notes/deleteLecture/${id}`).then((res) => {
      if (res.data.error) {
        errorAlert(res.data.error);
      }
      setlectures(notes.filter((e) => e._id !== id));
    });
  };

  const handleShowDetails = (project) => {
    setSelectedProject(project);
    setModalVisible(true);
  };
  const handleShowStudentDetails = (project) => {
    setSelectedProject(project);
    setStudentModalVisible(true);
  };
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedProject(null);
  };

  const handleTaskEditSubmit = async (
    projectId,
    taskId,
    description,
    totalNumber,
    assignTo,
    newAttachments // New parameter for new attachments
  ) => {
    try {
      setloading(true);

      // Handle file uploads
      let uploadedFiles = [];
      console.log("newAttachments", newAttachments);
      console.log("task data", taskData);
      if (newAttachments && newAttachments.length > 0) {
        console.log("metabaskar");
        const formData = new FormData();
        newAttachments.forEach((file) => formData.append("files", file));

        const uploadResponse = await axios.post(
          "/upload/uploadAdvance",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (uploadResponse.data.error) {
          errorAlert(uploadResponse.data.error);
          setloading(false);
          return;
        }

        uploadedFiles = uploadResponse.data.files; // Assuming the backend returns an array of file URLs
      }
      console.log("My Uploaded File", uploadedFiles);
      // Merge new attachments with existing ones
      const existingAttachments =
        selectedProject.Task.find((task) => task._id === taskId)?.Attachment ||
        [];
      const updatedAttachments = [...existingAttachments, ...uploadedFiles];

      // Update the task with the new data
      const updatedTask = {
        TaskDescription: description,
        TotalNumber: totalNumber,
        AssignTo: assignTo,
        Attachment: updatedAttachments, // Include merged attachments
      };

      const response = await axios.post("/notes/editTask", {
        projectId,
        taskId,
        updatedTask,
      });

      if (response.data.success) {
        alert("Task updated successfully!");
        setActiveEditInputs((prev) => ({ ...prev, [taskId]: false }));
      } else {
        alert("Failed to update task: " + response.data.message);
      }
    } catch (err) {
      console.error("Error updating task:", err);
      alert("An error occurred while updating the task.");
    } finally {
      setloading(false);
    }
  };
  const [activeFinishInputs, setActiveFinishInputs] = useState({});
  const [activeEditInputs, setActiveEditInputs] = useState({});

  const toggleFinishInput = (taskId) => {
    setActiveFinishInputs((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const toggleEditInputs = (taskId) => {
    setActiveEditInputs((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleMarksSubmit = async (projectID, taskId, marks, remarks) => {
    try {
      const response = await axios.post("/notes/editTaskMarksAndRemarks", {
        projectId: projectID,
        taskId: taskId,
        Marks: marks,
        Remarks: remarks,
      });

      if (response.data.success) {
        alert("Task updated successfully!");
        // You can call a refetch function or update local state here
      } else {
        alert("Failed to update task: " + response.data.message);
      }
    } catch (error) {
      console.error("Error submitting marks:", error);
      alert("An error occurred while submitting the task marks.");
    }
  };

  const handleSolutionSubmit = async (
    projectID,
    taskId,
    solution,
    attachments
  ) => {
    try {
      let uploadedFiles = [];

      // Handle file uploads if attachments are provided
      if (attachments && attachments.length > 0) {
        const formData = new FormData();
        attachments.forEach((file) => formData.append("files", file)); // Append multiple files

        const uploadResponse = await axios.post(
          "/upload/uploadAdvance",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (uploadResponse.data.error) {
          return errorAlert(uploadResponse.data.error);
        }

        uploadedFiles = uploadResponse.data.files; // Assuming backend returns an array of file URLs
      }

      // Submit the solution with the uploaded attachments
      const response = await axios.post("/notes/addSolutions", {
        projectId: projectID,
        taskId: taskId,
        solutions: solution,
        Attachment: uploadedFiles, // Include uploaded files
      });

      if (response.data.success) {
        alert("Solution submitted successfully!");
        // Optionally, update the UI or refetch data here
      } else {
        alert("Failed to submit solution: " + response.data.message);
      }
    } catch (error) {
      console.error("Error submitting solution:", error);
      alert("An error occurred while submitting the solution.");
    }
  };
  return (
    <div>
      <div
        style={{ background: "#051f3e" }}
        className="content__container text-center"
      >
        <h3>Course Details</h3>
        <h4>{getCapitalize(course?.name)}</h4>
        <h6>{course?.code}</h6>
      </div>

      <div className="content__container">
        <div className="d-flex justify-content-between">
          <h3>Course Details</h3>
          <div>
            {user?.role !== "student" && (
              <>
                <Link
                  to={`/academics/projectgroup/add/${course?.code}/${classID}`}
                  className="btn blue__btn mx-2"
                >
                  Add New Project Group
                </Link>
                <Link
                  to={`/academics/lecture/add/${course?.code}/${classID}`}
                  className="btn blue__btn mx-2"
                >
                  Add New Lecture
                </Link>
                <Link
                  to={`/academics/courses/add/${course?.code}/${classID}`}
                  className="btn blue__btn mx-2"
                >
                  Add New Note
                </Link>
                <Link
                  to={`/academics/courses/sba/${course?.code}/${classID}`}
                  className="btn blue__btn mx-2"
                >
                  Course S.B.A
                </Link>
                <Link
                  to={`/academics/courses/report/${course?.code}/${classID}`}
                  className="btn blue__btn mx-2"
                >
                  Course Report
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="my-3">
          <button
            className="btn blue__btn"
            onClick={() => setShowNotes(!showNotes)}
          >
            {showNotes ? "Hide Course Notes" : "Show Course Notes"}
          </button>
        </div>

        <div className="my-3">
          <button
            className="btn blue__btn"
            onClick={() => setShowLecture(!showLecture)}
          >
            {showLecture ? "Hide Course Lectures" : "Show Course Lectures"}
          </button>
        </div>
        <div className="my-3">
          <button
            className="btn blue__btn"
            onClick={() => setShowProjectGroup(!showProjectGroup)}
          >
            {showProjectGroup ? "Hide Project Group" : "Show Project Group"}
          </button>
        </div>
        <div className="my-3">
          <button
            className="btn blue__btn"
            onClick={() => setShowProjectsAnalytics(!showProjectsAnalytics)}
          >
            {showProjectsAnalytics
              ? "Hide Projects Leader Board"
              : "Show Project Leader Board"}
          </button>
        </div>
        {showProjectsAnalytics && <ProjectsAnalytics projectGroup={projectGroup}/>}
        {showLecture && (
          <ListTable
            tableHeader={LectureHeader}
            data={lecture}
            handleDelete={handleDeleteLecture}
            loading={loading}
            noActions={user?.role === "student"}
            isEdit={true}
            user={user?.id}
          />
        )}
        {showNotes && (
          <ListTable
            tableHeader={NotesHeader}
            data={notes}
            handleDelete={handleDelete}
            loading={loading}
            noActions={user?.role === "student"}
            isEdit={true}
            user={user?.id}
          />
        )}
        {showProjectGroup && (
          <ProjectTable
            tableHeader={tableHeader}
            data={projectGroup}
            handleShowDetails={handleShowDetails}
            handleShowStudentDetails={handleShowStudentDetails}
            loading={loading}
            noActions={user?.role === "student"}
            studentActions={user?.role === "student"}
            isEdit={true}
            user={user?.id}
          />
        )}
      </div>
      {/* Modal for showing project details */}
      {modalVisible && selectedProject && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div
            className="modal-dialog modal-dialog-scrollable"
            style={{ width: "90%", maxWidth: "90%" }}
          >
            <div
              className="modal-content"
              style={{ maxHeight: "90vh", overflow: "hidden" }}
            >
              <div className="modal-header">
                <h5 className="modal-title">Project Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body" style={{ overflowY: "auto" }}>
                <h6>
                  <strong>Project Name:</strong> {selectedProject?.projectName}
                </h6>
                <p>
                  <strong>Project Details:</strong>{" "}
                  {selectedProject?.projectDetail}
                </p>

                <h6>
                  <strong>Group Members:</strong>
                </h6>
                <div className="d-flex flex-wrap">
                  {selectedProject?.students?.map((student) => (
                    <div
                      key={student._id}
                      className="d-flex align-items-center me-4 mb-3"
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`}
                        alt={student.name}
                        className="rounded-circle me-2"
                        width={40}
                        height={40}
                      />
                      <div>
                        <div>
                          <strong>{student.name}</strong>
                        </div>
                        <div className="text-muted">{student.userID}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                  >
                    {showAnalytics ? "Hide Analytics" : "Show Analytics"}
                  </button>
                </div>
                {showAnalytics && (
                  <div className="mt-4">
                    <IndiviualGroupCharts item={selectedProject} />
                  </div>
                )}
                {selectedProject?.Task?.length > 0 && (
                  <div className="mt-4">
                    <h6>
                      <strong>Tasks:</strong>
                    </h6>
                    <div className="d-flex flex-column gap-3">
                      {selectedProject.Task.map((task) => (
                        <div
                          key={task._id}
                          className="card shadow-sm w-100 border-0"
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderRadius: "12px",
                          }}
                        >
                          <div className="d-flex flex-wrap align-items-start justify-content-between p-4">
                            {/* Left Block */}
                            <div style={{ flex: 2, minWidth: "250px" }}>
                              <h5 className="mb-1">{task.task}</h5>
                              <small className="text-muted">
                                Assigned to:{" "}
                                {typeof task.AssignTo === "object"
                                  ? `${task.AssignTo.name} (${task.AssignTo.userID})`
                                  : task.AssignTo}
                              </small>
                              <p className="mt-3 mb-2">
                                <strong>Description:</strong> <br />
                                {task.TaskDescription || "-"}
                              </p>
                              <p className="mb-1">
                                <strong>Remarks:</strong> {task.Remarks ?? "-"}
                              </p>
                            </div>

                            {/* Middle Block */}
                            <div style={{ flex: 1, minWidth: "180px" }}>
                              <p className="mb-2">
                                <span className="badge bg-info text-dark">
                                  {task.Progress || "Pending"}
                                </span>
                              </p>
                              <p className="mb-1">
                                <strong>Acquire #:</strong>{" "}
                                {task.AcquireNumber ?? "-"}
                              </p>
                              <p className="mb-1">
                                <strong>Total #:</strong>{" "}
                                {task.TotalNumber ?? "-"}
                              </p>
                            </div>

                            {/* Right Block */}
                            <div style={{ flex: 1, minWidth: "200px" }}>
                              <strong>Attachments:</strong>
                              <div className="d-flex flex-column mt-1">
                                {Array.isArray(task.Attachment) &&
                                task.Attachment.length > 0 ? (
                                  task.Attachment.map((file, idx) => (
                                    <a
                                      key={idx}
                                      href={file.url || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-truncate text-primary"
                                      style={{ maxWidth: "180px" }}
                                    >
                                      📎 {file.name || `Attachment ${idx + 1}`}
                                    </a>
                                  ))
                                ) : (
                                  <span className="text-muted">
                                    No attachments
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Solution Section */}
                          {Array.isArray(task.Solution) &&
                            task.Solution.length > 0 && (
                              <div className="px-4 pb-3">
                                <h6 className="mt-3">
                                  <strong>Solutions:</strong>
                                </h6>
                                <div className="d-flex flex-column gap-2">
                                  {task.Solution.map((solution, solIdx) => (
                                    <div
                                      key={solIdx}
                                      className="p-3 border rounded bg-white"
                                      style={{ borderColor: "#dee2e6" }}
                                    >
                                      <p className="mb-2">
                                        <strong>Answer:</strong> <br />
                                        {solution.Answer || "-"}
                                      </p>
                                      <div>
                                        <strong>Attachments:</strong>
                                        <div className="d-flex flex-column mt-1">
                                          {Array.isArray(solution.Attachment) &&
                                          solution.Attachment.length > 0 ? (
                                            solution.Attachment.map(
                                              (file, idx) => (
                                                <a
                                                  key={idx}
                                                  href={file.url || "#"}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-truncate text-primary"
                                                  style={{ maxWidth: "180px" }}
                                                >
                                                  📎{" "}
                                                  {file.name ||
                                                    `Solution Attachment ${
                                                      idx + 1
                                                    }`}
                                                </a>
                                              )
                                            )
                                          ) : (
                                            <span className="text-muted">
                                              No attachments
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Finish Task Button */}
                          <div className="px-4 pb-4">
                            {task.Progress !== "Completed" && user && (
                              <button
                                className="btn btn-success mt-2"
                                onClick={() => toggleFinishInput(task._id)}
                              >
                                {activeFinishInputs[task._id]
                                  ? "Cancel"
                                  : "Finished Task"}
                              </button>
                            )}
                            {task.Progress !== "Completed" && user && (
                              <button
                                className="btn btn-success mt-2 ml-2"
                                onClick={() => toggleEditInputs(task._id)}
                              >
                                {activeEditInputs[task._id]
                                  ? "Cancel"
                                  : "Edit Task"}
                              </button>
                            )}
                            {activeEditInputs[task._id] && (
                              <div className="mt-3 d-flex flex-column gap-2">
                                <textarea
                                  className="form-control"
                                  rows="2"
                                  placeholder="Edit Task "
                                  defaultValue={task.task}
                                  onChange={(e) => (task.task = e.target.value)}
                                />
                                <textarea
                                  className="form-control"
                                  rows="2"
                                  placeholder="Edit Task Description"
                                  defaultValue={task.TaskDescription}
                                  onChange={(e) =>
                                    (task._editDescription = e.target.value)
                                  }
                                />

                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Edit Total Number"
                                  defaultValue={task.TotalNumber}
                                  onChange={(e) =>
                                    (task._editTotalNumber = e.target.value)
                                  }
                                />

                                <select
                                  className="form-select"
                                  defaultValue={
                                    typeof task.AssignTo === "object"
                                      ? task.AssignTo.userID
                                      : task.AssignTo
                                  }
                                  onChange={(e) =>
                                    (task._editAssignTo = e.target.value)
                                  }
                                >
                                  <option value="">Reassign to</option>
                                  {selectedProject?.students?.map((student) => (
                                    <option
                                      key={student._id}
                                      value={student.userID}
                                    >
                                      {student.name} ({student.userID})
                                    </option>
                                  ))}
                                </select>
                                {/* File Input for Attachments */}
                                <input
                                  type="file"
                                  multiple
                                  className="form-control"
                                  onChange={(e) => {
                                    const newFiles = Array.from(e.target.files);
                                    task._editAttachments =
                                      task._editAttachments
                                        ? [
                                            ...task._editAttachments,
                                            ...newFiles,
                                          ]
                                        : newFiles;
                                  }}
                                />

                                {/* Display Existing Attachments */}
                                <div className="mt-2">
                                  <strong>Existing Attachments:</strong>
                                  <div className="d-flex flex-column mt-1">
                                    {Array.isArray(task.Attachment) &&
                                    task.Attachment.length > 0 ? (
                                      task.Attachment.map((file, idx) => (
                                        <a
                                          key={idx}
                                          href={file.url || "#"}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-truncate text-primary"
                                          style={{ maxWidth: "180px" }}
                                        >
                                          📎{" "}
                                          {file.name || `Attachment ${idx + 1}`}
                                        </a>
                                      ))
                                    ) : (
                                      <span className="text-muted">
                                        No attachments available
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  className="btn btn-primary"
                                  onClick={() =>
                                    handleTaskEditSubmit(
                                      selectedProject._id,
                                      task._id,
                                      task._editDescription ||
                                        task.TaskDescription,
                                      task._editTotalNumber || task.TotalNumber,
                                      task._editAssignTo ||
                                        task.AssignTo.userID ||
                                        task.AssignTo,
                                      task._editAttachments ||
                                        taskData.Attachment
                                    )
                                  }
                                >
                                  Save Changes
                                </button>
                              </div>
                            )}

                            {activeFinishInputs[task._id] && (
                              <div className="mt-3 d-flex flex-column gap-2">
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Enter Marks"
                                  onChange={(e) =>
                                    (task._tempMarks = e.target.value)
                                  }
                                />
                                <textarea
                                  className="form-control"
                                  rows="2"
                                  placeholder="Enter Remarks"
                                  onChange={(e) =>
                                    (task._tempRemarks = e.target.value)
                                  }
                                />
                                <button
                                  className="btn btn-primary"
                                  onClick={() =>
                                    handleMarksSubmit(
                                      selectedProject._id,
                                      task._id,
                                      task._tempMarks,
                                      task._tempRemarks
                                    )
                                  }
                                >
                                  Submit
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowTaskForm(true)}
                  >
                    Add Task
                  </button>
                </div>

                {showTaskForm && (
                  <form className="mt-3" onSubmit={handleTaskSubmit}>
                    <div className="mb-2">
                      <label className="form-label">Task Title</label>
                      <input
                        type="text"
                        className="form-control"
                        name="task"
                        value={taskData.task}
                        onChange={handleTaskInputChange}
                        required
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Assign To</label>
                      <select
                        className="form-select"
                        name="AssignTo"
                        value={taskData.AssignTo}
                        onChange={handleTaskInputChange}
                        required
                      >
                        <option value="">Select a student</option>
                        {selectedProject?.students?.map((student) => (
                          <option key={student._id} value={student.userID}>
                            {student.name} ({student.userID})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Task Description</label>
                      <textarea
                        className="form-control"
                        name="TaskDescription"
                        rows="3"
                        value={taskData.TaskDescription}
                        onChange={handleTaskInputChange}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Task Total Number</label>
                      <textarea
                        className="form-control"
                        name="TotalNumber"
                        rows="1"
                        value={taskData.TotalNumber}
                        onChange={handleTaskInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Attachments</label>
                      <input
                        type="file"
                        multiple
                        className="form-control"
                        onChange={handleFileChange}
                      />
                    </div>

                    <button type="submit" className="btn btn-success me-2">
                      Submit
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowTaskForm(false)}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {studentModalVisible && selectedProject && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div
            className="modal-dialog modal-dialog-scrollable"
            style={{ width: "90%", maxWidth: "90%" }}
          >
            <div
              className="modal-content"
              style={{ maxHeight: "90vh", overflow: "hidden" }}
            >
              <div className="modal-header">
                <h5 className="modal-title">Project Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body" style={{ overflowY: "auto" }}>
                <h6>
                  <strong>Project Name:</strong> {selectedProject?.projectName}
                </h6>
                <p>
                  <strong>Project Details:</strong>{" "}
                  {selectedProject?.projectDetail}
                </p>

                <h6>
                  <strong>Group Members:</strong>
                </h6>
                <div className="d-flex flex-wrap">
                  {selectedProject?.students?.map((student) => (
                    <div
                      key={student._id}
                      className="d-flex align-items-center me-4 mb-3"
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`}
                        alt={student.name}
                        className="rounded-circle me-2"
                        width={40}
                        height={40}
                      />
                      <div>
                        <div>
                          <strong>{student.name}</strong>
                        </div>
                        <div className="text-muted">{student.userID}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                  >
                    {showAnalytics ? "Hide Analytics" : "Show Analytics"}
                  </button>
                </div>

                {/* Render IndiviviualGroupCharts */}
                {showAnalytics && (
                  <div className="mt-4">
                    <IndiviualGroupCharts item={selectedProject} />
                  </div>
                )}
                {selectedProject?.Task?.length > 0 && (
                  <div className="mt-4">
                    <h6>
                      <strong>Tasks:</strong>
                    </h6>
                    <div className="d-flex flex-column gap-3">
                      {selectedProject.Task.map((task) => (
                        <div
                          key={task._id}
                          className="card shadow-sm w-100 border-0"
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderRadius: "12px",
                          }}
                        >
                          <div className="d-flex flex-wrap align-items-start justify-content-between p-4">
                            {/* Left Block */}
                            <div style={{ flex: 2, minWidth: "250px" }}>
                              <h5 className="mb-1">{task.task}</h5>
                              <small className="text-muted">
                                Assigned to:{" "}
                                {typeof task.AssignTo === "object"
                                  ? `${task.AssignTo.name} (${task.AssignTo.userID})`
                                  : task.AssignTo}
                              </small>
                              <p className="mt-3 mb-2">
                                <strong>Description:</strong> <br />
                                {task.TaskDescription || "-"}
                              </p>
                              <p className="mb-1">
                                <strong>Remarks:</strong> {task.Remarks ?? "-"}
                              </p>
                            </div>

                            {/* Middle Block */}
                            <div style={{ flex: 1, minWidth: "180px" }}>
                              <p className="mb-2">
                                <span className="badge bg-info text-dark">
                                  {task.Progress || "Pending"}
                                </span>
                              </p>
                              <p className="mb-1">
                                <strong>Acquire #:</strong>{" "}
                                {task.AcquireNumber ?? "-"}
                              </p>
                              <p className="mb-1">
                                <strong>Total #:</strong>{" "}
                                {task.TotalNumber ?? "-"}
                              </p>
                            </div>

                            {/* Right Block */}
                            <div style={{ flex: 1, minWidth: "200px" }}>
                              <strong>Attachments:</strong>
                              <div className="d-flex flex-column mt-1">
                                {Array.isArray(task.Attachment) &&
                                task.Attachment.length > 0 ? (
                                  task.Attachment.map((file, idx) => (
                                    <a
                                      key={idx}
                                      href={file.url || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-truncate text-primary"
                                      style={{ maxWidth: "180px" }}
                                    >
                                      📎 {file.name || `Attachment ${idx + 1}`}
                                    </a>
                                  ))
                                ) : (
                                  <span className="text-muted">
                                    No attachments
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Solution Section */}
                          {Array.isArray(task.Solution) &&
                            task.Solution.length > 0 && (
                              <div className="px-4 pb-3">
                                <h6 className="mt-3">
                                  <strong>Solutions:</strong>
                                </h6>
                                <div className="d-flex flex-column gap-2">
                                  {task.Solution.map((solution, solIdx) => (
                                    <div
                                      key={solIdx}
                                      className="p-3 border rounded bg-white"
                                      style={{ borderColor: "#dee2e6" }}
                                    >
                                      <p className="mb-2">
                                        <strong>Answer:</strong> <br />
                                        {solution.Answer || "-"}
                                      </p>
                                      <div>
                                        <strong>Attachments:</strong>
                                        <div className="d-flex flex-column mt-1">
                                          {Array.isArray(solution.Attachment) &&
                                          solution.Attachment.length > 0 ? (
                                            solution.Attachment.map(
                                              (file, idx) => (
                                                <a
                                                  key={idx}
                                                  href={file.url || "#"}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-truncate text-primary"
                                                  style={{ maxWidth: "180px" }}
                                                >
                                                  📎{" "}
                                                  {file.name ||
                                                    `Solution Attachment ${
                                                      idx + 1
                                                    }`}
                                                </a>
                                              )
                                            )
                                          ) : (
                                            <span className="text-muted">
                                              No attachments
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Finish Task Button */}
                          <div className="px-4 pb-4">
                            {task.Progress !== "Completed" &&
                              user?.role === "student" &&
                              task.AssignTo?.userID === user?.userID && ( // Conditional rendering
                                <button
                                  className="btn btn-success mt-2"
                                  onClick={() => toggleFinishInput(task._id)}
                                >
                                  {activeFinishInputs[task._id]
                                    ? "Cancel"
                                    : "Submit Task"}
                                </button>
                              )}

                            {activeFinishInputs[task._id] && (
                              <div className="mt-3 d-flex flex-column gap-2">
                                {/* Answer Field */}
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter Answer"
                                  onChange={(e) =>
                                    (solutionData.solution = e.target.value)
                                  }
                                />

                                {/* File Upload */}
                                <input
                                  type="file"
                                  multiple
                                  className="form-control"
                                  onChange={(e) => {
                                    const newFiles = Array.from(e.target.files);
                                    solutionData.Attachment =
                                      solutionData.Attachment
                                        ? [
                                            ...solutionData.Attachment,
                                            ...newFiles,
                                          ]
                                        : newFiles;
                                  }}
                                />

                                <button
                                  className="btn btn-primary"
                                  onClick={() =>
                                    handleSolutionSubmit(
                                      selectedProject._id,
                                      task._id,
                                      solutionData.solution,
                                      solutionData.Attachment
                                    )
                                  }
                                >
                                  Submit
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showTaskForm && (
                  <form className="mt-3" onSubmit={handleTaskSubmit}>
                    <div className="mb-2">
                      <label className="form-label">Task Title</label>
                      <input
                        type="text"
                        className="form-control"
                        name="task"
                        value={taskData.task}
                        onChange={handleTaskInputChange}
                        required
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Assign To</label>
                      <select
                        className="form-select"
                        name="AssignTo"
                        value={taskData.AssignTo}
                        onChange={handleTaskInputChange}
                        required
                      >
                        <option value="">Select a student</option>
                        {selectedProject?.students?.map((student) => (
                          <option key={student._id} value={student.userID}>
                            {student.name} ({student.userID})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Task Description</label>
                      <textarea
                        className="form-control"
                        name="TaskDescription"
                        rows="3"
                        value={taskData.TaskDescription}
                        onChange={handleTaskInputChange}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Task Total Number</label>
                      <textarea
                        className="form-control"
                        name="TotalNumber"
                        rows="1"
                        value={taskData.TotalNumber}
                        onChange={handleTaskInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Attachments</label>
                      <input
                        type="file"
                        multiple
                        className="form-control"
                        onChange={handleFileChange}
                      />
                    </div>

                    <button type="submit" className="btn btn-success me-2">
                      Submit
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowTaskForm(false)}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for modal */}
      {modalVisible && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

export default CourseDetails;
