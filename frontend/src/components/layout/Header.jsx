function Header({ user }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard 👋</h1>

        <p className="text-zinc-400 mt-2">
          Welcome back, {user?.email || "Guest"}
        </p>
      </div>

      <input
        className="bg-zinc-900 rounded-xl px-4 py-3 w-80"
        placeholder="Search summaries..."
      />
    </div>
  );
}

export default Header;
