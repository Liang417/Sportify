import Lottie from "lottie-react";
import animationData from "../../assets/124016-coding-time.json";

const Loader = () => {
  const style = {
    width: 500,
    height: 500,
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Lottie animationData={animationData} style={style} />
    </div>
  );
};

export default Loader;
