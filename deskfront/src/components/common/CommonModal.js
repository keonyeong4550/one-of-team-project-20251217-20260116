const CommonModal = ({ title, content, callbackFn, closeFn, isOpen }) => {
  if (!isOpen) return <></>; // isOpen이 false면 렌더링 안 함

  return (
    <div
      className="fixed top-0 left-0 z-[1055] flex h-full w-full justify-center bg-black bg-opacity-20"
      onClick={closeFn} // 배경 클릭 시 닫기 (선택 사항)
    >
      <div
        className="absolute bg-white shadow dark:bg-gray-700 opacity-100 w-1/4 rounded  mt-10 mb-10 px-6 min-w-[600px]"
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫기 방지
      >
        {/* Header */}
        <div className="justify-center bg-warning-400 mt-6 mb-6 text-2xl border-b-4 border-gray-500">
          {title}
        </div>

        {/* Body */}
        <div className="text-4xl border-orange-400 border-b-4 pt-4 pb-4">
          {content}
        </div>

        {/* Footer (Buttons) */}
        <div className="justify-end flex ">
          {/* 확인(Action) 버튼 */}
          <button
            className="rounded bg-blue-500 mt-4 mb-4 px-6 pt-4 pb-4 text-lg text-white"
            onClick={callbackFn}
          >
            확인 (Yes)
          </button>

          {/* 닫기(Cancel) 버튼 */}
          <button
            className="rounded bg-gray-500 mt-4 mb-4 ml-4 px-6 pt-4 pb-4 text-lg text-white"
            onClick={closeFn}
          >
            취소 (No)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonModal;
