import { useRef, useState, useEffect } from "react";

const COLORS = ["#ffffff", "#e94560", "#10b981", "#6c63ff", "#f59e0b"];
const SIZES = [2, 4, 8];

const ScratchPad = ({ isEmbedded = false, isOpen = true, onToggle }) => {
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
  }, [isOpen, isEmbedded]);

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
      {!isEmbedded && onToggle && (
        <button
          onClick={onToggle}
          className="bg-gray-50 hover:bg-dark-600 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {isOpen ? "Close Pad" : "Scratch Pad"}
        </button>
      )}

      {isOpen && (
        <div className={isEmbedded ? "w-full h-full flex flex-col surface-card shadow-sm border-gray-200 overflow-hidden" : "fixed bottom-4 left-4 z-30 w-[320px] h-[240px] bg-surface border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden"}>
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100 shrink-0">
            <span className="text-xs font-medium text-gray-500">Scratch Pad</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-1 mr-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-4 h-4 rounded-full border ${
                      color === c ? (c === "#ffffff" ? "border-gray-400" : "border-gray-900") : "border-transparent"
                    } shadow-sm`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <select
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="bg-surface text-xs text-gray-500 border border-gray-200 rounded px-1 py-0.5 focus:outline-none"
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}px
                  </option>
                ))}
              </select>
              <button
                onClick={clearCanvas}
                className="text-xs text-red-500 font-semibold hover:text-red-600 ml-2 bg-red-50 px-2 py-0.5 rounded"
              >
                Clear
              </button>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            className="flex-1 cursor-crosshair bg-gray-900 touch-none w-full h-full"
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
