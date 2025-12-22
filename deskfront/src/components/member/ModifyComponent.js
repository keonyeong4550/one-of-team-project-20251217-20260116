import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { modifyMember } from "../../api/memberApi";
import { logout } from "../../slices/loginSlice";
import useCustomLogin from "../../hooks/useCustomLogin";

const initState = {
  email: "",
  pw: "",
  nickname: "",
  department: "DEVELOPMENT", // 안전을 위해 초기값 명시
};

const ModifyComponent = () => {
  const [member, setMember] = useState({ ...initState });

  // Redux에서 로그인 정보 가져오기
  const loginInfo = useSelector((state) => state.loginSlice);

  const { moveToLogin } = useCustomLogin();
  const dispatch = useDispatch();

  // 컴포넌트 로딩 시 Redux 정보를 State로 설정
  useEffect(() => {
    setMember((prev) => ({
      ...prev,
      email: loginInfo.email,
      pw: "",
      nickname: loginInfo.nickname || "",
      // 소셜 로그인 직후라 department가 null이면 "DEVELOPMENT"로 설정
      department: loginInfo.department || "DEVELOPMENT",
    }));
  }, [loginInfo]);

  // State 불변성 지키기
  // 기존: member[e.target.name] = e.target.value (X - 이렇게 하면 안됨)
  const handleChange = (e) => {
    setMember({ ...member, [e.target.name]: e.target.value });
  };

  const handleClickModify = () => {
    // 유효성 검사
    if (!member.nickname) {
      alert("닉네임은 필수 입력 항목입니다.");
      return;
    }

    // 전송 직전 데이터 검증
    // 만약 department가 비어있다면 기본값 "DEVELOPMENT"를 강제로 넣음
    const memberToSend = {
      ...member,
      department: member.department || "DEVELOPMENT",
    };

    modifyMember(memberToSend)
      .then((result) => {
        alert(
          "정보 수정이 완료되었습니다.\n관리자 승인 대기 상태로 전환됩니다.\n승인 후 로그인해주세요."
        );
        dispatch(logout());
        moveToLogin();
      })
      .catch((err) => {
        console.error(err);
        alert("수정 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className="border-2 border-sky-200 mt-10 m-2 p-4 w-full max-w-md bg-white shadow-lg rounded">
      <div className="text-3xl font-bold text-center text-blue-500 mb-6">
        정보 수정 (추가 정보)
      </div>

      {/* Email Input (Read Only) */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Email (변경 불가)
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 bg-gray-200 leading-tight focus:outline-none"
          name="email"
          type="text"
          value={member.email}
          readOnly
        />
      </div>

      {/* Password Input */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          New Password
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          name="pw"
          type="password"
          value={member.pw}
          onChange={handleChange}
          placeholder="변경할 비밀번호를 입력하세요"
        />
        <p className="text-xs text-gray-500 mt-1">
          * 소셜 회원은 비밀번호를 설정하면 일반 회원처럼 로그인할 수 있습니다.
        </p>
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
          value={member.nickname}
          onChange={handleChange}
          placeholder="닉네임을 입력하세요"
        />
      </div>

      {/* Department Select Box */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          부서 선택
        </label>
        <select
          name="department"
          // ★ 만약 state가 비어있으면 "DEVELOPMENT"를 보여주도록 처리
          value={member.department || "DEVELOPMENT"}
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
          onClick={handleClickModify}
        >
          수정 및 승인 요청
        </button>
      </div>
    </div>
  );
};

export default ModifyComponent;
