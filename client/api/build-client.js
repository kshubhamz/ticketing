import axios from "axios";

export const buildClient = ({ req }) => {
  if (typeof window === "undefined") {
    // server
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    });
  } else {
    return axios.create();
  }
};