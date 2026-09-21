import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { BookOpen, Plus, Save } from "lucide-react";

export default function SubjectBuilder() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setUnits(subject.units || []);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative z-10">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        <BookOpen className="h-8 w-8 text-primary" />
        Subject Builder
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="surface-card p-4">
          <h2 className="font-semibold text-lg mb-4 text-gray-900">Subjects</h2>
          <div className="space-y-2">
            {subjects.map((sub) => (
              <button
                key={sub._id}
                onClick={() => handleSelectSubject(sub)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  selectedSubject?._id === sub._id ? "bg-primary/20 text-primary font-medium" : "hover:bg-gray-50 text-gray-500"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 surface-card p-6 space-y-4">
          {selectedSubject ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">{selectedSubject.name} - Units</h2>
              </div>
              
              <div className="space-y-4">
                {units.map((unit) => (
                  <div key={unit._id} className="interactive-card border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-lg text-gray-900">Unit {unit.unit_number}: {unit.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{unit.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {unit.topics?.map((topic, i) => (
                        <span key={i} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {units.length === 0 && (
                  <div className="text-gray-500 text-center py-8">No units found for this subject.</div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Select a subject from the left panel to view its structure.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
