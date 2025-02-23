import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const { accessToken } = req.body;
	try {
		const response = await fetch("http://localhost:8080/proof-user", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ accessToken }),
		});

		if (!response.ok) {
			return res.status(response.status).json({ error: "Request failed" });
		}

		const data = await response.json();
		return res.status(200).json({ proofData: data.proofData });
	} catch {
		return res.status(500).json({ error: "Internal server error" });
	}
}
