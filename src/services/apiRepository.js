import axios from "axios";
let apiprogress = {};
const options = {
  onUploadProgress: (progressEvent)=>{
    const {loaded, total} = progressEvent;
    let percentage = Math.floor( (loaded * 100) / total);
    apiprogress = {percentage,loaded,total};
  }
}

let data_res = {
  apiprogress,
};
let headers = {
  onUploadProgress: (progressEvent)=>{
    const {loaded, total} = progressEvent;
    let percent = Math.floor( (loaded * 100) / total);
    apiprogress = {percent,loaded,total};
  },
  headers: {
    "content-type": "multipart/form-data",
  },
};
export const apiDataPost = async (url, data) => {
  try {
    await axios.post(url, data,options).then((res) => {
      data_res += res.data;
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
      data_res += res.data;
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
    await axios.get(url, data,options).then((res) => {
      data_res += res.data;
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
    await axios.delete(url, data,options).then((res) => {
      data_res += res.data;
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
