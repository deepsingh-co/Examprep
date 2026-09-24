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
      const demoExams = [
        { id: 'demo1', name: 'Lakshya JEE 2024 Test Series', description: 'Complete syllabus mock tests for JEE Main & Advanced with video solutions.', subjects: [1,2,3,4], isDemo: true, badge: 'Live' },
        { id: 'demo2', name: 'Arjuna NEET Mock Tests', description: 'Pattern-based full syllabus tests for NEET aspirants. Strictly NCERT based.', subjects: [1,2,3], isDemo: true, badge: 'Upcoming' },
        { id: 'demo3', name: 'Udaan Class 10th Boards', description: 'Term 1 & Term 2 mock tests to boost your board exam preparation.', subjects: [1,2,3,4,5], isDemo: true, badge: 'New' }
      ];
      setExams([...res.data.data, ...demoExams]);
    } catch (err) {
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async (exam) => {
    setSelectedExam(exam);
    if (exam.isDemo) {
      // Mock subjects for demo
      setSubjects([
        { id: 'dsub1', name: 'Physics', description: 'Mechanics, Electromagnetism, Optics' },
        { id: 'dsub2', name: 'Chemistry', description: 'Physical, Organic, Inorganic' },
        { id: 'dsub3', name: 'Mathematics / Biology', description: 'Calculus, Algebra / Botany, Zoology' }
      ]);
      setLevel("subjects");
      return;
    }
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
    if (subject.id.startsWith('dsub')) {
      // Mock topics for demo
      setTopics([
        { id: 'dtop1', name: 'Full Syllabus Mock Test 1', questions: new Array(50) },
        { id: 'dtop2', name: 'Full Syllabus Mock Test 2', questions: new Array(50) },
        { id: 'dtop3', name: 'Part Test - Mechanics', questions: new Array(30) }
      ]);
      setLevel("topics");
      return;
    }
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
    if (topic.id.startsWith('dtop')) {
      toast.error("This is a demo test. Real test engine not connected.");
      return;
    }
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
              <h1 className="text-3xl font-extrabold text-secondary mb-2 tracking-wide font-heading">Test Series</h1>
              <p className="text-gray-500 text-sm mb-8">Boost your preparation with PW style mock tests.</p>
              {exams.length === 0 ? (
                <p className="text-gray-500 py-12 text-center bg-white rounded-xl border border-gray-200">No exams available yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exams.map((exam) => (
                    <button
                      key={exam.id}
                      onClick={() => loadSubjects(exam)}
                      className="bg-white border border-gray-200 rounded-2xl p-6 text-left group hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 transition-all duration-300 relative"
                    >
                      {exam.badge && (
                        <span className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                          exam.badge === 'Live' ? 'bg-red-100 text-red-600' : 
                          exam.badge === 'Upcoming' ? 'bg-blue-100 text-blue-600' : 
                          'bg-green-100 text-green-600'
                        }`}>
                          {exam.badge}
                        </span>
                      )}
                      <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <BookOpen className="text-primary" size={24} />
                      </div>
                      <h3 className="font-bold text-xl text-secondary mb-2 group-hover:text-primary transition-colors pr-16">{exam.name}</h3>
                      <p className="text-sm text-gray-500 mb-5 line-clamp-2 leading-relaxed">
                        {exam.description || "No description"}
                      </p>
                      <div className="flex items-center justify-between text-sm font-bold pt-4 border-t border-gray-100">
                        <span className="text-gray-600 group-hover:text-primary transition-colors">
                          {exam.subjects?.length || 0} Subjects
                        </span>
                        <div className="flex items-center gap-1 text-primary">
                          Explore <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
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
              <h1 className="text-3xl font-extrabold text-secondary mb-2 tracking-wide font-heading">{selectedExam?.name}</h1>
              <p className="text-gray-500 text-sm mb-8">Select a subject to view tests</p>
              {subjects.length === 0 ? (
                <p className="text-gray-500 py-12 text-center bg-white rounded-xl border border-gray-200">No subjects in this exam yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => loadTopics(subject)}
                      className="bg-white border border-gray-200 rounded-2xl p-6 text-left group hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <Layers className="text-primary" size={24} />
                      </div>
                      <h3 className="font-bold text-xl text-secondary mb-2 group-hover:text-primary transition-colors">{subject.name}</h3>
                      <p className="text-sm text-gray-500 mb-5 line-clamp-2 leading-relaxed">
                        {subject.description || "No description"}
                      </p>
                      <div className="flex items-center justify-between text-sm font-bold pt-4 border-t border-gray-100">
                        <span className="text-gray-600 group-hover:text-primary transition-colors">
                          {subject.topics?.length || (subject.id.startsWith('dsub') ? 3 : 0)} Tests
                        </span>
                        <ArrowRight className="text-primary group-hover:translate-x-1 transition-transform" size={18} />
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
              <h1 className="text-3xl font-extrabold text-secondary mb-2 tracking-wide font-heading">{selectedSubject?.name}</h1>
              <p className="text-gray-500 text-sm mb-8">Select a test to start</p>
              {topics.length === 0 ? (
                <p className="text-gray-500 py-12 text-center bg-white rounded-xl border border-gray-200">No tests in this subject yet.</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between group hover:border-primary/40 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Tags className="text-primary" size={22} />
                        </div>
                        <div>
                          <h3 className="font-bold text-secondary group-hover:text-primary transition-colors text-lg">{topic.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 font-medium">
                            <span>{topic.questions?.length || 0} Questions</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>{topic.questions?.length * 4 || 200} Marks</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>180 Mins</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => startExam(topic)}
                        disabled={!topic.questions || topic.questions.length === 0}
                        className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md w-full md:w-auto"
                      >
                        <Play size={16} fill="currentColor" /> Attempt Now
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
