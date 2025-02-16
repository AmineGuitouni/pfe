export default function Background(){
  return (
    <div className="fixed w-[calc(100vw+360px)] h-[calc(100vh+360px)] inset-0 grid grid-cols-[repeat(auto-fill,180px)] grid-rows-[repeat(auto-fill,180px)] gap-2 place-content-center overflow-hidden -m-[180px]">
      {Array.from({ length: 70 }).map((_, rowIndex) => (
        Array.from({ length: 70 }).map((_, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="w-[180px] h-[180px] bg-white/5 rounded-xl opacity-30"
          />
        ))
      ))}
    </div>
  );
};