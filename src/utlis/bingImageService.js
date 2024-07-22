const API_URL = 'https://api.20010522.xyz/bing';

export async function getBingDailyImage() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // 优先使用中国版图片，如果没有则使用国际版
    const cnImage = data.bingCn && data.bingCn[0];
    const comImage = data.bingCom && data.bingCom[0];
    const image = cnImage || comImage;
    
    if (!image) {
      throw new Error('No image data received from Bing API');
    }

    return getHighestResolutionUrl(image.url);
  } catch (error) {
    console.error('Error fetching Bing daily image:', error);
    return 'https://picsum.photos/1920/1080'; // 默认图片
  }
}

function getHighestResolutionUrl(url) {
  // Bing API返回的URL可能不包含完整的域名，所以我们需要添加它
  if (url.startsWith('/')) {
    url = `https://www.bing.com${url}`;
  }
  return url.replace('_1920x1080.jpg', '_UHD.jpg');
}