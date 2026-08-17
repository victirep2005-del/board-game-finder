import { createAsyncStoragePersister } from "@tanstack/react-query-persist-client";
import { get, set, del } from "idb-keyval";

const idbStorage = {
  getItem: async (key: string) => (await get(key)) ?? null,
  setItem: async (key: string, value: string) => await set(key, value),
  removeItem: async (key: string) => await del(key),
};

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: idbStorage,
  key: "boardgame-finder-query-cache",
  throttleTime: 1000,
});
