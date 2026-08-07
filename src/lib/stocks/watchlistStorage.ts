export interface IWatchlistStorage {
  getWatchlist(name: string): Promise<string[]>;
  saveWatchlist(name: string, symbols: string[]): Promise<void>;
  getWatchlists(): Promise<string[]>;
  createWatchlist(name: string): Promise<void>;
  deleteWatchlist(name: string): Promise<void>;
}

export class LocalStorageWatchlistStorage implements IWatchlistStorage {
  private getKey(name: string) {
    return `watchlist:${name.toLowerCase().trim()}`;
  }

  async getWatchlist(name: string): Promise<string[]> {
    if (typeof window === "undefined") return [];
    const item = localStorage.getItem(this.getKey(name));
    return item ? JSON.parse(item) : [];
  }

  async saveWatchlist(name: string, symbols: string[]): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.getKey(name), JSON.stringify(symbols));
  }

  async getWatchlists(): Promise<string[]> {
    if (typeof window === "undefined") return ["Default"];
    const lists = localStorage.getItem("watchlists:index");
    return lists ? JSON.parse(lists) : ["Default"];
  }

  async createWatchlist(name: string): Promise<void> {
    if (typeof window === "undefined") return;
    const lists = await this.getWatchlists();
    const trimmed = name.trim();
    if (trimmed && !lists.includes(trimmed)) {
      lists.push(trimmed);
      localStorage.setItem("watchlists:index", JSON.stringify(lists));
      await this.saveWatchlist(trimmed, []);
    }
  }

  async deleteWatchlist(name: string): Promise<void> {
    if (typeof window === "undefined") return;
    const lists = await this.getWatchlists();
    const updated = lists.filter(l => l !== name);
    localStorage.setItem("watchlists:index", JSON.stringify(updated));
    localStorage.removeItem(this.getKey(name));
  }
}

let watchlistStorageInstance: IWatchlistStorage;

export function getWatchlistStorage(): IWatchlistStorage {
  if (!watchlistStorageInstance) {
    watchlistStorageInstance = new LocalStorageWatchlistStorage();
  }
  return watchlistStorageInstance;
}
