import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Book className="h-8 w-8 text-primary" />
          {subject.name}
        </h1>
        <p className="text-gray-400 mt-2">{subject.description || "No description available."}</p>
      </div>

      <div className="space-y-4">
        {subject.units?.map((unit) => (
          <div key={unit._id} className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
            <button
              onClick={() => handleToggleUnit(unit._id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="bg-primary/20 text-primary text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                  {unit.unit_number}
                </span>
                <span className="text-lg font-medium text-white">{unit.title}</span>
              </div>
              {expandedUnit === unit._id ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
            </button>
            
            {expandedUnit === unit._id && (
              <div className="px-6 pb-6 border-t border-white/5 pt-4">
                <p className="text-gray-400 text-sm mb-4">{unit.description}</p>
                
                {/* Topics */}
                {unit.topics?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {unit.topics.map((t, i) => (
                        <span key={i} className="bg-dark-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Knowledge Actions */}
                <div className="mb-6 bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles size={16} /> AI Study Tools
                  </h4>
                  <div className="flex gap-3">
                    <button onClick={() => generateResource(unit._id, 'Summary')} disabled={generating} className="bg-primary/10 text-primary px-4 py-2 rounded text-sm hover:bg-primary hover:text-white transition">Generate Summary</button>
                    <button onClick={() => generateResource(unit._id, 'Flashcards')} disabled={generating} className="bg-primary/10 text-primary px-4 py-2 rounded text-sm hover:bg-primary hover:text-white transition">Generate Flashcards</button>
                    <button onClick={() => generateResource(unit._id, 'MCQ Quiz')} disabled={generating} className="bg-primary/10 text-primary px-4 py-2 rounded text-sm hover:bg-primary hover:text-white transition">Generate MCQ Quiz</button>
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Study Materials</h4>
                  {!materials[unit._id] ? (
                    <div className="text-gray-500 text-sm">Loading materials...</div>
                  ) : materials[unit._id].length === 0 ? (
                    <div className="text-gray-500 text-sm italic">No materials uploaded for this unit yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {materials[unit._id].map(m => (
                        <div key={m._id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors">
                          <div className="flex items-center gap-3">
                            {renderIcon(m.type)}
                            <div>
                              <p className="text-white text-sm font-medium">{m.title}</p>
                              {m.description && <p className="text-xs text-gray-400">{m.description}</p>}
                            </div>
                          </div>
                          <a
                            href={m.file_path.startsWith('http') ? m.file_path : `http://localhost:5000${m.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-gray-400 hover:text-white bg-dark-800 rounded-md"
                          >
                            <Download size={16} />
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
