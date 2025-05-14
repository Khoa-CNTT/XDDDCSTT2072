import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date) {
  const now = new Date();
  const secondsDiff = Math.floor((now - date) / 1000);
  const minutesDiff = Math.floor(secondsDiff / 60);
  const hoursDiff = Math.floor(minutesDiff / 60);
  const daysDiff = Math.floor(hoursDiff / 24);

  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

  if (daysDiff > 0) {
    return rtf.format(-daysDiff, "day");
  } else if (hoursDiff > 0) {
    return rtf.format(-hoursDiff, "hour");
  } else if (minutesDiff > 0) {
    return rtf.format(-minutesDiff, "minute");
  } else {
    return rtf.format(-secondsDiff, "second");
  }
}

export const renderContentWithTag = (content) => {
  return content.split(/(@\w+)/g).map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} className="text-blue-600 font-medium">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};
