import axios from 'axios';
import { BASE_URL } from './course/constants';

interface authUserForm {
  email: string;
  password: string;
}

interface authUserReturn {
  email: string;
  password: string;
  _id: number;
}


export const authUser = (data: authUserForm): Promise<authUserReturn> => {
  return axios.post(BASE_URL + '/auth/login', data);
};

export const regUser = ({
  email,
  password,
}: authUserForm): Promise<string> => {
  return axios.post(BASE_URL + '/auth/register', {
    email,
    password,
  });
};

export const getToken = async ({
  email,
  password,
}: authUserForm): Promise<string> => {
  const res = await axios.post(BASE_URL + '/auth/login', {
    email,
    password,
  });
  return res.data;
};