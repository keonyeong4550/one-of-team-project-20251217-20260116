import React from 'react';
import ChatListComponent from '../../components/chat/ChatListComponent';
import useCustomLogin from '../../hooks/useCustomLogin';

const ChatListPage = () => {
  const { loginState } = useCustomLogin();
  const currentUserId = loginState?.email || '';

  if (!currentUserId) {
    return (
      <div className="w-full bg-gray-100 min-h-screen py-8">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="bg-white shadow-2xl rounded-3xl p-8 min-h-[800px] flex items-center justify-center">
            <div className="text-gray-500">로그인이 필요합니다.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 min-h-screen py-8">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="bg-white shadow-2xl rounded-3xl p-8 min-h-[800px]">
          <ChatListComponent currentUserId={currentUserId} />
        </div>
      </div>
    </div>
  );
};

export default ChatListPage;