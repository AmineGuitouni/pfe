export function wait(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getRelativeTime(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };

    for (const key in intervals) {
        const value = intervals[key];
        const count = Math.floor(diffInSeconds / value);

        if (count >= 1) {
        return count === 1 ? `1 ${key} ago` : `${count} ${key}s ago`;
        }
    }

    return "just now";
}

export function formatShortDate(isoDate: string): string {
    const date = new Date(isoDate);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes} UTC`;
}  