import RNFS from 'react-native-fs';

async function fileExist(fileUrl: string): Promise<boolean> {
  return RNFS.exists(fileUrl);
}

export async function downloadFile(
  url: string,
  roomId: string,
  tag?: string
): Promise<string> {
  const dir = RNFS.CachesDirectoryPath + `/${roomId}`;
  const exists = await RNFS.exists(dir);
  const isDirectory = exists ? (await RNFS.stat(dir)).isDirectory() : false;
  
  if (exists && !isDirectory) {
    throw new Error("dir不是一个目录");
  }
  if (!exists) {
    await RNFS.mkdir(dir);
  }
  
  const fileName = url.split("/").pop();
  const fileUrl = tag ? `${dir}/${tag}_${fileName}` : `${dir}/${Date.now().toString()}_${fileName}`;
  if (await fileExist(fileUrl)) {
    return fileUrl;
  }
  
  console.log(`location to save file: ${fileUrl}`);
  return RNFS.downloadFile({
    fromUrl: url,
    toFile: fileUrl,
  }).promise.then((res) => {
    if (res.statusCode === 200) {
      console.log('download success');
      return fileUrl;
    }
    console.log('download failed status: ', res.statusCode);
    return '';
  }).catch((e: Error) => {
    console.log('download failed: ', e);
    return '';
  });
}

export async function uploadFile(uri: string, uploadProgress?: (progress: number) => void): Promise<string> {
  return RNFS.uploadFiles({
    toUrl: 'https://fars.ee',
    files: [{
      name: 'file',
      filename: uri.split('/').pop() || 'file',
      filepath: uri,
      filetype: 'application/octet-stream'  // Generic binary file type
    }],
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
    },
    progress: (response) => {
      const progress = response.totalBytesSent / response.totalBytesExpectedToSend;
      uploadProgress?.(progress);
    },
  }).promise.then(response => {
    console.log('result body: ', response.body);
    return JSON.parse(response.body).url;
  }).catch((e: Error) => {
    console.log('upload error: ', e);
    throw new Error("上传失败");
  });
}