const LOCAL_API_URL = '/api/bing';

export async function getBingDailyImage() {
  try {
    const response = await fetch(LOCAL_API_URL, {
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.images || data.images.length === 0) {
      throw new Error('No image data received from Bing API');
    }

    const imageUrl = 'https://www.bing.com' + data.images[0].url;
    return getHighestResolutionUrl(imageUrl);
  } catch (error) {
    console.error('Error fetching Bing daily image:', error);
    return 'https://picsum.photos/1920/1080'; // 默认图片
  }
}

function getHighestResolutionUrl(url) {
  return url.replace('_1920x1080.jpg', '_UHD.jpg');
}