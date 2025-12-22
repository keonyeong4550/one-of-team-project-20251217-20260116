import jwtAxios from "../util/jwtUtil";
import { API_SERVER_HOST } from "./memberApi";

const host = `${API_SERVER_HOST}/api/admin`;

export const getPendingList = async () => {
  const res = await jwtAxios.get(`${host}/pending`);
  return res.data;
};

export const getActiveList = async (pageParam) => {
  const { page, size } = pageParam;
  const res = await jwtAxios.get(`${host}/active`, { params: { page, size } });
  return res.data;
};

export const putApprove = async (email) => {
  const res = await jwtAxios.put(`${host}/approve/${email}`);
  return res.data;
};

export const putSoftDelete = async (email) => {
  const res = await jwtAxios.put(`${host}/delete/${email}`);
  return res.data;
};
