export const saveChampionHash = (hash: string) => {
  localStorage.setItem("championHash", hash);
};

export const fetchChampionHash = (): string | null => {
  return localStorage.getItem("championHash");
};

export const removeChampionHash = () => {
  return localStorage.removeItem("championHash");
};

export const saveDraftHash = (hash: string) => {
  localStorage.setItem("draftHash", hash);
};

export const fetchDraftHash = (): string | null => {
  return localStorage.getItem("draftHash");
};

export const removeDraftHash = () => {
  return localStorage.removeItem("draftHash");
};
