export default function Background(){
    return(
        <div className=" fixed inset-0 flex flex-col gap-2 items-center w-full h-full overflow-hidden">
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {Array.from({ length:10}).map((_, colIndex) => (
              <div
                key={colIndex}
                className="w-[180px] h-[180px] bg-white/5 rounded-xl opacity-30"
              />
            ))}
          </div>
        ))}
      </div>
    )
}