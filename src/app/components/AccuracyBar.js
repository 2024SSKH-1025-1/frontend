import { useState, useEffect } from "react";

const AccuracyBar = () => {
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    const fetchAccuracy = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/fake_accuracy`); // API 엔드포인트 주소 입력
        const data = await response.json();
        console.log(data);

        setAccuracy(((data.accuracy + 1) / 2) * 100);
      } catch (error) {
        console.error("정확도 데이터를 가져오는 중 오류 발생:", error);
      }
    };

    setTimeout(() => {
      setInterval(fetchAccuracy, 500);
    }, 6000);
  }, []);

  return (
    <div className="w-2/3">
      {accuracy ? <>
        <progress className="progress progress-primary w-full" value={accuracy} max="100" />
        <p className="text-center mt-2 text-lg">{Math.round(accuracy)}%</p>
      </>: <p>준비 중...</p>}
    </div>
  );
};

export default AccuracyBar;
