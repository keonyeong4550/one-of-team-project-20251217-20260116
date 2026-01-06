import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MemberPickerModal from "./MemberPickerModal";
import { searchMembers } from "../../api/memberApi";
import { getChatRooms, createGroupRoom, createOrGetDirectRoom } from "../../api/chatApi";

const ChatListComponent = ({ currentUserId: propCurrentUserId }) => {
  const navigate = useNavigate();
  const loginInfo = useSelector((state) => state.loginSlice);
  const currentUserId = loginInfo?.email || propCurrentUserId || "";

  // 채팅방 목록 상태
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모달 관련 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [userInfoMap, setUserInfoMap] = useState({}); // email -> {nickname, department}
  const [groupName, setGroupName] = useState(""); // 그룹 채팅방 이름

  // 채팅방 목록 로드
  useEffect(() => {
    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const rooms = await getChatRooms();

      // 인증 에러 처리
      if (rooms && typeof rooms === 'object' && rooms.error === "ERROR_ACCESS_TOKEN") {
        setError("인증이 만료되었습니다. 다시 로그인해주세요.");
        setChatRooms([]);
        return;
      }

      // 백엔드 응답을 프론트엔드 형식으로 변환
      const transformedRooms = rooms.map((room) => {
        // participants에서 현재 사용자 제외한 상대방 찾기
        const otherParticipants = room.participants?.filter(
          (p) => p.userId !== currentUserId
        ) || [];

        return {
          id: room.id,
          isGroup: room.roomType === "GROUP",
          name: room.name,
          participants: room.participants?.map((p) => p.userId) || [],
          participantInfo: room.participants?.map((p) => ({
            email: p.userId,
            nickname: p.nickname || p.userId,
          })) || [],
          lastMessage: room.lastMsgContent
            ? {
                content: room.lastMsgContent,
                createdAt: room.lastMsgAt,
              }
            : null,
          unreadCount: room.unreadCount || 0,
          // 1:1 채팅용
          user1Id: !otherParticipants.length ? currentUserId : currentUserId,
          user2Id: otherParticipants.length > 0 ? otherParticipants[0].userId : null,
        };
      });
      setChatRooms(transformedRooms);
    } catch (err) {
      console.error("채팅방 목록 로드 실패:", err);
      setError("채팅방 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = () => {
    setShowCreateModal(true);
    setSelectedUsers([]);
    setSearchKeyword("");
    setSelectedDepartment("");
    setGroupName("");
  };

  // 멤버 검색 API 호출 (디바운싱 적용) - 검색어 또는 부서 선택 시 검색
  useEffect(() => {
    // 검색어가 2글자 미만이고 부서도 선택 안 했으면 검색 안 함
    if (searchKeyword.trim().length < 2 && !selectedDepartment) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearchMembers(searchKeyword, selectedDepartment);
    }, 300); // 300ms 디바운싱

    return () => clearTimeout(timeoutId);
  }, [searchKeyword, selectedDepartment]);

  const handleSearchMembers = async (keyword, department) => {
    setSearchLoading(true);
    setSearchError(null);
    try {
      const data = await searchMembers(keyword || null, 1, 20, department || null);
      // 현재 사용자 제외 및 DTO 변환
      const filtered = data.dtoList
        .filter((m) => m.email !== (loginInfo?.email || currentUserId))
        .map((m) => ({
          email: m.email,
          nickname: m.nickname || m.email,
          department: m.department || null,
        }));
      setSearchResults(filtered);

      // userInfoMap 업데이트
      const newMap = {};
      filtered.forEach(user => {
        newMap[user.email] = { nickname: user.nickname, department: user.department };
      });
      setUserInfoMap(prev => ({ ...prev, ...newMap }));
    } catch (err) {
      console.error("멤버 검색 실패:", err);
      setSearchError("멤버 검색에 실패했습니다.");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const availableUsers = useMemo(() => {
    return searchResults;
  }, [searchResults]);

  const toggleUserSelection = (email) => {
    setSelectedUsers((prev) =>
      prev.includes(email) ? prev.filter((id) => id !== email) : [...prev, email]
    );
  };

  const getChatRoomName = (room) => {
    if (room.isGroup) {
      if (room.participantInfo && room.participantInfo.length > 0) {
        const names = room.participantInfo.map(p => p.nickname);
        if (names.length <= 2) {
          return names.join(", ");
        }
        return `${names.slice(0, 2).join(", ")} 외 ${names.length - 2}명`;
      }
      return "그룹 채팅";
    } else {
      // DIRECT 방: 현재 사용자를 제외한 상대방 찾기
      if (room.participantInfo && room.participantInfo.length > 0) {
        const otherParticipant = room.participantInfo.find(
          (p) => p.email !== currentUserId
        );
        
        if (otherParticipant) {
          return otherParticipant.nickname;
        }
      }
      const otherUser = room.user1Id === currentUserId ? room.user2Id : room.user1Id;
      return otherUser || "알 수 없음";
    }
  };

  const formatLastMessage = (message) => {
    if (!message) return "메시지가 없습니다.";
    return message.content.length > 30 ? message.content.slice(0, 30) + "..." : message.content;
  };

  // 채팅방 생성
  const handleCreateRoom = async () => {
    if (selectedUsers.length === 0) {
      return alert("최소 1명 이상의 참여자를 선택해주세요.");
    }

    try {
      let newRoom;

      if (selectedUsers.length === 1) {
        // 1:1 채팅방 생성
        newRoom = await createOrGetDirectRoom({ targetEmail: selectedUsers[0] });
      } else {
        // 그룹 채팅방 생성
        if (!groupName.trim()) {
          return alert("그룹 채팅방 이름을 입력해주세요.");
        }
        newRoom = await createGroupRoom({
          name: groupName.trim(),
          participantEmails: selectedUsers,
        });
      }

      setShowCreateModal(false);
      setSelectedUsers([]);
      setGroupName("");

      // 목록 새로고침
      await loadChatRooms();

      // 생성된 방으로 이동
      navigate(`/chat/${newRoom.id}`);
    } catch (err) {
      console.error("채팅방 생성 실패:", err);
      alert("채팅방 생성에 실패했습니다.");
    }
  };

  return (
    <>
      <div className="w-full">
        {/* 상단 타이틀 */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 border-b-8 border-blue-500 pb-4 inline-block tracking-normal">
            Chat
          </h1>
          <button
            onClick={handleCreateChat}
            className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-lg"
          >
            새 채팅
          </button>
        </div>

        {/* 목록 카드 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 min-h-[600px] flex flex-col">
          <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
            <h2 className="text-xl font-black italic uppercase tracking-wider">
              CHAT ROOM LIST
            </h2>
            <span className="bg-blue-500 px-6 py-1 rounded-full text-sm font-black italic">
              TOTAL: {chatRooms.length}
            </span>
          </div>

          <div className="flex-grow divide-y divide-gray-100">
            {loading ? (
              <div className="p-40 text-center font-black text-gray-300 animate-pulse uppercase">
                Loading Chat Rooms...
              </div>
            ) : error ? (
              <div className="p-40 text-center text-red-500 font-black uppercase">
                {error}
              </div>
            ) : chatRooms.length === 0 ? (
              <div className="p-40 text-center text-gray-300 font-black text-2xl uppercase italic">
                No Chat Rooms
              </div>
            ) : (
              chatRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => navigate(`/chat/${room.id}`)}
                  className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/30 transition-all cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-800 truncate">
                        {getChatRoomName(room)}
                      </h3>
                      {room.isGroup && (
                        <span className="px-3 py-1 rounded-xl text-[11px] font-black bg-gray-100 text-gray-700 uppercase shrink-0">
                          그룹
                        </span>
                      )}
                    </div>
                    {room.lastMessage && (
                      <>
                        <p className="text-gray-500 text-sm mb-1 truncate">
                          {formatLastMessage(room.lastMessage)}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(room.lastMessage.createdAt).toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>
                  {room.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ml-4">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 생성 모달 */}
      <MemberPickerModal
        open={showCreateModal}
        title="새 채팅 생성"
        multi={true}
        keyword={searchKeyword}
        onChangeKeyword={setSearchKeyword}
        results={availableUsers}
        selected={selectedUsers}
        onToggle={toggleUserSelection}
        loading={searchLoading}
        error={searchError}
        onClose={() => {
          setShowCreateModal(false);
          setSearchKeyword("");
          setSelectedUsers([]);
          setSelectedDepartment("");
        }}
        selectedDepartment={selectedDepartment}
        onChangeDepartment={setSelectedDepartment}
        onConfirm={handleCreateRoom}
        showGroupName={selectedUsers.length > 1}
        groupName={groupName}
        onChangeGroupName={setGroupName}
      />
    </>
  );
};

export default ChatListComponent;