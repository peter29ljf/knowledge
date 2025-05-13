import { useState, useEffect, Dispatch, SetStateAction } from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = (): T => {
    // Prevent build errors from localStorage access
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // 添加日志追踪localStorage读取
      console.log(`正在读取localStorage键 "${key}"`);
      
      const item = window.localStorage.getItem(key);
      if (!item) {
        console.log(`localStorage键 "${key}" 不存在，使用初始值`);
        return initialValue;
      }
      
      const parsedItem = JSON.parse(item) as T;
      console.log(`localStorage键 "${key}" 读取成功`, parsedItem);
      return parsedItem;
    } catch (error) {
      console.warn(`读取localStorage键 "${key}" 时出错:`, error);
      // 在出错的情况下，清除可能损坏的数据
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        console.error(`清除损坏的localStorage键 "${key}" 时出错:`, e);
      }
      return initialValue;
    }
  };

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: SetValue<T> = (value) => {
    // Prevent build errors from localStorage access
    if (typeof window === 'undefined') {
      console.warn(
        `尝试设置localStorage键 "${key}" 但环境不是客户端`
      );
      return;
    }

    try {
      // Allow value to be a function so we have same API as useState
      const newValue = value instanceof Function ? value(storedValue) : value;
      
      // 检查是否可以序列化
      const serialized = JSON.stringify(newValue);
      if (!serialized) {
        throw new Error('无法序列化值');
      }
      
      // Save to local storage
      window.localStorage.setItem(key, serialized);
      console.log(`localStorage键 "${key}" 设置成功`, newValue);
      
      // Save state
      setStoredValue(newValue);
    } catch (error) {
      console.error(`设置localStorage键 "${key}" 时出错:`, error);
      // 即使localStorage操作失败，也要更新状态
      const newValue = value instanceof Function ? value(storedValue) : value;
      setStoredValue(newValue);
    }
  };

  // 初始化组件时从localStorage读取
  useEffect(() => {
    try {
      const value = readValue();
      setStoredValue(value);
    } catch (error) {
      console.error(`初始化localStorage钩子时出错:`, error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Listen to storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          if (event.newValue === null) {
            console.log(`localStorage键 "${key}" 已被其他窗口删除`);
            setStoredValue(initialValue);
            return;
          }
          
          const newValue = JSON.parse(event.newValue) as T;
          console.log(`localStorage键 "${key}" 在其他窗口中更新`, newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`解析其他窗口中的localStorage变更时出错, 键 "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
