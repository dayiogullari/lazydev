"use client";
import { useEffect, useState } from "react";

function ThemeToggle() {
	const [isDark, setIsDark] = useState(true);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", isDark);
	}, [isDark]);

	return (
		<button
			onClick={() => setIsDark(!isDark)}
			className="p-2 bg-gray-700 text-gray-200 rounded"
		>
			{isDark ? "Light Mode" : "Dark Mode"}
		</button>
	);
}

export default ThemeToggle;
