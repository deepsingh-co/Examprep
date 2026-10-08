import { useRef, useEffect, useState } from "react";
import { Camera, AlertTriangle, XCircle, Eye, Users, PhoneOff } from "lucide-react";
import { useSocket } from "../../hooks/useSocket";
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

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

const DETECT_INTERVAL = 1500;
const TRIGGER_COOLDOWN = 8000;
const GRACE_PERIOD = 5000;

const CameraMonitor = ({ onViolation, violationCount, roomId, screenStream }) => {
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const pcRef = useRef(null);
  const peerIdRef = useRef(null);
  const pendingIceRef = useRef([]);
  const onViolationRef = useRef(onViolation);

  const socket = useSocket();
  const [cameraOn, setCameraOn] = useState(false);
  const [remoteOn, setRemoteOn] = useState(false);
  const [proctorConnected, setProctorConnected] = useState(false);
  const [error, setError] = useState(null);
  const [detectionReady, setDetectionReady] = useState(false);
  const [status, setStatus] = useState({
    label: "Initializing",
    tone: "text-gray-500",
  });

  useEffect(() => {
    onViolationRef.current = onViolation;
  });

  useEffect(() => {
    if (!socket || !roomId) return;

    let cancelled = false;
    let localStream = null;
    let detectorLoop = null;
    let lastResult = "ok";
    let lastTriggerAt = 0;
    const mountedAt = Date.now();

    const closePeer = () => {
      const pc = pcRef.current;
      if (pc) {
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.onconnectionstatechange = null;
        try {
          pc.close();
        } catch (_) {}
      }
      pcRef.current = null;
      peerIdRef.current = null;
      pendingIceRef.current = [];
      setProctorConnected(false);
      setRemoteOn(false);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    };

    const flushPendingIce = async (pc) => {
      const queued = pendingIceRef.current.splice(0);
      for (const candidate of queued) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("addIceCandidate failed", err);
        }
      }
    };

    const createPeer = (peerId) => {
      closePeer();
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;
      peerIdRef.current = peerId;

      // Student publishes webcam + microphone and the exam screen share.
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => pc.addTrack(track, streamRef.current));
      }
      if (screenStream) {
        screenStream
          .getVideoTracks()
          .forEach((track) => pc.addTrack(track, screenStream));
      }

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.play?.().catch(() => {});
          setRemoteOn(true);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc:ice-candidate", {
            candidate: event.candidate,
            to: peerId,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === "connected") setProctorConnected(true);
        if (state === "disconnected" || state === "failed" || state === "closed") {
          setProctorConnected(false);
        }
      };

      return pc;
    };

    const connectAsOfferer = async (peerId) => {
      try {
        const pc = createPeer(peerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc:offer", { offer, to: peerId });
      } catch (err) {
        console.error("WebRTC offer failed", err);
      }
    };

    const handleOffer = async ({ offer, from }) => {
      try {
        const pc = createPeer(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushPendingIce(pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc:answer", { answer, to: from });
      } catch (err) {
        console.error("WebRTC answer failed", err);
      }
    };

    const handleAnswer = async ({ answer }) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushPendingIce(pc);
      } catch (err) {
        console.warn("setRemoteDescription(answer) failed", err);
      }
    };

    const handleIce = async ({ candidate }) => {
      if (!candidate) return;
      const pc = pcRef.current;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("addIceCandidate failed", err);
        }
      } else {
        pendingIceRef.current.push(candidate);
      }
    };

    const handlePeerLeft = () => {
      closePeer();
    };

    const handlePeers = (peers) => {
      if (Array.isArray(peers) && peers.length > 0) {
        connectAsOfferer(peers[0]);
      }
    };

    // The student is ALWAYS the offerer:
    // - "webrtc:peers"      -> student joined a room the proctor is already in
    // - "webrtc:peer-joined" -> proctor joined after the student
    const handlePeerJoined = (peerId) => {
      if (peerId) connectAsOfferer(peerId);
    };

    // Listeners are attached BEFORE joining the room so no signaling
    // message can be missed.
    socket.on("webrtc:peers", handlePeers);
    socket.on("webrtc:peer-joined", handlePeerJoined);
    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:answer", handleAnswer);
    socket.on("webrtc:ice-candidate", handleIce);
    socket.on("webrtc:peer-left", handlePeerLeft);

    const startDetection = () => {
      if (cancelled) return;

      FilesetResolver.forVisionTasks(WASM_URL)
        .then((vision) =>
          Promise.all([
            FaceDetector.createFromOptions(vision, {
              baseOptions: { modelAssetPath: FACE_MODEL_URL },
              runningMode: "VIDEO",
              minDetectionConfidence: 0.5,
            }),
            ObjectDetector.createFromOptions(vision, {
              baseOptions: { modelAssetPath: OBJECT_MODEL_URL },
              runningMode: "VIDEO",
              scoreThreshold: 0.4,
            }),
          ])
        )
        .then(([faceDetector, objectDetector]) => {
          if (cancelled) return;
          setDetectionReady(true);
          setStatus({ label: "Monitoring", tone: "text-green-400" });

          detectorLoop = setInterval(() => {
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
              ok: {
                label: faceCount > 0 ? "Face detected" : "Scanning",
                tone: "text-green-400",
              },
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
              onViolationRef.current?.(msgMap[result]);
            }
            if (result === "ok") lastResult = "ok";
          }, DETECT_INTERVAL);
        })
        .catch(() => {
          if (cancelled) return;
          setDetectionReady(false);
          setStatus({ label: "Detection off", tone: "text-gray-500" });
        });
    };

    const startCamera = async () => {
      try {
        try {
          localStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: "user" },
            audio: true,
          });
        } catch {
          // Microphone denied - continue with video only
          localStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: "user" },
          });
        }
      } catch {
        if (!cancelled) setError("Camera access is required for this exam.");
        return;
      }

      if (cancelled) {
        localStream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = localStream;
      if (videoRef.current) {
        videoRef.current.srcObject = localStream;
        setCameraOn(true);
      }

      if (screenStream) {
        const screenTrack = screenStream.getVideoTracks()[0];
        if (screenTrack) {
          const surface = screenTrack.getSettings?.().displaySurface;
          if (surface && surface !== "monitor") {
            onViolationRef.current?.(
              "You must share your Entire Screen. Window or Tab sharing is not allowed."
            );
          }
          screenTrack.onended = () => {
            onViolationRef.current?.(
              "Screen sharing stopped! This is a severe violation."
            );
          };
        }
      }

      // Join the call room only once local media is ready, so the offer
      // created for existing peers always carries the student's tracks.
      socket.emit("webrtc:join", { roomId });

      startDetection();
    };

    startCamera();

    return () => {
      cancelled = true;
      if (detectorLoop) clearInterval(detectorLoop);

      socket.off("webrtc:peers", handlePeers);
      socket.off("webrtc:peer-joined", handlePeerJoined);
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:answer", handleAnswer);
      socket.off("webrtc:ice-candidate", handleIce);
      socket.off("webrtc:peer-left", handlePeerLeft);

      closePeer();

      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;

      socket.emit("webrtc:leave", { roomId });
    };
  }, [socket, roomId, screenStream]);

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
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 ${
                remoteOn ? "opacity-100" : "opacity-0"
              }`}
            />
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`object-cover transition-all duration-300 ${
                remoteOn
                  ? "absolute bottom-2 right-2 w-1/3 h-1/3 border-2 border-primary rounded-lg shadow-lg z-20"
                  : "w-full h-full"
              }`}
            />
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full z-30">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-white font-medium">LIVE</span>
        </div>
        {proctorConnected && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary/90 text-white px-2 py-0.5 rounded-full z-30 shadow-sm">
            <Users size={12} />
            <span className="text-[10px] font-medium">Proctor Connected</span>
          </div>
        )}
        {!proctorConnected && cameraOn && !error && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-gray-300 px-2 py-0.5 rounded-full z-30">
            <PhoneOff size={11} />
            <span className="text-[10px] font-medium">Waiting for proctor</span>
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-full z-30">
          <Eye size={12} className={status.tone} />
          <span className={`text-[10px] font-medium ${status.tone}`}>
            {cameraOn && status.label}
          </span>
          {detectionReady && (
            <span className="text-[9px] text-gray-400">AI</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraMonitor;
