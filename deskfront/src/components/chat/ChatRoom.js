import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useInfiniteChat from "../../hooks/useInfiniteChat";

/**
 * ✅ 백엔드/WS 제거 버전
 * - SockJS / STOMP 제거
 * - getChatMessages / markAsRead / getTicketInfo 제거
 * - 로컬 목업 메시지 + 로컬 전송으로만 동작
 * - 나중에 다시 붙이기 쉽도록 "자리" 주석 남김
 */

const ChatRoom = ({ chatRoomId, currentUserId, otherUserId, chatRoomInfo }) => {
  const navigate = useNavigate();

  // 로컬 메시지 저장소 (방마다 분리)
  const storageKey = useMemo(() => `mock_chat_messages_${chatRoomId}`, [chatRoomId]);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  // 백엔드 없으니 connected는 항상 true로(입력 가능)
  const [connected] = useState(true);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // 무한 스크롤 훅
  const { visibleMessages, onScroll, scrollToBottom, setContainerRef, reset } = useInfiniteChat(messages, 30);

  // 컨테이너 ref 설정
  useEffect(() => {
    setContainerRef(chatContainerRef.current);
  }, [setContainerRef]);

  // 방 변경 시 초기화
  useEffect(() => {
    reset();
  }, [chatRoomId, reset]);

  // ✅ 목업: 초기 메시지(로컬스토리지에 없을 때만)
  const createInitialMessages = () => {
    const now = new Date();
    return [
      {
        id: `${chatRoomId}-m1`,
        chatRoomId,
        senderId: otherUserId || "someone@test.com",
        receiverId: chatRoomInfo?.isGroup ? null : currentUserId,
        content: "안녕하세요! (목업 메시지)",
        createdAt: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
        isRead: true,
        isTicketPreview: false,
      },
      {
        id: `${chatRoomId}-m2`,
        chatRoomId,
        senderId: currentUserId,
        receiverId: chatRoomInfo?.isGroup ? null : otherUserId,
        content: "테스트 중입니다. 백엔드 없이도 UI 확인 가능!",
        createdAt: new Date(now.getTime() - 1000 * 60 * 3).toISOString(),
        isRead: true,
        isTicketPreview: false,
      },
      {
        id: `${chatRoomId}-m3`,
        chatRoomId,
        senderId: otherUserId || "someone@test.com",
        receiverId: chatRoomInfo?.isGroup ? null : currentUserId,
        // 티켓 미리보기 목업
        isTicketPreview: true,
        ticketId: 101,
        content: "", // 티켓 프리뷰는 content 대신 플래그로 렌더
        createdAt: new Date(now.getTime() - 1000 * 60 * 1).toISOString(),
        isRead: false,
      },
    ];
  };

  // ✅ 메시지 로드(백엔드 대신 localStorage)
  useEffect(() => {
    if (!chatRoomId || !currentUserId) return;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(Array.isArray(parsed) ? parsed : []);
      } else {
        const init = createInitialMessages();
        setMessages(init);
        localStorage.setItem(storageKey, JSON.stringify(init));
      }
    } catch (e) {
      console.error("로컬 메시지 로드 실패:", e);
      setMessages([]);
    }
  }, [chatRoomId, currentUserId, storageKey]);

  // ✅ messages 변경 시 localStorage 동기화
  useEffect(() => {
    try {
      if (!chatRoomId) return;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      // localStorage 제한/오류는 무시
    }
  }, [messages, storageKey, chatRoomId]);

  // ✅ 새 메시지 추가 시 맨 아래로 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // ✅ 메시지 전송(로컬)
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const now = new Date();
    const newMsg = {
      id: `${chatRoomId}-${now.getTime()}`,
      chatRoomId,
      senderId: currentUserId,
      receiverId: chatRoomInfo?.isGroup ? null : otherUserId,
      content: inputMessage.trim(),
      createdAt: now.toISOString(),
      isRead: true,
      isTicketPreview: false,
    };

    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), newMsg]);
    setInputMessage("");
    // useInfiniteChat 훅에서 자동으로 스크롤 처리됨
  };

  // ✅ 티켓 미리보기 클릭(로컬 목업)
  const handleTicketPreviewClick = (ticketId) => {
    // 나중에 getTicketInfo(ticketId)로 교체하면 됨
    alert(
      `티켓 정보(목업)\n\n` +
        `ticketId: ${ticketId}\n` +
        `보낸 사람: ${otherUserId || "someone@test.com"}\n` +
        `받는 사람: ${currentUserId}\n` +
        `생성일: ${new Date().toLocaleString()}`
    );
  };

  // ✅ Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const chatRoomName = chatRoomInfo?.isGroup
    ? chatRoomInfo.name || "그룹 채팅"
    : otherUserId || "채팅";

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50/30">
      {/* Header */}
      <div className="shrink-0 max-w-7xl mx-auto w-full p-8 pb-4">
        <div className="flex justify-between items-end">
          <div className="relative inline-block">
            <span className="text-blue-600 font-black text-xs uppercase tracking-widest mb-3 block italic">
              {chatRoomInfo?.isGroup ? "Group Chat" : "Direct Message"}
            </span>
            <h1 className="text-4xl font-black text-[#111827] mb-4 tracking-tighter uppercase">
              {chatRoomName}
            </h1>
            <div className="h-1.5 w-full bg-blue-600 rounded-full shadow-[0_2px_10px_rgba(37,99,235,0.3)]"></div>
          </div>

          {/* 오른쪽 정보 */}
          <div className="text-right space-y-1 pb-2">
            <div className="text-sm font-black text-gray-900 italic">
              {chatRoomInfo?.isGroup && Array.isArray(chatRoomInfo?.participantIds) && (
                <span>
                  PARTICIPANTS.{" "}
                  <span className="text-blue-600 underline decoration-2 underline-offset-4">
                    {chatRoomInfo.participantIds.length}명
                  </span>
                </span>
              )}
              {!chatRoomInfo?.isGroup && (
                <span>
                  TO.{" "}
                  <span className="text-blue-600 underline decoration-2 underline-offset-4">
                    {otherUserId || "Unknown"}
                  </span>
                </span>
              )}
            </div>

            {/* 연결 상태(목업에서는 항상 CONNECTED) */}
            <div className="text-[11px] font-bold italic uppercase tracking-widest text-green-600">
              ● CONNECTED
            </div>
          </div>
        </div>
      </div>

      {/* Messages (scroll) */}
      <div className="flex-1 overflow-hidden max-w-7xl mx-auto w-full px-8 pb-8">
        <div className="h-full bg-white rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col">
          <div className="shrink-0 bg-[#1a1f2c] px-10 py-5 flex justify-between items-center border-b border-gray-800">
            <h2 className="text-white font-black italic tracking-widest text-xs uppercase opacity-80">
              Chat Messages
            </h2>
            <div className="flex gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden bg-gradient-to-b from-white to-gray-50/30">
            <div
              ref={chatContainerRef}
              onScroll={onScroll}
              className="h-full overflow-y-auto p-12 space-y-4"
            >
              {Array.isArray(visibleMessages) && visibleMessages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <p className="text-lg font-medium">메시지가 없습니다.</p>
                  <p className="text-sm mt-2">대화를 시작해보세요.</p>
                </div>
              )}

              {Array.isArray(visibleMessages) &&
                visibleMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs lg:max-w-md ${msg.senderId !== currentUserId ? "flex flex-col" : ""}`}>
                      {/* 그룹 채팅: 발신자 표시(목업에서는 senderId로 표시) */}
                      {chatRoomInfo?.isGroup && msg.senderId !== currentUserId && (
                        <div className="text-xs text-gray-500 mb-1 px-2 font-semibold">{msg.senderId}</div>
                      )}

                      <div
                        className={`px-5 py-3 rounded-xl shadow-sm ${
                          msg.senderId === currentUserId ? "bg-blue-600 text-white" : "bg-white text-gray-800 border-2 border-gray-200"
                        }`}
                      >
                        {msg.isTicketPreview ? (
                          <div
                            onClick={() => handleTicketPreviewClick(msg.ticketId)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <div className="font-bold mb-1 text-base">🎫 티켓 미리보기</div>
                            <div className={`text-sm ${msg.senderId === currentUserId ? "opacity-90" : "text-gray-600"}`}>
                              클릭하여 티켓 정보 확인
                            </div>
                          </div>
                        ) : (
                          <div className="text-base leading-relaxed">{msg.content}</div>
                        )}

                        <div className={`text-xs mt-2 ${msg.senderId === currentUserId ? "text-blue-100" : "text-gray-500"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {msg.senderId !== currentUserId && msg.isRead === false && (
                            <span className="ml-2 text-red-500 font-bold">●</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 max-w-7xl mx-auto w-full px-8 pb-8">
        <div className="bg-white px-10 py-8 flex gap-4 border-t border-gray-100/60 rounded-b-[2.5rem]">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-6 py-3.5 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            disabled={!connected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!connected || !inputMessage.trim()}
            className="bg-[#111827] text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-300 shadow-xl shadow-gray-200"
          >
            전송
          </button>
          <button
            onClick={() => navigate("/chat")}
            className="bg-gray-100 text-gray-400 px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 hover:text-gray-600 transition-all duration-300"
          >
            목록으로
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
