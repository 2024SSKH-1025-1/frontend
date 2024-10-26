import { useState, useEffect } from "react";

const AccuracyBar = () => {
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    const fetchAccuracy = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/fake_accuracy`); // API 엔드포인트 주소 입력
        const data = await response.json();
        console.log(data);

        setAccuracy(data.accuracy);
      } catch (error) {
        console.error("정확도 데이터를 가져오는 중 오류 발생:", error);
      }
    };

    setInterval(fetchAccuracy, 500);
  }, []);

  if (accuracy === null) {
    return <p>데이터 로딩 중...</p>;
  }

  const percentage = ((accuracy + 1) / 2) * 100;

  return (
    <div className="w-full">
      <progress className="progress progress-primary w-full" value={percentage} max="100" />
      <p className="text-center mt-2 text-sm">{Math.round(percentage)}%</p>
    </div>
  );
};

export default AccuracyBar;
