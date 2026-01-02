import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { modifyMember, registerFaceApi, updateFaceStatusApi } from "../../api/memberApi"; // API 추가 확인
import { logout } from "../../slices/loginSlice";
import useCustomLogin from "../../hooks/useCustomLogin";

const initState = {
  email: "",
  pw: "",
  nickname: "",
  department: "DEVELOPMENT",
  faceEnabled: false,
};

const ModifyComponent = () => {
  const [member, setMember] = useState({ ...initState });
  const loginInfo = useSelector((state) => state.loginSlice);
  const { moveToLogin } = useCustomLogin();
  const dispatch = useDispatch();

  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    setMember((prev) => ({
      ...prev,
      email: loginInfo.email,
      pw: "",
      nickname: loginInfo.nickname || "",
      department: loginInfo.department || "DEVELOPMENT",
      faceEnabled: loginInfo.faceEnabled || false,
    }));
  }, [loginInfo]);

  const handleChange = (e) => {
    setMember({ ...member, [e.target.name]: e.target.value });
  };

  const handleClickModify = (e) => {
    if (e) e.preventDefault();

    if (!member.pw || member.pw.trim() === "") {
      alert("비밀번호를 입력해야 정보 수정이 가능합니다.");
      return;
    }
    if (!member.nickname) {
      alert("닉네임은 필수 입력 항목입니다.");
      return;
    }
    const memberToSend = { ...member, department: member.department || "DEVELOPMENT" };

    modifyMember(memberToSend)
      .then((result) => {
        alert("정보 수정이 완료되었습니다.");
        dispatch(logout());
        moveToLogin();
      })
      .catch((err) => {
        alert("수정 중 오류가 발생했습니다.");
      });
  };

  //  얼굴 인식 사용 여부 토글 로직
  const handleToggleFace = async () => {
    const newStatus = !member.faceEnabled;
    try {
      await updateFaceStatusApi(member.email, newStatus);
      setMember({ ...member, faceEnabled: newStatus });
      alert(newStatus ? "얼굴 로그인이 활성화되었습니다." : "얼굴 로그인이 비활성화되었습니다.");
    } catch (err) {
      alert("상태 변경에 실패했습니다.");
    }
  };

  //  실시간 캠 실행 로직
  const startCamera = async () => {
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

  //  캡처 및 등록 로직
  const captureAndRegister = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // canvas 이미지를 파일(Blob)로 변환
    canvas.toBlob(async (blob) => {
      const file = new File([blob], "face.jpg", { type: "image/jpeg" });

      try {
        await registerFaceApi(member.email, file); // 백엔드 등록 API 호출
        alert("얼굴 등록이 완료되었습니다!");

        // 스트림 중지 및 카메라 UI 닫기
        const stream = video.srcObject;
        stream.getTracks().forEach(track => track.stop());
        setShowCamera(false);
        setMember({ ...member, faceEnabled: true });
      } catch (err) {
        alert("얼굴 등록 중 오류가 발생했습니다.");
      }
    }, "image/jpeg");
  };

  return (
    <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-4xl font-black italic tracking-tighter text-gray-900 border-b-8 border-blue-500 pb-2 uppercase">
          Modify Profile
        </h1>
        <p className="text-gray-400 font-bold mt-4 uppercase tracking-widest text-[10px]">Update your personal information</p>
      </div>

      <form className="space-y-5" onSubmit={handleClickModify}>
        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">Email (Read Only)</label>
          <input
            className="w-full p-4 rounded-2xl border-2 border-transparent bg-gray-100 font-bold text-gray-400 outline-none shadow-inner"
            name="email" type="text" value={member.email} readOnly
          />
        </div>

        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">New Password</label>
          <input
            className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-inner"
            name="pw" type="password" value={member.pw} onChange={handleChange} placeholder="Enter new password"
          />
          <p className="text-[10px] text-blue-500 font-bold mt-2 ml-2 uppercase italic">* Optional: Set password for direct login</p>
        </div>

        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">Nickname</label>
          <input
            className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-inner"
            name="nickname" type="text" value={member.nickname} onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">Department</label>
          <div className="relative">
            <select
              name="department"
              value={member.department || "DEVELOPMENT"}
              onChange={handleChange}
              className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 font-black text-gray-700 focus:border-blue-500 outline-none transition-all shadow-sm appearance-none"
            >
              <option value="DEVELOPMENT">💻 개발팀 (DEVELOPMENT)</option>
              <option value="SALES">🤝 영업팀 (SALES)</option>
              <option value="HR">👥 인사팀 (HR)</option>
              <option value="DESIGN">🎨 디자인팀 (DESIGN)</option>
              <option value="PLANNING">📝 기획팀 (PLANNING)</option>
              <option value="FINANCE">💰 재무팀 (FINANCE)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">▼</div>
          </div>
        </div>

        {/* --- 얼굴 인식 관리 섹션 --- */}
        <div className="mt-8 p-6 bg-blue-50/50 rounded-[30px] border-2 border-dashed border-blue-100">
          <label className="block text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 ml-2">Face ID Setting</label>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-600 ml-2">
              얼굴 로그인 사용여부: <span className={member.faceEnabled ? "text-blue-600" : "text-red-400"}>
                {member.faceEnabled ? "ON" : "OFF"}
              </span>
            </span>
            <button
              type="button"
              onClick={handleToggleFace}
              className={`px-6 py-2 rounded-xl font-black text-[10px] tracking-widest transition-all ${
                member.faceEnabled ? "bg-red-400 text-white" : "bg-blue-500 text-white"
              }`}
            >
              {member.faceEnabled ? "DISABLE" : "ENABLE"}
            </button>
          </div>

          {!showCamera ? (
            <button
              type="button"
              onClick={startCamera}
              className="w-full py-4 bg-white border-2 border-blue-500 text-blue-600 rounded-2xl font-black text-xs hover:bg-blue-500 hover:text-white transition-all"
            >
              {member.faceEnabled ? "RE-REGISTER FACE (OPEN CAMERA)" : "REGISTER FACE (OPEN CAMERA)"}
            </button>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror" />
              </div>
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={captureAndRegister}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs"
                >
                  CAPTURE & SAVE
                </button>
                <button
                  type="button"
                  onClick={() => setShowCamera(false)}
                  className="px-6 py-4 bg-gray-200 text-gray-600 rounded-2xl font-black text-xs"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
          {/* 캡처용 캔버스 (숨김) */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <button
          className="w-full bg-blue-600 text-white p-5 rounded-3xl font-black text-xl hover:bg-gray-900 hover:scale-[1.02] transition-all shadow-xl mt-6 active:scale-95"
          type="submit"
        >
          UPDATE & RE-APPROVE
        </button>
      </form>
    </div>
  );
};

export default ModifyComponent;