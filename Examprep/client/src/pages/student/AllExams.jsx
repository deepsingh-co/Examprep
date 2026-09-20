import { useState, useEffect } from "react";
import {
  BookOpen,
  Layers,
  Tags,
  Play,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { examService } from "../../services/examService";
import { subjectService } from "../../services/subjectService";
import { topicService } from "../../services/topicService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AllExams = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState("exams");
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await examService.getAll();
      setExams(res.data.data);
    } catch (err) {
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async (exam) => {
    setSelectedExam(exam);
    setLoading(true);
    try {
      const res = await subjectService.getAll(exam.id);
      setSubjects(res.data.data);
      setLevel("subjects");
    } catch {
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async (subject) => {
    setSelectedSubject(subject);
    setLoading(true);
    try {
      const res = await topicService.getAll(subject.id);
      setTopics(res.data.data);
      setLevel("topics");
    } catch {
      toast.error("Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  const startExam = (topic) => {
    navigate(`/student/exam/${topic.id}`);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const breadcrumb = () => {
    const parts = [
      <button key="all" onClick={() => { setLevel("exams"); setSelectedExam(null); setSelectedSubject(null); }} className="text-primary hover:underline">
        All Exams
      </button>,
    ];
    if (selectedExam) {
      parts.push(
        <span key="e-sep" className="mx-2 text-gray-600">/</span>,
        <button key="e" onClick={() => { setLevel("subjects"); setSelectedSubject(null); }} className="text-primary hover:underline">
          {selectedExam.name}
        </button>
      );
    }
    if (selectedSubject) {
      parts.push(
        <span key="s-sep" className="mx-2 text-gray-600">/</span>,
        <span key="s" className="text-gray-300">{selectedSubject.name}</span>
      );
    }
    return parts;
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        {breadcrumb()}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Exam Level */}
          {level === "exams" && (
            <div>
              <h1 className="text-2xl font-bold mb-2">All Exams</h1>
              <p className="text-gray-400 text-sm mb-6">Choose an exam to start preparing</p>
              {exams.length === 0 ? (
                <p className="text-gray-500 py-12 text-center">No exams available yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {exams.map((exam) => (
                    <button
                      key={exam.id}
                      onClick={() => loadSubjects(exam)}
                      className="bg-dark-800 border border-white/5 rounded-xl p-6 text-left hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition group"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition">
                        <BookOpen className="text-primary" size={24} />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{exam.name}</h3>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {exam.description || "No description"}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {exam.subjects?.length || 0} subjects
                        </span>
                        <ArrowRight className="text-primary group-hover:translate-x-1 transition" size={16} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subject Level */}
          {level === "subjects" && (
            <div>
              <h1 className="text-2xl font-bold mb-2">{selectedExam?.name}</h1>
              <p className="text-gray-400 text-sm mb-6">Select a subject</p>
              {subjects.length === 0 ? (
                <p className="text-gray-500 py-12 text-center">No subjects in this exam yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => loadTopics(subject)}
                      className="bg-dark-800 border border-white/5 rounded-xl p-6 text-left hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition group"
                    >
                      <div className="w-12 h-12 bg-green-400/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-400/20 transition">
                        <Layers className="text-green-400" size={24} />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{subject.name}</h3>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {subject.description || "No description"}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {subject.topics?.length || 0} topics
                        </span>
                        <ArrowRight className="text-green-400 group-hover:translate-x-1 transition" size={16} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Topic Level */}
          {level === "topics" && (
            <div>
              <h1 className="text-2xl font-bold mb-2">{selectedSubject?.name}</h1>
              <p className="text-gray-400 text-sm mb-6">Select a topic to start the exam</p>
              {topics.length === 0 ? (
                <p className="text-gray-500 py-12 text-center">No topics in this subject yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="bg-dark-800 border border-white/5 rounded-xl p-5 flex items-center justify-between hover:border-primary/40 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Tags className="text-primary" size={20} />
                        </div>
                        <div>
                          <h3 className="font-medium">{topic.name}</h3>
                          <p className="text-xs text-gray-500">
                            {topic.questions?.length || 0} questions
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => startExam(topic)}
                        disabled={!topic.questions || topic.questions.length === 0}
                        className="bg-primary hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                      >
                        <Play size={14} /> Start
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllExams;
