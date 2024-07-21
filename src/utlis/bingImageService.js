const BING_API_URL = '/bing-api/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US';

export async function getBingDailyImage() {
  try {
    const response = await fetch(BING_API_URL);

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

// 不再需要 jsonp 和 fetchBingImageUrlJsonp 函数

// 以下函数仅在服务器端环境中使用
export async function serverSideFetch() {
  if (typeof window !== 'undefined') {
    throw new Error('This function should only be called in a server-side environment');
  }

  const fetch = await import('node-fetch');
  const response = await fetch.default(BING_API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  if (!data.images || data.images.length === 0) {
    throw new Error('No image data received from Bing API');
  }
  return 'https://www.bing.com' + data.images[0].url;
}

// 仅用于服务器端的处理函数示例
export async function handler(event, context) {
  try {
    const imageUrl = await serverSideFetch();
    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl })
    };
  } catch (error) {
    console.error('Error in server function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch Bing image' })
    };
  }
}