function Sidebar() {
  return (
    <div className="w-64 bg-zinc-900-r border-zinc-800 text-white p-6 flex flex-col">
      <div className="mb-8 bg-zinc-900  rounded-xl ">
        <h1 className="text-2xl font-bold">VinhAn-AI-OS🚀</h1>
        AI-powered summaries
      </div>
      <div className="rounded-xl p-3 hover:bg-zinc-800 cursor-pointer transition">
        🏠 Dashboard
      </div>
      <div className="rounded-xl p-3 hover:bg-zinc-800 cursor-pointer transition">
        📰 Summaries
      </div>
      <div className="rounded-xl p-3 hover:bg-zinc-800 cursor-pointer transition">
        🤖 AI Summarize
      </div>
      <div className="rounded-xl p-3 hover:bg-zinc-800 cursor-pointer transition">
        📡 RSS Sources
      </div>
      <div className="rounded-xl p-3 hover:bg-zinc-800 cursor-pointer transition">
        ⭐ Favorites
      </div>
      <div className="rounded-xl p-3 hover:bg-zinc-800 cursor-pointer transition">
        📁 Categories
      </div>
      <div className="rounded-xl p-3 hover:bg-zinc-800 cursor-pointer transition">
        📊 Analytics
      </div>
      <div className="rounded-xl p-3 hover:bg-zinc-800 cursor-pointer transition">
        ⚙ Settings
      </div>
      <div className="mt-auto">
        <div className=" bg-zinc-700 p-4 rounded-xl mb-1 ">
          <h3>🟢 anAPI123@test.com</h3>
          <i className="text-sm">Premium Plan 👑</i>
        </div>

        <div className=" bg-zinc-700 p-4 rounded-xl mb-1">
          <button className="text-red-500 hover:text-blue-400">Logout</button>
        </div>

        <div className="mt-8 text-zinc-400 text-sm">
          &copy; 2024 AI Digest. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
