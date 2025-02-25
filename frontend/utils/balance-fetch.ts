import { useState, useEffect } from "react";

export interface TokenInfo {
	symbol: string;
	amount: number;
	usdValue: number;
	icon?: React.ReactNode;
	change24h?: number;
}

interface ApiBalanceResponse {
	tokens: TokenInfo[];
	totalUsdValue: number;
	totalChange24h: number;
}

export function useTokenBalances(
	walletAddress?: string,
	refreshInterval?: number,
) {
	const [balances, setBalances] = useState<TokenInfo[]>([]);
	const [totalUsdValue, setTotalUsdValue] = useState<number>(0);
	const [totalChange24h, setTotalChange24h] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const fetchBalances = async () => {
		setIsLoading(true);
		setError(null);

		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));

			const response: ApiBalanceResponse = {
				tokens: [
					{
						symbol: "ETH",
						amount: 0.05,
						usdValue: 125.32,
						change24h: 3.2,
					},
					{
						symbol: "ATOM",
						amount: 10.5,
						usdValue: 84.23,
						change24h: -1.4,
					},
					{
						symbol: "LDT",
						amount: 500,
						usdValue: 50,
						change24h: 12.5,
					},
					{
						symbol: "GYATT",
						amount: 1250,
						usdValue: 62.5,
						change24h: 5.7,
					},
					{
						symbol: "LAZY",
						amount: 150,
						usdValue: 240,
						change24h: 1.1,
					},
				],
				totalUsdValue: 562.05,
				totalChange24h: 4.8,
			};

			setBalances(response.tokens);
			setTotalUsdValue(response.totalUsdValue);
			setTotalChange24h(response.totalChange24h);
		} catch (err) {
			setError("Failed to fetch token balances");
			console.error("Error fetching token balances:", err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchBalances();

		if (refreshInterval) {
			const interval = setInterval(fetchBalances, refreshInterval);
			return () => clearInterval(interval);
		}
	}, [walletAddress]);

	const getTokenBySymbol = (symbol: string): TokenInfo | undefined => {
		return balances.find((token) => token.symbol === symbol);
	};

	const getTokenAmount = (symbol: string): number => {
		const token = getTokenBySymbol(symbol);
		return token ? token.amount : 0;
	};

	return {
		balances,
		totalUsdValue,
		totalChange24h,
		isLoading,
		error,
		refreshBalances: fetchBalances,
		getTokenBySymbol,
		getTokenAmount,
	};
}

export function formatTokenAmount(
	amount: number,
	symbol?: string,
	includeSymbol: boolean = true,
): string {
	let formattedAmount: string;

	if (amount < 0.001 && amount > 0) {
		formattedAmount = amount.toExponential(2);
	} else if (amount < 1 && amount > 0) {
		formattedAmount = amount.toFixed(4);
	} else if (amount >= 1000000) {
		formattedAmount = (amount / 1000000).toFixed(2) + "M";
	} else if (amount >= 1000) {
		formattedAmount = amount.toLocaleString(undefined, {
			maximumFractionDigits: 2,
		});
	} else {
		formattedAmount = amount.toFixed(2);
	}

	if (includeSymbol && symbol) {
		return `${formattedAmount} ${symbol}`;
	}

	return formattedAmount;
}

export function formatUsdValue(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}
