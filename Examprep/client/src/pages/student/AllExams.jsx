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
        <span key="s" className="text-gray-600">{selectedSubject.name}</span>
      );
    }
    return parts;
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
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
            <div className="animate-fade-in relative z-10">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-wide">All Exams</h1>
              <p className="text-gray-500 text-sm mb-8">Choose an exam to start preparing</p>
              {exams.length === 0 ? (
                <p className="text-gray-500 py-12 text-center surface-card rounded-xl">No exams available yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exams.map((exam) => (
                    <button
                      key={exam.id}
                      onClick={() => loadSubjects(exam)}
                      className="interactive-card p-6 text-left group hover:-translate-y-1"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                      <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-all shadow-sm group-hover:scale-110 group-hover:shadow-sm">
                        <BookOpen className="text-primary" size={24} />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-primary transition-colors">{exam.name}</h3>
                      <p className="text-sm text-gray-500 mb-5 line-clamp-2 leading-relaxed">
                        {exam.description || "No description"}
                      </p>
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="text-gray-500 group-hover:text-gray-600 transition-colors">
                          {exam.subjects?.length || 0} subjects
                        </span>
                        <ArrowRight className="text-primary group-hover:translate-x-2 transition-transform duration-300" size={18} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subject Level */}
          {level === "subjects" && (
            <div className="animate-fade-in relative z-10">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-wide">{selectedExam?.name}</h1>
              <p className="text-gray-500 text-sm mb-8">Select a subject</p>
              {subjects.length === 0 ? (
                <p className="text-gray-500 py-12 text-center surface-card rounded-xl">No subjects in this exam yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => loadTopics(subject)}
                      className="interactive-card p-6 text-left group hover:-translate-y-1"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                      <div className="w-12 h-12 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-accent-cyan/20 transition-all shadow-sm group-hover:scale-110 group-hover:shadow-sm">
                        <Layers className="text-accent-cyan" size={24} />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-accent-cyan transition-colors">{subject.name}</h3>
                      <p className="text-sm text-gray-500 mb-5 line-clamp-2 leading-relaxed">
                        {subject.description || "No description"}
                      </p>
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="text-gray-500 group-hover:text-gray-600 transition-colors">
                          {subject.topics?.length || 0} topics
                        </span>
                        <ArrowRight className="text-accent-cyan group-hover:translate-x-2 transition-transform duration-300" size={18} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Topic Level */}
          {level === "topics" && (
            <div className="animate-fade-in relative z-10">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-wide">{selectedSubject?.name}</h1>
              <p className="text-gray-500 text-sm mb-8">Select a topic to start the exam</p>
              {topics.length === 0 ? (
                <p className="text-gray-500 py-12 text-center surface-card rounded-xl">No topics in this subject yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="interactive-card p-5 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent-pink/10 border border-accent-pink/20 rounded-xl flex items-center justify-center group-hover:bg-accent-pink/20 group-hover:scale-105 transition-all shadow-sm">
                          <Tags className="text-accent-pink" size={22} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-accent-pink transition-colors text-lg">{topic.name}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {topic.questions?.length || 0} questions
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => startExam(topic)}
                        disabled={!topic.questions || topic.questions.length === 0}
                        className="bg-accent-pink/90 hover:bg-accent-pink disabled:opacity-30 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-sm font-bold text-gray-900 transition-all flex items-center gap-2 shadow-sm hover:-translate-y-0.5"
                      >
                        <Play size={16} fill="currentColor" /> Start
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
