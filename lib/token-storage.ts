export async function storeTokenId(tokenId: string | bigint): Promise<boolean> {
  try {
    const response = await fetch("/api/tokenids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tokenId: tokenId.toString(),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Token ID stored successfully:", data.tokenId);
      return true;
    } else {
      console.error("Failed to store token ID:", await response.text());
      return false;
    }
  } catch (error) {
    console.error("Error storing token ID:", error);
    return false;
  }
}

export async function getStoredTokenIds(): Promise<string[]> {
  try {
    const response = await fetch("/api/tokenids");
    if (response.ok) {
      const data = await response.json();
      return data.tokenIds;
    } else {
      console.error("Failed to fetch token IDs:", await response.text());
      return [];
    }
  } catch (error) {
    console.error("Error fetching token IDs:", error);
    return [];
  }
}
