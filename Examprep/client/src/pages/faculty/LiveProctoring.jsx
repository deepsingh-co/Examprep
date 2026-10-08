import { useState, useRef, useEffect, useCallback } from "react";
import { useSocket } from "../../hooks/useSocket";
import { attemptService } from "../../services/attemptService";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  ShieldAlert,
  Wifi,
  XCircle,
  Users,
  MonitorUp,
  RefreshCw,
} from "lucide-react";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

const LiveProctoring = () => {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [camError, setCamError] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [feeds, setFeeds] = useState({ student: false, screen: false });
  const [activeAttempts, setActiveAttempts] = useState([]);

  const localVideoRef = useRef(null);
  const studentVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const pcRef = useRef(null);
  const peerIdRef = useRef(null);
  const localStreamRef = useRef(null);
  const studentStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const pendingIceRef = useRef([]);
  const joinedRef = useRef(false);

  const socket = useSocket();

  const fetchActiveAttempts = useCallback(async () => {
    try {
      const res = await attemptService.getActiveAttempts();
      setActiveAttempts(res.data.data || []);
    } catch {
      setActiveAttempts([]);
    }
  }, []);

  useEffect(() => {
    fetchActiveAttempts();
  }, [fetchActiveAttempts]);

  const stopLocalMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  };

  const closePeer = useCallback(() => {
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
    studentStreamRef.current = null;
    screenStreamRef.current = null;
    if (studentVideoRef.current) studentVideoRef.current.srcObject = null;
    if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
    setFeeds({ student: false, screen: false });
    setConnectionStatus("disconnected");
  }, []);

  const handleJoin = async () => {
    const id = roomId.trim();
    if (!id) return;

    setCamError(null);
    setConnectionStatus("connecting");
    setJoined(true);
    joinedRef.current = true;

    // Ask for the proctor's own camera/mic so the student can see/hear them.
    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    } catch {
      try {
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      } catch {
        localStreamRef.current = null;
        setCamError("Camera unavailable - you will still receive the student feed.");
      }
    }

    // Listeners are attached on mount; joining now is race-free.
    socket.emit("webrtc:join", { roomId: id });
  };

  const handleDisconnect = () => {
    joinedRef.current = false;
    setJoined(false);
    setConnectionStatus("disconnected");
    setRoomId("");
    socket.emit("webrtc:leave", { roomId });
    closePeer();
    stopLocalMedia();
  };

  const toggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((v) => !v);
  };

  const toggleCam = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn((v) => !v);
  };

  useEffect(() => {
    if (!socket) return;

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

      // Publish the proctor's own camera + microphone (2-way call).
      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => pc.addTrack(track, localStreamRef.current));
      }

      pc.ontrack = (event) => {
        const track = event.track;

        if (track.kind === "audio") {
          if (!studentStreamRef.current) studentStreamRef.current = new MediaStream();
          if (!studentStreamRef.current.getAudioTracks().includes(track)) {
            studentStreamRef.current.addTrack(track);
          }
          if (studentVideoRef.current) {
            studentVideoRef.current.srcObject = studentStreamRef.current;
          }
          return;
        }

        // Video tracks: first = student webcam, second = screen share.
        if (!studentStreamRef.current) studentStreamRef.current = new MediaStream();

        if (studentStreamRef.current.getVideoTracks().length === 0) {
          studentStreamRef.current.addTrack(track);
          if (studentVideoRef.current) {
            studentVideoRef.current.srcObject = studentStreamRef.current;
            studentVideoRef.current.play?.().catch(() => {});
          }
          setFeeds((f) => ({ ...f, student: true }));
        } else if (!screenStreamRef.current) {
          screenStreamRef.current = new MediaStream([track]);
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = screenStreamRef.current;
            screenVideoRef.current.play?.().catch(() => {});
          }
          setFeeds((f) => ({ ...f, screen: true }));
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
        if (!joinedRef.current) return;
        const state = pc.connectionState;
        if (state === "connected") setConnectionStatus("connected");
        if (state === "disconnected" || state === "failed") {
          setConnectionStatus("disconnected");
        }
        if (state === "connecting") setConnectionStatus("connecting");
      };

      return pc;
    };

    // The student is ALWAYS the offerer (their answer must mirror every
    // m-line so webcam + microphone + screen share all arrive). The proctor
    // only answers incoming offers.
    const handleOffer = async ({ offer, from }) => {
      if (!joinedRef.current) return;
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
      if (!joinedRef.current) return;
      closePeer();
      setConnectionStatus("disconnected");
    };

    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:answer", handleAnswer);
    socket.on("webrtc:ice-candidate", handleIce);
    socket.on("webrtc:peer-left", handlePeerLeft);

    return () => {
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:answer", handleAnswer);
      socket.off("webrtc:ice-candidate", handleIce);
      socket.off("webrtc:peer-left", handlePeerLeft);
      closePeer();
      stopLocalMedia();
    };
  }, [socket, closePeer]);

  const statusLabel =
    connectionStatus === "connected"
      ? "Live Feed Connected"
      : connectionStatus === "connecting"
      ? "Connecting to Peer..."
      : "Waiting for student...";

  return (
    <div className="max-w-5xl mx-auto py-8 relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Video className="text-indigo-600" size={32} />
            Live Proctoring
          </h1>
          <p className="text-gray-500 mt-2">
            Connect to a student's live camera &amp; screen feed using their Attempt ID.
          </p>
        </div>
        <button
          onClick={fetchActiveAttempts}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden relative z-10">
        {!joined ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <Users className="text-indigo-600 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect to Session</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              Enter the student's unique Attempt ID (shown in their exam top bar) to start a
              live video call with their camera and screen.
            </p>

            <div className="flex w-full max-w-md gap-3">
              <input
                type="text"
                placeholder="e.g. 65f1a2b3c4d5e6f7a8b9c0d1"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <button
                onClick={handleJoin}
                disabled={!roomId.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Wifi size={20} />
                Connect
              </button>
            </div>

            {activeAttempts.length > 0 && (
              <div className="mt-8 w-full max-w-2xl text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
                  Students currently in an exam
                </p>
                <div className="grid sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                  {activeAttempts.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setRoomId(a.id)}
                      className="flex items-center justify-between gap-2 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl px-4 py-2.5 text-left transition-all"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-gray-800 truncate">
                          {a.student_id?.name || "Student"}
                        </span>
                        <span className="block text-xs text-gray-500 truncate">
                          {a.topic_id?.name || "Test"}
                        </span>
                      </span>
                      <span className="text-[10px] font-mono text-indigo-600 shrink-0">
                        {String(a.id).slice(-8)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      connectionStatus === "connected"
                        ? "bg-green-500 animate-pulse"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <span className="text-gray-300 text-sm font-medium">{statusLabel}</span>
                </div>
                <div className="h-4 w-[1px] bg-gray-700"></div>
                <span className="text-gray-400 text-sm font-mono">ID: {roomId}</span>
              </div>
              <button
                onClick={handleDisconnect}
                className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <XCircle size={16} />
                End Session
              </button>
            </div>

            <div className="relative bg-black w-full aspect-video flex items-center justify-center">
              {connectionStatus !== "connected" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gray-900/80 backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-indigo-400 font-medium tracking-wide">
                    Waiting for student camera feed...
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Ask the student to share their screen to start the call
                  </p>
                </div>
              )}

              <video
                ref={studentVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-contain transition-opacity duration-500 ${
                  feeds.student ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Student screen share (picture-in-picture) */}
              {feeds.screen && (
                <div className="absolute bottom-4 right-4 w-56 aspect-video rounded-lg overflow-hidden border border-white/20 shadow-2xl z-30 bg-black">
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-1 left-1.5 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded">
                    <MonitorUp size={10} className="text-indigo-300" />
                    <span className="text-[9px] text-white font-medium">Screen</span>
                  </div>
                </div>
              )}

              {/* Proctor self view */}
              <div className="absolute top-4 right-4 w-36 aspect-video rounded-lg overflow-hidden border border-white/20 shadow-2xl z-30 bg-gray-900">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${camOn ? "" : "opacity-20"}`}
                />
                {!camOn && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VideoOff size={18} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-1 left-1.5 text-[9px] text-gray-300 font-medium">
                  You
                </div>
              </div>

              {connectionStatus === "connected" && (
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-xs font-medium text-white shadow-lg z-30">
                  <ShieldAlert size={14} className="text-green-400" />
                  Secure Live Session
                </div>
              )}
            </div>

            <div className="px-6 py-4 flex items-center justify-center gap-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={toggleMic}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  micOn
                    ? "bg-white border border-gray-200 text-gray-700 hover:border-indigo-400"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
                title={micOn ? "Mute microphone" : "Unmute microphone"}
              >
                {micOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button
                onClick={toggleCam}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  camOn
                    ? "bg-white border border-gray-200 text-gray-700 hover:border-indigo-400"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
                title={camOn ? "Turn camera off" : "Turn camera on"}
              >
                {camOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
            </div>

            {camError && (
              <p className="px-6 pb-4 text-xs text-amber-600 bg-amber-50 border-t border-amber-100 py-2">
                {camError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveProctoring;
