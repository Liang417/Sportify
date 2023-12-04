import Lottie from "lottie-react";
import animationData from "../../assets/Animation - 1701684469022.json";

const EmptyResult = () => {
  const style = {
    width: 400,
    height: 400,
  };

  return (
    <div className="w-full flex items-center justify-center">
      <Lottie animationData={animationData} style={style} />
    </div>
  );
};

export default EmptyResult;
