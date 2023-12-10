import Lottie from "lottie-react";
import animationData from "../../assets/Animation - 1702020620750.json";

const Loader = () => {
  const style = {
    width: 500,
    height: 500,
  };

  return (
    <div className="w-full flex items-center justify-center">
      <Lottie animationData={animationData} style={style} />
    </div>
  );
};

export default Loader;
