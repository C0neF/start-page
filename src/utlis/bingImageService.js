const API_URL = 'https://api.bing.conef.top';

export async function getBingDailyImage() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // 优先使用中国版图片，如果没有则使用国际版
    const image = data.cn[0] || data.com[0];
    
    if (!image) {
      throw new Error('No image data received from Bing API');
    }

    return getHighestResolutionUrl(image.imageUrl);
  } catch (error) {
    console.error('Error fetching Bing daily image:', error);
    return 'https://picsum.photos/1920/1080'; // 默认图片
  }
}

function getHighestResolutionUrl(url) {
  return url.replace('_1920x1080.jpg', '_UHD.jpg');
}