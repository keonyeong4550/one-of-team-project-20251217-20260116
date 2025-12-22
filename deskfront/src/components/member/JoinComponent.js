import { useState } from "react";
import { joinPost } from "../../api/memberApi";
import useCustomLogin from "../../hooks/useCustomLogin";

const initState = {
  email: "",
  pw: "",
  nickname: "",
  department: "DEVELOPMENT", // 기본 선택값
};

const JoinComponent = () => {
  const [joinParam, setJoinParam] = useState({ ...initState });
  const { moveToLogin } = useCustomLogin();

  const handleChange = (e) => {
    joinParam[e.target.name] = e.target.value;
    setJoinParam({ ...joinParam });
  };

  const handleClickJoin = () => {
    // 유효성 검사
    if (!joinParam.email || !joinParam.pw || !joinParam.nickname) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    joinPost(joinParam)
      .then((result) => {
        if (result.result === "success") {
          alert(
            "회원가입이 완료되었습니다.\n관리자 승인 후 로그인이 가능합니다."
          );
          moveToLogin(); // 로그인 페이지로 이동 (자동 로그인 X)
        }
      })
      .catch((err) => {
        // 중복 에러 등 처리
        alert("회원가입 실패. 다시 시도해주세요.");
      });
  };

  return (
    <div className="border-2 border-sky-200 mt-10 m-2 p-4 w-full max-w-md bg-white shadow-lg rounded">
      <div className="text-3xl font-bold text-center text-blue-500 mb-6">
        회원가입
      </div>

      {/* Email Input */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Email
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          name="email"
          type="text"
          onChange={handleChange}
          placeholder="이메일 입력"
        />
      </div>

      {/* Password Input */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Password
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          name="pw"
          type="password"
          onChange={handleChange}
          placeholder="비밀번호 입력"
        />
      </div>

      {/* Nickname Input */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Nickname
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          name="nickname"
          type="text"
          onChange={handleChange}
          placeholder="닉네임 입력"
        />
      </div>

      {/* Department Select Box (핵심 수정 부분) */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          부서 선택
        </label>
        <select
          name="department"
          value={joinParam.department}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
        >
          <option value="DEVELOPMENT">개발팀 (Development)</option>
          <option value="SALES">영업팀 (Sales)</option>
          <option value="HR">인사팀 (HR)</option>
          <option value="DESIGN">디자인팀 (Design)</option>
          <option value="PLANNING">기획팀 (Planning)</option>
          <option value="FINANCE">재무팀 (Finance)</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          type="button"
          onClick={handleClickJoin}
        >
          가입하기
        </button>
      </div>
    </div>
  );
};

export default JoinComponent;
