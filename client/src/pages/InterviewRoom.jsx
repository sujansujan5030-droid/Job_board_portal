import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const peerConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export default function InterviewRoom() {
  const { applicationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const [isJoined, setIsJoined] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (user.role !== 'jobseeker' && user.role !== 'employer') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      cleanupInterview();
    };
  }, []);

  const cleanupInterview = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId: applicationId });
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const createPeerConnection = () => {
    const peerConnection = new RTCPeerConnection(peerConfig);
    peerConnectionRef.current = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('send-ice-candidate', {
          roomId: applicationId,
          candidate: event.candidate,
          senderName: user?.name || 'Participant',
          senderRole: user?.role || 'jobseeker'
        });
      }
    };

    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return peerConnection;
  };

  const joinInterview = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('This browser does not support webcam access.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const socket = io('http://localhost:5000', { transports: ['websocket'] });
      socketRef.current = socket;

      const peerConnection = createPeerConnection();
      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

      socket.on('room-joined', async () => {
        setIsJoined(true);
        setError('');
      });

      socket.on('user-connected', async ({ socketId }) => {
        if (socketId === socket.id) return;
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('send-offer', {
          roomId: applicationId,
          offer,
          senderName: user?.name || 'Participant',
          senderRole: user?.role || 'jobseeker'
        });
      });

      socket.on('receive-offer', async ({ offer, senderName, senderRole, socketId }) => {
        if (socketId === socket.id) return;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('send-answer', {
          roomId: applicationId,
          answer,
          senderName: user?.name || 'Participant',
          senderRole: user?.role || 'jobseeker'
        });
      });

      socket.on('receive-answer', async ({ answer, socketId }) => {
        if (socketId === socket.id) return;
        if (peerConnection.remoteDescription) return;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on('receive-ice-candidate', async ({ candidate, socketId }) => {
        if (socketId === socket.id) return;
        if (candidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      socket.on('user-left', () => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

      socket.emit('join-room', {
        roomId: applicationId,
        userName: user?.name || 'Participant',
        role: user?.role || 'jobseeker'
      });
    } catch (err) {
      console.error(err);
      setError('Camera and microphone access is required to join the interview.');
    }
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    const videoTrack = stream?.getVideoTracks?.()[0];
    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
    setCameraOn(videoTrack.enabled);
  };

  const toggleMic = () => {
    const stream = localStreamRef.current;
    const audioTrack = stream?.getAudioTracks?.()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setMicOn(audioTrack.enabled);
  };

  const endInterview = () => {
    cleanupInterview();
    setIsJoined(false);
    navigate(user?.role === 'jobseeker' ? '/dashboard' : '/employer/dashboard');
  };

  const roomCode = applicationId || 'demo-room';

  return (
    <div style={{ maxWidth: 1200, margin: '32px auto', padding: '0 20px' }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 10px 30px rgba(17,24,39,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, color: '#2563eb', fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', fontSize: 12 }}>
              Interview room
            </p>
            <h2 style={{ margin: '8px 0 0', fontSize: 36 }}>Live candidate interview</h2>
          </div>

          <div style={{ background: '#eef4ff', borderRadius: 999, padding: '10px 16px', fontWeight: 700, color: '#1d4ed8' }}>
            Room: {roomCode}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.8fr', gap: 20 }}>
          <div style={{ background: '#0f172a', borderRadius: 18, overflow: 'hidden', minHeight: 360, position: 'relative' }}>
            {isJoined ? (
              <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ display: 'grid', placeItems: 'center', minHeight: 360, color: '#e2e8f0', textAlign: 'center', padding: 24 }}>
                <div>
                  <h3 style={{ marginBottom: 12, fontSize: 24 }}>Join the video call</h3>
                  <button onClick={joinInterview} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 16, cursor: 'pointer', fontWeight: 700 }}>
                    Join interview
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ background: '#0f172a', borderRadius: 18, overflow: 'hidden', minHeight: 360, position: 'relative' }}>
            {isJoined ? (
              <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ display: 'grid', placeItems: 'center', minHeight: 360, color: '#cbd5e1', textAlign: 'center', padding: 24 }}>
                <div>
                  <h3 style={{ marginBottom: 12, fontSize: 22 }}>Waiting for the other participant</h3>
                  <p style={{ margin: 0 }}>When both sides join the same room, the video will appear here.</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#f8fafc', borderRadius: 18, padding: 18, border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginTop: 0 }}>Meeting details</h3>
              <p style={{ marginBottom: 8 }}><strong>Role:</strong> Live interview</p>
              <p style={{ marginBottom: 8 }}><strong>Type:</strong> Video + audio call</p>
              <p style={{ margin: 0 }}><strong>Access:</strong> Browser webcam</p>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 18, padding: 18, border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginTop: 0 }}>Controls</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={toggleCamera} disabled={!isJoined} style={{ flex: 1, minWidth: 110, background: cameraOn ? '#0f172a' : '#ef4444', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: isJoined ? 'pointer' : 'not-allowed', opacity: isJoined ? 1 : 0.55 }}>
                  {cameraOn ? 'Camera on' : 'Camera off'}
                </button>
                <button onClick={toggleMic} disabled={!isJoined} style={{ flex: 1, minWidth: 110, background: micOn ? '#2563eb' : '#ef4444', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: isJoined ? 'pointer' : 'not-allowed', opacity: isJoined ? 1 : 0.55 }}>
                  {micOn ? 'Mic on' : 'Mic off'}
                </button>
              </div>

              <button onClick={endInterview} style={{ marginTop: 16, width: '100%', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', fontWeight: 700 }}>
                End interview
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 20, borderRadius: 12, background: '#fef2f2', color: '#b91c1c', padding: '12px 16px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
