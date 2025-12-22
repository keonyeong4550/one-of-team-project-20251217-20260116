import JoinComponent from "../../components/member/JoinComponent";
import BasicMenu from "../../components/menu/BasicMenu";

const JoinPage = () => {
  return (
    <div className="fixed top-0 left-0 z-[1055] flex flex-col h-full w-full">
      <BasicMenu />
      <div className="w-full flex flex-wrap h-full justify-center items-center border-2">
        <JoinComponent />
      </div>
    </div>
  );
};

export default JoinPage;
