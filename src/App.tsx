import Calendar from "./Calendar";

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 py-8">
      <h1 className="text-2xl font-bold text-center text-zinc-800 dark:text-zinc-100 mb-2">
        Office Days Planner
      </h1>
      <Calendar />
    </div>
  );
}

export default App;
