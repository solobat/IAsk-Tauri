import * as qiniu from 'qiniu-js'
import axios from 'axios';

export function uploadImg(file: File, key?: string) {
  const options = {
    quality: 0.92,
    noCompressIfLarger: true
  }
  
  return qiniu.compressImage(file, options).then(data => {
    const newFile = data.dist as File;
    const formData = new FormData();

    formData.append('file', newFile);
    formData.append('name', newFile.name);
    formData.append('type', newFile.type);
    formData.append('lastModifiedDate', String(newFile.lastModified));
    formData.append('size', String(newFile.size));

    return axios.post('http://bbs.oksteward.com/api/upload_private', formData).then((res) => {
      return res.data
    });
  })
}
