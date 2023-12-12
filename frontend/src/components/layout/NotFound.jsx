import Lottie from "lottie-react";
import animationData from "../../assets/Animation - 1701684469022.json";

const NotFound = () => {
  const style = {
    width: 400,
    height: 300,
  };

  return (
    <div className="w-full flex items-center justify-center">
      <Lottie animationData={animationData} style={style} />
    </div>
  );
};

export default NotFound;
