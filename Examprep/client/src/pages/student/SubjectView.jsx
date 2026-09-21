import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { Book, FileText, ChevronDown, ChevronRight, Video, File, Download, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function SubjectView() {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [materials, setMaterials] = useState({});
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSubject();
  }, [id]);

  const fetchSubject = async () => {
    try {
      const res = await api.get(`/subjects/${id}`);
      setSubject(res.data.data);
      if (res.data.data?.units?.length > 0) {
        setExpandedUnit(res.data.data.units[0]._id);
        fetchMaterials(res.data.data.units[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMaterials = async (unitId) => {
    if (materials[unitId]) return;
    try {
      const res = await api.get(`/materials?unit_id=${unitId}`);
      setMaterials((prev) => ({ ...prev, [unitId]: res.data.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUnit = (unitId) => {
    setExpandedUnit(expandedUnit === unitId ? null : unitId);
    if (expandedUnit !== unitId) {
      fetchMaterials(unitId);
    }
  };

  const generateResource = async (unitId, type) => {
    try {
      setGenerating(true);
      const res = await api.post("/knowledge/generate", {
        subject_id: id,
        unit_id: unitId,
        resource_type: type,
      });
      // Just showing a toast for now. Normally we'd display this in a modal or new page.
      toast.success(`${type} generated successfully! Check console for output.`);
      console.log(res.data.data.resource);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate resource");
    } finally {
      setGenerating(false);
    }
  };

  const renderIcon = (type) => {
    if (type === "pdf") return <FileText className="text-red-400" size={18} />;
    if (type === "video_link") return <Video className="text-blue-400" size={18} />;
    return <File className="text-gray-400" size={18} />;
  };

  if (!subject) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6 relative z-10">
      <div className="glass-panel p-6 mb-8">
        <h1 className="text-4xl font-extrabold text-white flex items-center gap-4 tracking-wide">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Book className="h-8 w-8" />
          </div>
          {subject.name}
        </h1>
        <p className="text-gray-300 mt-4 text-lg leading-relaxed max-w-3xl ml-18">{subject.description || "No description available."}</p>
      </div>

      <div className="space-y-6">
        {subject.units?.map((unit) => (
          <div key={unit._id} className="glass-panel overflow-hidden transition-all duration-300">
            <button
              onClick={() => handleToggleUnit(unit._id)}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="bg-primary/20 border border-primary/30 text-primary text-sm font-bold w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.2)] group-hover:scale-110 transition-transform">
                  {unit.unit_number}
                </span>
                <span className="text-xl font-bold text-white tracking-wide">{unit.title}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                {expandedUnit === unit._id ? <ChevronDown className="text-white" size={18} /> : <ChevronRight className="text-gray-400" size={18} />}
              </div>
            </button>
            
            {expandedUnit === unit._id && (
              <div className="px-6 pb-6 border-t border-white/10 pt-6 bg-dark-900/30">
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">{unit.description}</p>
                
                {/* Topics */}
                {unit.topics?.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Topics Covered</h4>
                    <div className="flex flex-wrap gap-2">
                      {unit.topics.map((t, i) => (
                        <span key={i} className="glass-card text-gray-200 px-4 py-1.5 rounded-lg text-sm font-medium border-white/10">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Knowledge Actions */}
                <div className="mb-8 glass-card bg-primary/5 p-6 rounded-2xl border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                  <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">
                    <Sparkles size={18} /> AI Study Tools
                  </h4>
                  <div className="flex flex-wrap gap-4 relative z-10">
                    <button onClick={() => generateResource(unit._id, 'Summary')} disabled={generating} className="bg-primary/20 border border-primary/30 text-primary px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all shadow-[0_0_10px_rgba(139,92,246,0.1)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5">Generate Summary</button>
                    <button onClick={() => generateResource(unit._id, 'Flashcards')} disabled={generating} className="bg-primary/20 border border-primary/30 text-primary px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all shadow-[0_0_10px_rgba(139,92,246,0.1)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5">Generate Flashcards</button>
                    <button onClick={() => generateResource(unit._id, 'MCQ Quiz')} disabled={generating} className="bg-primary/20 border border-primary/30 text-primary px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all shadow-[0_0_10px_rgba(139,92,246,0.1)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5">Generate MCQ Quiz</button>
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Study Materials</h4>
                  {!materials[unit._id] ? (
                    <div className="text-primary text-sm flex items-center gap-2 animate-pulse"><Sparkles size={16}/> Loading materials...</div>
                  ) : materials[unit._id].length === 0 ? (
                    <div className="glass-card p-6 text-center text-gray-400 text-sm italic rounded-xl border-dashed">No materials uploaded for this unit yet.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {materials[unit._id].map(m => (
                        <div key={m._id} className="glass-card p-4 rounded-xl hover:-translate-y-1 transition-transform duration-300 flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-dark-800 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                              {renderIcon(m.type)}
                            </div>
                            <div>
                              <p className="text-white text-sm font-bold mb-0.5 line-clamp-1">{m.title}</p>
                              {m.description && <p className="text-xs text-gray-400 line-clamp-1">{m.description}</p>}
                            </div>
                          </div>
                          <a
                            href={m.file_path.startsWith('http') ? m.file_path : `http://localhost:5000${m.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
