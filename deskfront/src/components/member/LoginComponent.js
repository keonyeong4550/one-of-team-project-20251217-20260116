import { useState, useRef } from "react";
import { useDispatch } from "react-redux"; // useDispatch 추가
import { login } from "../../slices/loginSlice"; // login 액션 임포트
import useCustomLogin from "../../hooks/useCustomLogin";
import KakaoLoginComponent from "./KakaoLoginComponent";
import { loginFace } from "../../api/memberApi";

const initState = { email: "", pw: "" };

const LoginComponent = () => {
  const [loginParam, setLoginParam] = useState({ ...initState });
  const { doLogin, moveToPath } = useCustomLogin();
  const dispatch = useDispatch(); // 리덕스 디스패치 생성

  // 얼굴 인식 관련 상태
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleChange = (e) => {
    setLoginParam({ ...loginParam, [e.target.name]: e.target.value });
  };

  const startFaceLoginCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("카메라를 켤 수 없습니다. 권한을 확인해주세요.");
      setShowCamera(false);
    }
  };

  const captureAndLogin = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], "login_face.jpg", { type: "image/jpeg" });
      try {
        const data = await loginFace(file); // 얼굴 로그인 API 호출 (백엔드에서 MemberDTO 반환)

        if (data && data.error) {
          handleError(data.error);
        } else {
          dispatch(login(data));

          stopCamera();
          moveToPath("/"); // 메인 페이지로 이동
        }
      } catch (err) {
        handleError(err.response?.data?.error || "인증 오류");
      }
    }, "image/jpeg");
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const handleError = (error) => {
    if (error === "PENDING_APPROVAL") alert("현재 승인 대기 상태입니다.");
    else if (error === "DELETED_ACCOUNT") alert("탈퇴된 계정입니다.");
    else if (error === "FACE_LOGIN_DISABLED") alert("얼굴 로그인이 비활성화되어 있습니다. 일반 로그인 후 마이페이지에서 활성화해주세요.");
    else if (error === "FACE_NOT_RECOGNIZED") alert("등록된 얼굴을 찾을 수 없습니다.");
    else if (error === "BAD_CREDENTIALS") alert("아이디 또는 비밀번호가 틀립니다.");
    else alert("로그인 실패: " + error);
  };

  const handleClickLogin = (e) => {
    if (e) e.preventDefault();
    doLogin(loginParam).then((data) => {
      if (data.error) handleError(data.error);
      else moveToPath("/");
    });
  };

  return (
    <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 border-b-8 border-blue-500 pb-2 uppercase">LOGIN</h1>
      </div>

      <form className="space-y-6" onSubmit={handleClickLogin}>
        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">Email Address</label>
          <input className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 font-bold focus:border-blue-500 outline-none transition-all shadow-inner" name="email" type="text" value={loginParam.email} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">Password</label>
          <input className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 font-bold focus:border-blue-500 outline-none transition-all shadow-inner" name="pw" type="password" value={loginParam.pw} onChange={handleChange} />
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-gray-900 text-white p-5 rounded-3xl font-black text-lg hover:bg-blue-600 transition-all shadow-lg active:scale-95">LOGIN</button>
            <button type="button" className="flex-1 bg-white text-gray-900 border-2 border-gray-900 p-5 rounded-3xl font-black text-lg hover:bg-gray-50 transition-all shadow-lg active:scale-95" onClick={() => moveToPath("/member/join")}>JOIN</button>
          </div>

          {!showCamera ? (
            <button
              type="button"
              onClick={startFaceLoginCamera}
              className="w-full bg-blue-50 text-blue-600 p-5 rounded-3xl font-black text-lg border-2 border-dashed border-blue-200 hover:bg-blue-100 transition-all"
            >
              📷 FACE ID LOGIN
            </button>
          ) : (
            <div className="flex flex-col items-center space-y-4 p-4 bg-blue-50/50 rounded-3xl border-2 border-dashed border-blue-200">
              <div className="relative w-full aspect-square max-w-[240px] bg-black rounded-full overflow-hidden shadow-2xl border-4 border-white">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">인식 버튼을 눌러주세요</p>
              <div className="flex gap-2 w-full">
                <button type="button" onClick={captureAndLogin} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg">인식하기</button>
                <button type="button" onClick={stopCamera} className="px-6 py-4 bg-white text-gray-400 rounded-2xl font-black text-xs border border-gray-200">취소</button>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </form>

      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-gray-100"></div></div>
        <div className="relative flex justify-center text-[10px] font-black uppercase"><span className="bg-white px-4 text-gray-300 tracking-[0.3em]">Social Access</span></div>
      </div>
      <KakaoLoginComponent />
    </div>
  );
};

export default LoginComponent;