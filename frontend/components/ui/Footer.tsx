export function Footer() {
	return (
		<footer className="border-t border-gray-700/50 mt-12 py-6">
			<div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
				<p className="mb-2">Powered by Celestia & zkTLS</p>
				<div className="flex justify-center gap-4">
					<span className="hover:text-blue-400 cursor-pointer transition-colors">
						Docs
					</span>
					<span className="hover:text-purple-400 cursor-pointer transition-colors">
						About
					</span>
					<span className="hover:text-green-400 cursor-pointer transition-colors">
						GitHub
					</span>
				</div>
			</div>
		</footer>
	);
}
