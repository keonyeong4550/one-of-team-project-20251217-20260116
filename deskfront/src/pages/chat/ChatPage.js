import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatRoom from "../../components/chat/ChatRoom";
import useCustomLogin from "../../hooks/useCustomLogin";

// 임시 목업: 채팅방 정보(백엔드 대신)
const MOCK_ROOMS = [
  {
    id: 1,
    isGroup: false,
    user1Id: "alice@test.com",
    user2Id: "bob@test.com",
    name: null,
  },
  {
    id: 2,
    isGroup: true,
    name: "프로젝트 그룹",
    participants: ["alice@test.com", "bob@test.com", "charlie@test.com"],
  },
];

const ChatPage = () => {
  const { chatRoomId } = useParams();
  const navigate = useNavigate();
  const { loginState } = useCustomLogin();
  const currentUserId = loginState?.email || "";

  // 백엔드 호출 없이 params 기반으로 목업에서 찾기
  const chatRoomInfo = useMemo(() => {
    const id = Number(chatRoomId);
    if (!id) return null;
    return MOCK_ROOMS.find((r) => r.id === id) || null;
  }, [chatRoomId]);

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">로그인이 필요합니다.</div>
      </div>
    );
  }

  // 존재하지 않는 방이면 목록으로
  if (!chatRoomInfo) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <div className="text-gray-500">존재하지 않는 채팅방입니다.</div>
        <button
          className="px-4 py-2 rounded-lg bg-gray-900 text-white"
          onClick={() => navigate("/chat")}
        >
          목록으로
        </button>
      </div>
    );
  }

  // 1:1 채팅 상대 계산
  const otherUserId =
    !chatRoomInfo.isGroup
      ? chatRoomInfo.user1Id === currentUserId
        ? chatRoomInfo.user2Id
        : chatRoomInfo.user1Id
      : null;

  return (
    <ChatRoom
      chatRoomId={Number(chatRoomId)}
      currentUserId={currentUserId}
      otherUserId={otherUserId}
      chatRoomInfo={chatRoomInfo}
    />
  );
};

export default ChatPage;
