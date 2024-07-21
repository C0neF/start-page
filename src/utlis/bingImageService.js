const BING_API_URL = 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US';

export async function getBingDailyImage() {
  const isDevelopment = import.meta.env.DEV;

  try {
    let imageUrl;

    if (isDevelopment) {
      // 开发环境：直接请求 Bing API（通过 Vite 代理）
      const response = await fetch('/bing-api' + BING_API_URL.substring(BING_API_URL.indexOf('/')));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.images || data.images.length === 0) {
        throw new Error('No image data received from Bing API');
      }
      imageUrl = 'https://www.bing.com' + data.images[0].url;
    } else {
      // 生产环境：直接请求 Bing API
      imageUrl = await fetchBingImageUrl();
    }

    // 获取最高分辨率的图片 URL
    return getHighestResolutionUrl(imageUrl);
  } catch (error) {
    console.error('Error fetching Bing daily image:', error);
    return 'https://picsum.photos/1920/1080'; // 默认图片
  }
}

function getHighestResolutionUrl(url) {
  return url.replace('_1920x1080.jpg', '_UHD.jpg');
}

async function fetchBingImageUrl() {
  // 使用无 CORS 限制的方法请求 Bing API
  const response = await fetch(BING_API_URL, { mode: 'no-cors' });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const text = await response.text();
  const data = JSON.parse(text);
  if (!data.images || data.images.length === 0) {
    throw new Error('No image data received from Bing API');
  }
  return 'https://www.bing.com' + data.images[0].url;
}

// 服务器端函数（用于 Netlify, Vercel, 等）
export async function handler(event, context) {
  try {
    const imageUrl = await fetchBingImageUrl();
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

// Express.js 中间件
export function expressBingImageMiddleware(req, res) {
  fetchBingImageUrl()
    .then(imageUrl => res.json({ imageUrl }))
    .catch(error => {
      console.error('Error in Express middleware:', error);
      res.status(500).json({ error: 'Failed to fetch Bing image' });
    });
}