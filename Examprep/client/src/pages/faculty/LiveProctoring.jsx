import { useState, useRef, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import { Video, ShieldAlert, Wifi, XCircle, Users } from "lucide-react";

const LiveProctoring = () => {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // disconnected, connecting, connected
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socket = useSocket();

  const handleJoin = () => {
    if (!roomId.trim()) return;
    socket.emit("webrtc:join", { roomId });
    setJoined(true);
    setConnectionStatus("connecting");
  };

  const handleDisconnect = () => {
    setJoined(false);
    setConnectionStatus("disconnected");
    setRoomId("");
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  useEffect(() => {
    if (!socket || !joined) return;

    const setupPC = (peerId) => {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      peerConnectionRef.current = pc;

      // Allow receiving video from student
      pc.addTransceiver('video', { direction: 'recvonly' });

      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setConnectionStatus("connected");
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc:ice-candidate", { candidate: event.candidate, to: peerId });
        }
      };
      
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
            setConnectionStatus("disconnected");
        }
      };
      return pc;
    };

    socket.on("webrtc:offer", async ({ offer, from }) => {
      const pc = setupPC(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc:answer", { answer, to: from });
    });

    socket.on("webrtc:ice-candidate", async ({ candidate }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.log(e));
      }
    });

    socket.on("webrtc:peer-joined", async (peerId) => {
      const pc = setupPC(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc:offer", { offer, to: peerId });
    });

    socket.on("webrtc:answer", async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    return () => {
      socket.off("webrtc:offer");
      socket.off("webrtc:ice-candidate");
      socket.off("webrtc:peer-joined");
      socket.off("webrtc:answer");
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [socket, joined]);

  return (
    <div className="max-w-4xl mx-auto py-8 relative">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Video className="text-indigo-600" size={32} />
            Live Proctoring
          </h1>
          <p className="text-gray-500 mt-2">Connect to a student's live feed using their Attempt ID.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden relative z-10">
        {!joined ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <Users className="text-indigo-600 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect to Session</h2>
            <p className="text-gray-500 mb-8 max-w-md">Enter the student's unique Attempt ID to start monitoring their camera and screen activity.</p>
            
            <div className="flex w-full max-w-md gap-3">
              <input
                type="text"
                placeholder="e.g. 12345"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
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
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                  <span className="text-gray-300 text-sm font-medium">
                    {connectionStatus === 'connected' ? 'Live Feed Connected' : 'Connecting to Peer...'}
                  </span>
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
              {connectionStatus !== 'connected' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900/80 backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-indigo-400 font-medium tracking-wide">Waiting for student camera feed...</p>
                </div>
              )}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-contain ${connectionStatus === 'connected' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
              />
              
              {/* Overlay elements when connected */}
              {connectionStatus === 'connected' && (
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-xs font-medium text-white shadow-lg">
                  <ShieldAlert size={14} className="text-green-400" />
                  Secure Connection
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveProctoring;
