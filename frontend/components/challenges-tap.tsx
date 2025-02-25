import { motion } from "framer-motion";
import { FaCoins } from "react-icons/fa";

interface Challenge {
  id: number;
  title: string;
  description: string;
  rewardPoints: number;
  deadline: string;
  completed: boolean;
}

const mockChallenges: Challenge[] = [
  {
    id: 1,
    title: "Week of Bug Fixes",
    description: "Fix 3 open issues in any OS project",
    rewardPoints: 200,
    deadline: "2025-12-31",
    completed: false,
  },
  {
    id: 2,
    title: "New Repo Explorer",
    description: "Make your first PR to a new repository",
    rewardPoints: 100,
    deadline: "2025-11-15",
    completed: true,
  },
];

function ChallengesTab() {
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6">
      <h2 className="text-xl font-bold mb-6">Challenges</h2>
      <div className="space-y-4">
        {mockChallenges.map((challenge) => (
          <motion.div
            key={challenge.id}
            whileHover={{ scale: 1.02 }}
            className={`p-4 rounded-lg border transition-colors ${
              challenge.completed
                ? "border-green-400/50 bg-green-400/10"
                : "border-gray-700/50 bg-gray-800/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{challenge.title}</h3>
                <p className="text-gray-400 text-sm">{challenge.description}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Deadline: {new Date(challenge.deadline).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 text-yellow-400">
                  <FaCoins />
                  <span className="font-medium">
                    +{challenge.rewardPoints} LAZY
                  </span>
                </div>
                {challenge.completed && (
                  <span className="text-green-400 text-sm font-medium mt-2">
                    Completed
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ChallengesTab;
