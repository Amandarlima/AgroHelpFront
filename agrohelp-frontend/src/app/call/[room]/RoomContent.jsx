// src/app/call/[room]/RoomContent.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

const SIGNALING_SERVER_URL = "wss://agrohelp-layg.onrender.com";
const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
const EMOJIS = ["😀", "😂", "🔥", "❤️", "🍓", "🌽", "👍", "💪", "😎", "😱"];

export default function RoomContent({ room }) {
  const router = useRouter();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const socket = useRef(null);

  const chatContainerRef = useRef(null);
  const notificationSound = useRef(null);

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [user, setUser] = useState(null);

  const supabase = getSupabaseClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
        saveCallToHistory(data.user);
      }
    };
    checkUser();
  }, []);

  const saveCallToHistory = async (user) => {
    await supabase.from("calls").insert([
      { user_id: user.id, room, timestamp: new Date() },
    ]);
  };

  useEffect(() => {
    if (!user) return;

    socket.current = new WebSocket(SIGNALING_SERVER_URL);

    socket.current.onopen = () => {
      socket.current.send(JSON.stringify({ type: "join", room }));
    };

    socket.current.onmessage = async (message) => {
      const data = JSON.parse(message.data);

      if (data.type === "offer") {
        await handleOffer(data.offer);
      } else if (data.type === "answer") {
        await handleAnswer(data.answer);
      } else if (data.type === "candidate") {
        await handleCandidate(data.candidate);
      } else if (data.type === "chat") {
        setMessages((prev) => [...prev, { sender: data.sender, text: data.message }]);
        if (data.sender !== user.email && notificationSound.current) {
          notificationSound.current.play();
        }
      }
    };

    notificationSound.current = new Audio("/sounds/notification.mp3");

    return () => {
      socket.current.close();
    };
  }, [user]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;

    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

    stream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, stream);
    });

    peerConnection.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.send(
          JSON.stringify({ type: "candidate", candidate: event.candidate, room })
        );
      }
    };

    createOffer();
    setConnected(true);
  };

  const startScreenShare = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    localVideoRef.current.srcObject = stream;

    stream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, stream);
    });

    stream.getVideoTracks()[0].addEventListener("ended", () => {
      stopScreenShare();
    });

    setSharingScreen(true);
  };

  const stopScreenShare = async () => {
    localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    setSharingScreen(false);
    await startCamera();
  };

  const createOffer = async () => {
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.current.send(JSON.stringify({ type: "offer", offer, room }));
  };

  const handleOffer = async (offer) => {
    if (!peerConnection.current) {
      await startCamera();
    }
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.current.send(JSON.stringify({ type: "answer", answer, room }));
  };

  const handleAnswer = async (answer) => {
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleCandidate = async (candidate) => {
    try {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.error("Erro ao adicionar ICE", e);
    }
  };

  const closeConnection = () => {
    peerConnection.current.close();
    peerConnection.current = null;
    setConnected(false);
    setSharingScreen(false);
  };

  const leaveRoom = () => {
    closeConnection();
    router.push("/dashboard");
  };

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    socket.current.send(
      JSON.stringify({
        type: "chat",
        message: newMessage,
        sender: user.email,
        room,
      })
    );

    setMessages((prev) => [...prev, { sender: "Você", text: newMessage }]);
    setNewMessage("");
  };

  if (!user) return <p>Carregando...</p>;

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-800">Sala: {room}</h1>
        <button onClick={leaveRoom} className="bg-red-600 text-white px-3 py-1 rounded">Sair</button>
      </div>

      <div className="mt-4 flex flex-col md:flex-row gap-4">
        <video ref={localVideoRef} autoPlay muted className="w-full md:w-1/2 bg-black rounded" />
        <video ref={remoteVideoRef} autoPlay className="w-full md:w-1/2 bg-black rounded" />
      </div>

      <div className="mt-4">
        {!connected ? (
          <>
            <button onClick={startCamera} className="bg-green-600 text-white px-4 py-2 rounded mr-2">
              Iniciar Câmera
            </button>
            <button onClick={startScreenShare} className="bg-yellow-500 text-white px-4 py-2 rounded">
              Compartilhar Tela
            </button>
          </>
        ) : (
          <button onClick={closeConnection} className="bg-gray-600 text-white px-4 py-2 rounded">
            Encerrar Conexão
          </button>
        )}
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <div ref={chatContainerRef} className="h-64 overflow-y-auto mb-2">
          {messages.map((msg, idx) => (
            <div key={idx}><strong>{msg.sender}:</strong> {msg.text}</div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 border p-2 rounded"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Mensagem..."
          />
          <button onClick={sendMessage} className="bg-blue-600 text-white px-4 rounded">
            Enviar
          </button>
        </div>

        <div className="mt-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setNewMessage((prev) => prev + emoji)}
              className="text-2xl mr-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
