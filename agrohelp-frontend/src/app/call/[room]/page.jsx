"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";

const SIGNALING_SERVER_URL = "wss://agrohelp-layg.onrender.com";
const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
const supabase = getSupabaseClient();

const EMOJIS = ["😀", "😂", "🔥", "❤️", "🍓", "🌽", "👍", "💪", "😎", "😱"];

export default function RoomPage() {
  const { room } = useParams();
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
    await supabase.from("calls").insert([{ user_id: user.id, room, timestamp: new Date() }]);
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

    return () => socket.current.close();
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
        socket.current.send(JSON.stringify({ type: "candidate", candidate: event.candidate, room }));
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

    stream.getVideoTracks()[0].addEventListener("ended", () => stopScreenShare());
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
    if (!peerConnection.current) await startCamera();
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

  const leaveRoom = () => {
    if (peerConnection.current) peerConnection.current.close();
    if (socket.current) socket.current.close();
    router.push("/dashboard");
  };

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    socket.current.send(JSON.stringify({ type: "chat", message: newMessage, sender: user.email, room }));
    setMessages((prev) => [...prev, { sender: "Você", text: newMessage }]);
    setNewMessage("");
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("uploads").upload(filePath, file);

    if (!error) {
      const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
      const fileUrl = data.publicUrl;
      socket.current.send(JSON.stringify({ type: "chat", message: `📁 Arquivo enviado: ${fileUrl}`, sender: user.email, room }));
      setMessages((prev) => [...prev, { sender: "Você", text: `📁 Arquivo enviado: ${fileUrl}` }]);
    }

    setUploading(false);
  };

  if (!user) return <p className="text-center py-8">Carregando...</p>;

  return (
    <div className="min-h-screen bg-green-50 text-black p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🎥 Sala: {room}</h1>
        <button
          onClick={leaveRoom}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Sair da Sala
        </button>
      </div>
      <p className="mb-4">Logado como: {user.email}</p>

      <div className="flex flex-wrap gap-6 justify-center">
        <div className="flex flex-col items-center">
          <p>Minha Câmera/Tela</p>
          <video ref={localVideoRef} autoPlay muted className="w-[480px] h-[320px] rounded bg-black" />
        </div>
        <div className="flex flex-col items-center">
          <p>Parceiro</p>
          <video ref={remoteVideoRef} autoPlay className="w-[480px] h-[320px] rounded bg-black" />
        </div>
        <div className="w-[400px] bg-white rounded shadow flex flex-col">
          <div ref={chatContainerRef} className="flex-1 p-2 overflow-y-auto max-h-[320px]">
            {messages.map((msg, index) => (
              <div key={index} className="mb-1">
                <span className="font-bold">{msg.sender}:</span> {msg.text.includes("📁") ? (
                  <a href={msg.text.split(" ")[2]} target="_blank" className="text-blue-600 underline" rel="noopener noreferrer">Arquivo</a>
                ) : msg.text}
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              className="flex-1 border rounded px-2"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Mensagem..."
            />
            <button onClick={sendMessage} className="bg-green-600 text-white px-3 rounded hover:bg-green-700">
              Enviar
            </button>
            <label className="bg-blue-600 text-white px-3 rounded cursor-pointer hover:bg-blue-700">
              {uploading ? "..." : "📁"}
              <input type="file" className="hidden" onChange={uploadFile} />
            </label>
          </div>
          <div className="flex gap-1 p-2 border-t">
            {EMOJIS.map((emoji) => (
              <button key={emoji} onClick={() => setNewMessage((prev) => prev + emoji)} className="text-xl">
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-6 justify-center">
        {!connected ? (
          <>
            <button onClick={startCamera} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">
              Iniciar Câmera
            </button>
            <button onClick={startScreenShare} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
              Compartilhar Tela
            </button>
          </>
        ) : (
          <button onClick={leaveRoom} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Encerrar
          </button>
        )}
      </div>
    </div>
  );
}
