import { useEffect, useState } from "react";
import {
  getPendingList,
  getActiveList,
  putApprove,
  putSoftDelete,
} from "../../api/adminApi";
import PageComponent from "../common/PageComponent";

const AdminComponent = () => {
  const [pendingList, setPendingList] = useState([]);
  const [activeMembers, setActiveMembers] = useState(null);
  const [page, setPage] = useState(1);

  const fetchPending = () => {
    getPendingList().then((data) => {
      setPendingList(Array.isArray(data) ? data : Object.values(data));
    });
  };

  const fetchActive = (pageNum) => {
    getActiveList({ page: pageNum, size: 10 }).then((data) =>
      setActiveMembers(data)
    );
  };

  useEffect(() => {
    fetchPending();
    fetchActive(page);
  }, [page]);

  const handleApprove = (email) => {
    if (window.confirm(`${email} 회원을 승인하시겠습니까?`)) {
      putApprove(email).then(() => {
        alert("승인 완료");
        fetchPending();
        fetchActive(page);
      });
    }
  };

  const handleDelete = (email) => {
    if (window.confirm(`${email} 회원을 삭제하시겠습니까?`)) {
      putSoftDelete(email).then(() => {
        alert("삭제 완료");
        fetchActive(page);
      });
    }
  };

  // 페이징 이동 핸들러 (객체에서 숫자만 추출)
  const movePageHandler = (pageParam) => {
    setPage(pageParam.page);
  };

  // 공통 테이블 스타일 및 컬럼 너비 정의
  const tableClass =
    "w-full border-collapse border border-gray-200 table-fixed"; // table-fixed로 너비 고정
  const thClass = "border p-3 bg-gray-100 font-semibold text-gray-700";
  const tdClass = "border p-3 text-center truncate"; // 내용이 길면 말줄임표 처리

  return (
    <div className="w-full p-4 bg-white">
      <div className="text-3xl font-bold mb-10 text-gray-800 border-b-4 border-blue-500 pb-2 inline-block">
        관리자 대시보드
      </div>

      {/* --- 승인 대기 목록 섹션 --- */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">📌</span> 승인 대기 회원
          <span className="ml-3 text-sm font-normal text-red-500">
            ({pendingList.length}건)
          </span>
        </h2>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={`${thClass} w-[35%]`}>Email</th>
                <th className={`${thClass} w-[20%]`}>Nickname</th>
                <th className={`${thClass} w-[25%]`}>Department</th>
                <th className={`${thClass} w-[20%]`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="border p-10 text-center text-gray-400"
                  >
                    대기 중인 회원이 없습니다.
                  </td>
                </tr>
              ) : (
                pendingList.map((member) => (
                  <tr
                    key={member.email}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className={tdClass} title={member.email}>
                      {member.email}
                    </td>
                    <td className={tdClass}>{member.nickname}</td>
                    <td className={tdClass}>{member.department}</td>
                    <td className={tdClass}>
                      <button
                        onClick={() => handleApprove(member.email)}
                        className="bg-blue-500 text-white px-4 py-1.5 rounded shadow hover:bg-blue-600 transition-all text-sm font-medium"
                      >
                        승인
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 전체 직원 목록 섹션 --- */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">👥</span> 전체 직원 목록
        </h2>
        {activeMembers && activeMembers.dtoList ? (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={`${thClass} w-[35%]`}>Email</th>
                  <th className={`${thClass} w-[20%]`}>Nickname</th>
                  <th className={`${thClass} w-[25%]`}>Department</th>
                  <th className={`${thClass} w-[20%]`}>Manage</th>
                </tr>
              </thead>
              <tbody>
                {activeMembers.dtoList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="border p-10 text-center text-gray-400"
                    >
                      등록된 직원이 없습니다.
                    </td>
                  </tr>
                ) : (
                  activeMembers.dtoList.map((member) => (
                    <tr
                      key={member.email}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className={tdClass} title={member.email}>
                        {member.email}
                      </td>
                      <td className={tdClass}>{member.nickname}</td>
                      <td className={tdClass}>{member.department}</td>
                      <td className={tdClass}>
                        <button
                          onClick={() => handleDelete(member.email)}
                          className="bg-red-500 text-white px-4 py-1.5 rounded shadow hover:bg-red-600 transition-all text-sm font-medium"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* 페이징 컴포넌트 */}
            <div className="mt-4">
              <PageComponent
                serverData={activeMembers}
                movePage={movePageHandler}
              />
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-gray-500">
            데이터를 불러오는 중입니다...
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComponent;
