import { useRef, useEffect, useState } from "react";
import { Camera, AlertTriangle, XCircle, Eye, Users } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import {
  FaceDetector,
  ObjectDetector,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const FACE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";
const OBJECT_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite";

const DETECT_INTERVAL = 1500;
const TRIGGER_COOLDOWN = 8000;
const GRACE_PERIOD = 5000;

const CameraMonitor = ({ onViolation, violationCount, roomId }) => {
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socket = useSocket();
  const [cameraOn, setCameraOn] = useState(false);
  const [remoteOn, setRemoteOn] = useState(false);
  const [error, setError] = useState(null);
  const [detectionReady, setDetectionReady] = useState(false);
  const [status, setStatus] = useState({
    label: "Initializing",
    tone: "text-gray-500",
  });

  useEffect(() => {
    let stream = null;
    let detectorLoop = null;
    let cancelled = false;
    let lastResult = "ok";
    let lastTriggerAt = 0;
    let mountedAt = Date.now();

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });
        if (cancelled) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraOn(true);
        }
      } catch {
        if (!cancelled) setError("Camera access denied");
        return;
      }

      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        const faceDetector = await FaceDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: FACE_MODEL_URL },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.5,
        });
        const objectDetector = await ObjectDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: OBJECT_MODEL_URL },
          runningMode: "VIDEO",
          scoreThreshold: 0.4,
        });
        if (cancelled) return;
        setDetectionReady(true);
        setStatus({ label: "Monitoring", tone: "text-green-400" });

        const runDetection = () => {
          const video = videoRef.current;
          if (!video || video.readyState < 2) return;
          const ts = performance.now();

          let faceCount = 0;
          try {
            faceCount = faceDetector.detectForVideo(video, ts).detections.length;
          } catch (_) {}

          let phoneDetected = false;
          try {
            phoneDetected = objectDetector
              .detectForVideo(video, ts)
              .detections.some((d) =>
                d.categories.some((c) => c.categoryName === "cell phone")
              );
          } catch (_) {}

          let result = "ok";
          if (phoneDetected) result = "phone";
          else if (faceCount > 1) result = "multi";
          else if (faceCount === 0) result = "no-face";

          const statusMap = {
            ok: { label: faceCount > 0 ? "Face detected" : "Scanning", tone: "text-green-400" },
            "no-face": { label: "No face detected", tone: "text-amber-400" },
            multi: { label: "Multiple faces", tone: "text-purple-400" },
            phone: { label: "Phone detected", tone: "text-red-400" },
          };
          setStatus(statusMap[result]);

          const now = Date.now();
          const msgMap = {
            "no-face": "No face detected! Please keep facing the camera.",
            multi: "Multiple faces detected in view!",
            phone: "Phone detected! Remove it from view.",
          };

          if (
            result !== "ok" &&
            result !== lastResult &&
            now - lastTriggerAt > TRIGGER_COOLDOWN &&
            now - mountedAt > GRACE_PERIOD
          ) {
            lastResult = result;
            lastTriggerAt = now;
            onViolation(msgMap[result]);
          }
          if (result === "ok") lastResult = "ok";
        };

        detectorLoop = setInterval(runDetection, DETECT_INTERVAL);
      } catch (err) {
        if (!cancelled) {
          setDetectionReady(false);
          setStatus({ label: "Detection off", tone: "text-gray-500" });
        }
      }
    };

    startCamera().then(() => {
      if (socket && roomId && stream) {
        socket.emit("webrtc:join", { roomId });

        const setupPC = (peerId) => {
          const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
          peerConnectionRef.current = pc;
          stream.getTracks().forEach(track => pc.addTrack(track, stream));

          pc.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams[0]) {
              remoteVideoRef.current.srcObject = event.streams[0];
              setRemoteOn(true);
            }
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("webrtc:ice-candidate", { candidate: event.candidate, to: peerId });
            }
          };
          return pc;
        };

        socket.on("webrtc:peer-joined", async (peerId) => {
          const pc = setupPC(peerId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc:offer", { offer, to: peerId });
        });

        socket.on("webrtc:offer", async ({ offer, from }) => {
          const pc = setupPC(from);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("webrtc:answer", { answer, to: from });
        });

        socket.on("webrtc:answer", async ({ answer }) => {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socket.on("webrtc:ice-candidate", async ({ candidate }) => {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.log(e));
          }
        });
      }
    });

    return () => {
      cancelled = true;
      if (detectorLoop) clearInterval(detectorLoop);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socket) {
        socket.off("webrtc:peer-joined");
        socket.off("webrtc:offer");
        socket.off("webrtc:answer");
        socket.off("webrtc:ice-candidate");
      }
    };
  }, [onViolation, socket, roomId]);

  return (
    <div className="bg-surface border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
        <div className="flex items-center gap-2">
          <Camera size={14} className="text-primary" />
          <span className="text-xs font-medium">Proctoring</span>
          {cameraOn && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-yellow-400" />
          <span className="text-xs text-gray-500">
            {violationCount}/3
          </span>
        </div>
      </div>

      <div className="relative aspect-[4/3] bg-background">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-xs text-center px-4">
            <XCircle size={24} className="mb-2 text-red-400" />
            {error}
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {remoteOn && (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-10"
              />
            )}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`object-cover ${remoteOn ? "absolute bottom-2 right-2 w-1/3 h-1/3 border-2 border-primary rounded-lg shadow-lg z-20" : "w-full h-full"}`}
            />
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full z-30">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-gray-900 font-medium">LIVE</span>
        </div>
        {remoteOn && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary/80 text-white px-2 py-0.5 rounded-full z-30 shadow-sm">
            <Users size={12} />
            <span className="text-[10px] font-medium">Proctor Connected</span>
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-full z-30">
          <Eye size={12} className={status.tone} />
          <span className={`text-[10px] font-medium ${status.tone}`}>
            {cameraOn && status.label}
          </span>
          {detectionReady && (
            <span className="text-[9px] text-gray-500">AI</span>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraMonitor;