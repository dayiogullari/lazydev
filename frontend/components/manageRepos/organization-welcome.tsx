"use client";
import React from "react";
import { FaCodeBranch } from "react-icons/fa";

const OrganizationWelcome = ({}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 pt-4 px-4">
      <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mb-2">
        <FaCodeBranch className="w-8 h-8 text-emerald-400" />
      </div>

      <div className="text-center space-y-4 max-w-lg">
        <h2 className="text-2xl font-bold text-white">No Admin Repositories</h2>
        <p className="text-zinc-400 text-lg">
          To add repositories to the contract and give rewards, you need to have admin access to
          those repositories. This ensures that you have the necessary permissions to manage
          settings and configurations.
        </p>
      </div>
    </div>
  );
};

export default OrganizationWelcome;
