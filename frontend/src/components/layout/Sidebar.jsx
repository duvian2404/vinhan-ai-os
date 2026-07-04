function Sidebar() {
  return (
    <div className="w-64 bg-zinc-900 text-white p-6">
      <h1 className="text-2xl font-bold">🚀 AI Digest</h1>

      <ul className="mt-8 space-y-4">
        <li>🏠 Dashboard</li>
        <li>📰 Summaries</li>
        <li>📡 RSS Sources</li>
        <li>⭐ Favorites</li>
        <li>📊 Analytics</li>
        <li>⚙️ Settings</li>
      </ul>
    </div>
  );
}

export default Sidebar;
