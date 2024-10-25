import Microphone from "./components/Microphone";
import PoseNetComponent from "./PoseNetComponent";

export default function Home() {
  return (
    <main className="flex m-4 gap-4">
      <section id="userMedia" className="h-[calc(100vh-6em)] gap-4 flex flex-col w-1/2">
        <div className="mockup-browser bg-base-300 border">
          <h1 className="mockup-browser-toolbar">사용자 모습</h1>
          <div className="flex align-center justify-center p-4 grow bg-base-200">
            <PoseNetComponent />
          </div>
        </div>
        
        <Microphone />
      </section>
      <section id="userResult">
        
      </section>
    </main>
  );
}
