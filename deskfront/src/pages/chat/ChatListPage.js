import { useEffect } from "react";
import ChatListComponent from '../../components/chat/ChatListComponent';
import useCustomLogin from '../../hooks/useCustomLogin';
import { useNavigate } from "react-router-dom";

const ChatListPage = () => {
  const { loginState } = useCustomLogin();
  const currentUserId = loginState?.email || '';
  const navigate = useNavigate();

 useEffect(() => {
    if (!loginState.email) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/member/login", { replace: true });
    }
  }, [loginState.email, navigate]);


  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">로그인이 필요합니다.</div>
      </div>
    );
  }

  return <ChatListComponent currentUserId={currentUserId} />;
};

export default ChatListPage;