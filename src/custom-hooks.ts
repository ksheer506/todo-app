import { useState, useEffect, useCallback } from "react";
import { Identified, TaskDB } from "./interfaces/db";
import { EditedTask } from "./interfaces/task";
import { fetchAllData } from "./modules/db/fetching";

export function useIndexedDB<T>(storeName: string) {
  const [data, setData] = useState<Array<T>>([]);

  useEffect(() => {
    (async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });
      const dbData = await fetchAllData(storeName);

      setData(dbData);
    })();
  }, []);
}

class Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string;
  text: string;
  tags: Array<string>;

  constructor(object: Pick<TaskDB, "title" | "dueDate">) {
    this.id = `id_${Date.now()}`;
    this.title = object.title;
    this.isCompleted = false;
    this.dueDate = object.dueDate || "";
    this.text = "";
    this.tags = [];
  }
}

function findObj<T extends Identified>(data: Array<T>, id: string): T {
  return data.filter((obj) => obj.id === id)[0];
}

export function useStateEditor<T extends Identified>(initialData: Array<T>) {
  const [data, setData] = useState(initialData);

  const editState = useCallback(
    (targetID: string, { field, newValue }: { field: keyof T; newValue: unknown }) => {
      if (!field) return;

      const dataEl = findObj(data, targetID);
      let _newVal = newValue;

      if (Array.isArray(dataEl[field])) {
        _newVal = [...dataEl[field], newValue];
      } else if (typeof dataEl[field] === "object" && typeof newValue === "object") {
        _newVal = { ...dataEl[field], ...newValue };
      }
      const modified = { ...dataEl, [field]: _newVal };

      setData((prev) => {
        return prev.map((el) => {
          if (el.id === targetID) {
            return modified;
          }
          return el;
        });
      });
      /* setCurrentWork({ action: "Task/MODIFY", task: history }); */
    },
    [data]
  );

  return [data, setData, editState] as const;
}

export function useLocalStorage(
  key: string,
  initialValue = ""
): [string, (x: string) => void] {
  const [data, setData] = useState<string>(initialValue);

  const setLocalStorage = (value: string) => {
    if (value) {
      localStorage.setItem(key, value);
      setData(value);
    }
  };

  useEffect(() => {
    const storageData = localStorage.getItem(key);

    if (!storageData) {
      localStorage.setItem(key, initialValue);

      return;
    }
    setData(storageData);
  }, []);

  return [data, setLocalStorage];
}

export function useDarkMode(): [boolean, () => void] {
  const [mode, setMode] = useLocalStorage("darkMode", "false");
  const modeBoolean = JSON.parse(mode);

  const setDarkMode = () => {
    setMode(`${!modeBoolean}`);
  };

  useEffect(() => {
    if (mode) {
      document.documentElement.setAttribute("dark-theme", mode);
    }
  }, [mode]);

  return [modeBoolean, setDarkMode];
}
