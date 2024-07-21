const BING_API_URL = 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US';

export async function getBingDailyImage() {
  const isDevelopment = import.meta.env.DEV;
  const apiUrl = isDevelopment ? '/bing-api/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US' : BING_API_URL;

  try {
    let data;
    if (isDevelopment) {
      // 在开发环境中使用 fetch 和代理
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      data = await response.json();
    } else {
      // 在生产环境中使用 XMLHttpRequest
      data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', apiUrl, true);
        xhr.responseType = 'json';

        xhr.onload = function() {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            reject(new Error(`HTTP error! status: ${xhr.status}`));
          }
        };

        xhr.onerror = function() {
          reject(new Error('Network error occurred'));
        };

        xhr.send();
      });
    }

    if (!data.images || data.images.length === 0) {
      throw new Error('No image data received from Bing API');
    }

    // 获取最高分辨率的图片 URL
    const baseUrl = 'https://www.bing.com';
    const imageUrl = data.images[0].url;
    const highResUrl = getHighestResolutionUrl(baseUrl + imageUrl);

    return highResUrl;
  } catch (error) {
    console.error('Error fetching Bing daily image:', error);
    return 'https://picsum.photos/1920/1080'; // 默认图片
  }
}

function getHighestResolutionUrl(url) {
  // Bing 图片 URL 通常包含 '_1920x1080.jpg'，我们将其替换为更高的分辨率
  // UHD 分辨率通常是 3840x2160
  return url.replace('_1920x1080.jpg', '_UHD.jpg');
}