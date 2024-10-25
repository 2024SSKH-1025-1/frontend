import Microphone from "./components/Microphone";

export default function Home() {
  return (
    <main className="flex m-4 gap-4">
      <section id="userMedia" className="h-full flex flex-col w-1/2">
        <div>
          포즈넷 있어야 할 자리~
        </div>
        <Microphone />
      </section>
      <section id="userResult">
        
      </section>
    </main>
  );
}
