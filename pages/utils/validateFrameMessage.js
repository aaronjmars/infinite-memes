export default async function validateFrameMessage(message) {
  if (!message.untrustedData || !message.trustedData) {
    return false;
  }

  const { fid, url, messageHash, timestamp, network, buttonIndex, state } =
    message.untrustedData;
  const { messageBytes } = message.trustedData;

  if (
    !fid ||
    !url ||
    !messageHash ||
    !timestamp ||
    !network ||
    !buttonIndex ||
    !state ||
    !messageBytes
  ) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - timestamp > 60) {
    return false;
  }

  // Cryptographically verify the message via Neynar
  const neynarApiKey = process.env.NEYNAR_API_KEY;
  if (!neynarApiKey) {
    console.error("NEYNAR_API_KEY is not set, cannot verify frame message");
    return false;
  }

  try {
    const response = await fetch(
      "https://api.neynar.com/v2/farcaster/frame/validate",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          api_key: neynarApiKey,
        },
        body: JSON.stringify({ message_bytes_in_hex: messageBytes }),
      }
    );

    if (!response.ok) {
      console.error("Neynar validation request failed:", response.status);
      return false;
    }

    const result = await response.json();
    return result.valid === true;
  } catch (error) {
    console.error("Frame message verification failed:", error);
    return false;
  }
}
