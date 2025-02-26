import { FaTrophy, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";

// interface Achievement {
//   id: number;
//   name: string;
//   description: string;
//   unlocked: boolean;
// }

function AchievementsTab() {
  const achievements = [
    {
      id: 1,
      name: "First PR",
      description: "Merged your first PR",
      unlocked: true,
    },
    {
      id: 2,
      name: "10 Contributions",
      description: "Reached 10 total contributions",
      unlocked: false,
    },
    {
      id: 3,
      name: "Bug Smasher",
      description: "Closed 5 confirmed issues",
      unlocked: false,
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-3">
        <FaTrophy className="w-6 h-6 text-emerald-400" />
        <h2 className="text-2xl font-bold text-zinc-100">Achievements</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach) => (
          <motion.div
            key={ach.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-lg border border-zinc-800 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#0A0A0A]" />

            <div className="absolute inset-0">
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
            </div>

            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {ach.unlocked ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <FaTrophy className="w-4 h-4 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center">
                      <FaLock className="w-4 h-4 text-zinc-600" />
                    </div>
                  )}
                  <h3
                    className={`font-semibold ${
                      ach.unlocked ? "text-emerald-400" : "text-zinc-500"
                    }`}
                  >
                    {ach.name}
                  </h3>
                </div>

                {ach.unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-emerald-400"
                  />
                )}
              </div>

              <p className={`text-sm ${ach.unlocked ? "text-zinc-300" : "text-zinc-500"}`}>
                {ach.description}
              </p>

              {!ach.unlocked && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                  <motion.div className="h-full bg-emerald-500/20" style={{ width: "30%" }} />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default AchievementsTab;
