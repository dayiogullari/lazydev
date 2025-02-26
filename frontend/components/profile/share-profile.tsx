function ShareProfileButton() {
  const handleShare = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      "Check out my open-source contributions on LazyDev! #LazyDev",
    )}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleShare}
      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all"
    >
      Share on Twitter
    </button>
  );
}

export default ShareProfileButton;
