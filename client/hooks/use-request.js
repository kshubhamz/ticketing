import { useState } from "react";
import axios from "axios";

export const useRequest = (url) => {
  const [errors, setErrors] = useState(null);

  const performRequest = (method, body) => {
    return new Promise(async (resolve, reject) => {
      try {
        setErrors(null);
        const response = await axios[method](url, body);
        resolve(response.data);
      } catch (err) {
        setErrors(<p>{err.response.data.message}</p>);
        reject(err.response.data.message);
      }
    });
  };

  return { performRequest, errors };
};
