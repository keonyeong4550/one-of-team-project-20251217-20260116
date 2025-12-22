import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AdminComponent from "../../components/admin/AdminComponent";
import BasicMenu from "../../components/menu/BasicMenu";

const AdminPage = () => {
  const loginState = useSelector((state) => state.loginSlice);
  const navigate = useNavigate();

  useEffect(() => {
    // 권한 체크 (BasicMenu와 동일한 로직)
    // roleNames가 없거나 ADMIN이 없으면 메인으로 튕겨냄
    if (!loginState.roleNames || !loginState.roleNames.includes("ADMIN")) {
      alert("접근 권한이 없습니다 (관리자 전용)");
      navigate("/", { replace: true });
    }
  }, [loginState, navigate]);

  return (
    <div className="fixed top-0 left-0 z-[1055] flex flex-col h-full w-full bg-gray-100 overflow-auto">
      <BasicMenu />

      <div className="w-full flex justify-center mt-8 mb-8">
        <div className="w-4/5 bg-white shadow-md rounded p-6">
          {/* 실제 관리자 기능을 수행하는 컴포넌트 */}
          <AdminComponent />
        </div>
      </div>
    </div>
  );
};
export default AdminPage;
