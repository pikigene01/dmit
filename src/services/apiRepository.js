import axios from "axios";
let data_res = {
  status: 200,
  message: "data send",
};
let headers = {
  headers: {
    "content-type": "multipart/form-data",
  },
};
export const apiDataPost = async (url, data) => {
  try {
    await axios.post(url, data).then((res) => {
      data_res = res.data;
    });
  } catch (err) {
    const res = {
      status: 400,
      message: "network_error",
    };
    data_res = res;
  }
  return data_res;
};
export const apiDataPostForm = async (url, data) => {
  try {
    // axios.get('/sanctum/csrf-cookie').then(response => {

    await axios.post(url, data, headers).then((res) => {
      data_res = res.data;
    });
  } catch (err) {
    const res = {
      status: 400,
      message: "network_error",
    };
    data_res = res;
  }
  return data_res;
};
export const apiDataGet = async (url, data) => {
  try {
    await axios.get(url, data).then((res) => {
      data_res = res.data;
      return data_res;
    });
  } catch (e) {
    const res = {
      status: 400,
      message: "network_error",
    };
    data_res = res;
  }
  return data_res;
};

export const apiDataDelete = async (url, data) => {
  try {
    await axios.delete(url, data).then((res) => {
      data_res = res.data;
      return data_res;
    });
  } catch (e) {
    const res = {
      status: 400,
      message: "network_error",
    };
    data_res = res;
  }
  return data_res;
};
