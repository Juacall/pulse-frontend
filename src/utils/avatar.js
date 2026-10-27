// utils/avatar.js
export function getFallbackAvatar(name = "Politician", party = "Independent") {
    // Extract up to 2 initials (e.g., "Jane Doe" -> "JD")
    const initials = name
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "P";

    // Match party color themes
    let bgColor = "#475569"; // Default Slate (Slate-600)
    let textColor = "#f8fafc"; // Slate-50

    const partyUpper = String(party).toUpperCase();
    if (partyUpper.includes("DEMOCRAT") || partyUpper === "D") {
        bgColor = "#1e3a8a"; // Dark Blue (Blue-900)
        textColor = "#60a5fa"; // Light Blue (Blue-400)
    } else if (partyUpper.includes("REPUBLICAN") || partyUpper === "R") {
        bgColor = "#7f1d1d"; // Dark Red (Red-900)
        textColor = "#f87171"; // Light Red (Red-400)
    } else if (partyUpper.includes("LIBERTARIAN") || partyUpper === "L") {
        bgColor = "#78350f"; // Amber/Yellow
        textColor = "#fbbf24";
    }

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="${bgColor}"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="sans-serif" font-size="38" font-weight="700">
        ${initials}
      </text>
    </svg>
  `.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}