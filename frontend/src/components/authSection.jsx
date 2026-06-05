function AuthSection({
  email,
  setEmail,
  password,
  setPassword,
  user,
  login,
  logout,
  register,
  summaries,
  filteredSummaries,
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-5xl font-bold mb-3">VinhAn-ai-os 🚀</h1>

        <span className="text-zinc-400 text-lg">
          AI-powered summaries dashboard
        </span>
      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
        {!user && (
          <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
            <h2 className="text-2xl font-bold mb-4">Login</h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-800 mb-4"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-800 mb-4"
            />

            <button
              onClick={login}
              className="text-white bg-blue-600 px-5 py-3 rounded-xl"
            >
              Login
            </button>
            <button
              onClick={register}
              className="text-white bg-green-600 px-5 py-3 rounded-xl ml-4 "
            >
              Register
            </button>
          </div>
        )}
        {user && (
          <div className=" bg-green-900 p-6 rounded-2xl mb-6 flex items-center">
            <h2 className="text-blue-400 text-2xl font-bold mb-2">
              Logged In 😄
            </h2>

            <p className="ml-4">Welcome {user.email}</p>
            <button
              onClick={logout}
              className=" ml-auto text-white bg-yellow-600 px-4 py-2 rounded-xl hover:bg-yellow-300 transition  font-semibold"
            >
              Logout
            </button>
          </div>
        )}

        <div className="mb-8">
          {/* <input
                type="text"
                placeholder="Search summaries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl outline-none focus:border-blue-500"
              /> */}

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <p className="text-zinc-400 text-sm mb-2">Total Summaries</p>

              <h2 className="text-3xl font-bold">{summaries.length}</h2>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <p className="text-zinc-400 text-sm mb-2">AI Sources</p>

              <h2 className="text-3xl font-bold">
                {new Set(filteredSummaries.map((s) => s.source)).size}
              </h2>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <p className="text-zinc-400 text-sm mb-2">Dashboard Status</p>

              <h2 className="text-2xl font-bold text-green-400">Online</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
    // </div>
  );
}

export default AuthSection;
