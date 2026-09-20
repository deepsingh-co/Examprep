import { useRef, useState, useEffect } from "react";

const COLORS = ["#ffffff", "#e94560", "#10b981", "#6c63ff", "#f59e0b"];
const SIZES = [2, 4, 8];

const ScratchPad = ({ isOpen, onToggle }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(4);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctxRef.current = ctx;
  }, [isOpen]);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e;
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    const { x, y } = getPos(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const endDraw = () => setDrawing(false);

  const clearCanvas = () => {
    if (!ctxRef.current) return;
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <>
      <button
        onClick={onToggle}
        className="bg-dark-700 hover:bg-dark-600 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        {isOpen ? "Close Pad" : "Scratch Pad"}
      </button>

      {isOpen && (
        <div className="fixed bottom-4 left-4 z-30 w-[320px] h-[240px] bg-dark-800 border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-dark-700 border-b border-white/5">
            <span className="text-xs font-medium text-gray-400">Scratch Pad</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-1 mr-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-4 h-4 rounded-full border ${
                      color === c ? "border-white" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <select
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="bg-dark-800 text-xs text-gray-400 border border-white/10 rounded px-1 py-0.5"
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}px
                  </option>
                ))}
              </select>
              <button
                onClick={clearCanvas}
                className="text-xs text-red-400 hover:text-red-300 ml-2"
              >
                Clear
              </button>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            className="flex-1 cursor-crosshair bg-dark-900 touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>
      )}
    </>
  );
};

export default ScratchPad;
