import { useState } from "react";
import useCustomLogin from "../../hooks/useCustomLogin";
import KakaoLoginComponent from "./KakaoLoginComponent";

const initState = {
  email: "",
  pw: "",
};

const LoginComponent = () => {
  const [loginParam, setLoginParam] = useState({ ...initState });

  // useCustomLogin 훅에서 moveToPath 가져오기
  const { doLogin, moveToPath } = useCustomLogin();

  const handleChange = (e) => {
    loginParam[e.target.name] = e.target.value;
    setLoginParam({ ...loginParam });
  };

  const handleClickLogin = (e) => {
    doLogin(loginParam).then((data) => {
      console.log("Login Result:", data); // 디버깅용 로그

      if (data.error) {
        // 백엔드에서 보낸 에러 코드에 따라 분기 처리
        if (data.error === "PENDING_APPROVAL") {
          alert("현재 승인 대기 상태입니다.\n관리자 승인 후 로그인해주세요.");
        } else if (data.error === "DELETED_ACCOUNT") {
          alert("탈퇴 또는 삭제된 계정입니다.");
        } else if (data.error === "BAD_CREDENTIALS") {
          alert("아이디 또는 비밀번호가 일치하지 않습니다.");
        } else {
          alert("로그인 실패. 다시 시도해주세요.");
        }
      } else {
        // alert("로그인 성공");
        moveToPath("/");
      }
    });
  };

  // 회원가입 페이지로 이동하는 함수
  const handleClickJoin = () => {
    moveToPath("/member/join");
  };

  return (
    <div className="border-2 border-sky-200 mt-10 m-2 p-4 w-full max-w-md bg-white shadow-lg rounded">
      <div className="flex justify-center">
        <div className="text-4xl m-4 p-4 font-extrabold text-blue-500">
          LOGIN
        </div>
      </div>

      {/* Email Input */}
      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-full p-1 text-left font-bold text-gray-600">
            Email
          </div>
          <input
            className="w-full p-3 rounded border border-solid border-neutral-300 shadow-sm focus:outline-none focus:border-blue-500"
            name="email"
            type={"text"}
            value={loginParam.email}
            onChange={handleChange}
            placeholder="이메일을 입력하세요"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="flex justify-center">
        <div className="relative mb-4 flex w-full flex-wrap items-stretch">
          <div className="w-full p-1 text-left font-bold text-gray-600">
            Password
          </div>
          <input
            className="w-full p-3 rounded border border-solid border-neutral-300 shadow-sm focus:outline-none focus:border-blue-500"
            name="pw"
            type={"password"}
            value={loginParam.pw}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
          />
        </div>
      </div>

      {/* Buttons Area */}
      <div className="flex justify-center w-full mt-4">
        <div className="relative mb-4 flex w-full justify-between gap-2">
          {/* LOGIN 버튼 */}
          <button
            className="w-1/2 rounded p-3 bg-blue-500 text-white font-bold text-lg hover:bg-blue-600 transition duration-200"
            onClick={handleClickLogin}
          >
            LOGIN
          </button>

          {/* JOIN 버튼 */}
          <button
            className="w-1/2 rounded p-3 bg-green-500 text-white font-bold text-lg hover:bg-green-600 transition duration-200"
            onClick={handleClickJoin}
          >
            JOIN
          </button>
        </div>
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Kakao Login */}
      <KakaoLoginComponent />
    </div>
  );
};

export default LoginComponent;
