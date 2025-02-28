import { Loader2 } from "lucide-react";
import { FaRocket } from "react-icons/fa";

interface ConfigItem {
  labelId: number;
  reward_contract: string;
  reward_config: string;
}

export const ConfigurationButton = ({
  configurations,
  isConfiguring,
  handleLinkRepo,
  isLinked,
  isAlreadyLinked,
}: {
  isLinked: boolean;
  configurations: ConfigItem[];
  isConfiguring: boolean;
  handleLinkRepo: () => void;
  isAlreadyLinked: boolean;
}) => {
  if (isConfiguring) {
    return (
      <button
        disabled
        className="px-6 py-3 rounded-lg flex items-center gap-2 bg-[#09090B] text-[#c1c1c7] border border-zinc-800 opacity-50 cursor-not-allowed"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Confirming Configuration...</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLinkRepo}
      disabled={!configurations.length || isLinked || isAlreadyLinked}
      className={`px-6 py-3 rounded-lg flex items-center gap-2 bg-[#09090B] text-[#c1c1c7] ${
        !configurations.length || isLinked || isAlreadyLinked ? " " : "hover:bg-zinc-700"
      } border border-zinc-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <FaRocket className="w-4 h-4" />
      <span>
        {isLinked
          ? "Configuration Linked"
          : isAlreadyLinked
            ? "Configuration Already Linked"
            : "Confirm Configuration"}
      </span>
    </button>
  );
};
