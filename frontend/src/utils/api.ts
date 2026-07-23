// Mock data for development
const mockVideos = [
  {
    "id": 1,
    "title": "تعبیر یک دنیا؛ واقعیت مجازی، واقعیت افزوده",
    "youtube_url": "https://www.youtube.com/embed/4XyQk7yNydk",
    "thumbnail": "/images/img_1.jfif",
    "guest": " مجتبی طباطبایی",
    "duration": "01:25:45"
  },
  {
    "id": 2,
    "title": "Data Science at Digikala",
    "youtube_url": "https://www.youtube.com/embed/5zXyQk7yNyd",
    "thumbnail": "/images/img_7.jpg",
    "guest": "رضا شاه نظر",
    "duration": "01:15:30"
  },
  {
    "id": 3,
    "title": "Chef Entrepreneur",
    "youtube_url": "https://www.youtube.com/watch?v=pBQHV3Wo1YA",
    "thumbnail": "/images/img_8.jpg",
    "guest": "سپهر سرلک",
    "duration": "01:10:20"
  },
  {
    "id": 4,
    "title": "موزیک، استریمینگ و درآمد آنلاین",
    "youtube_url": "https://www.youtube.com/embed/7XyQk7yNydk",
    "thumbnail": "/images/img_6.jpg",
    "guest": "کیا رکنی",
    "duration": "01:30:15"
  },
  {
    "id": 5,
    "title": "هوش مصنوعی؛ هرآنچه پیشرو داریم",
    "youtube_url": "https://www.youtube.com/embed/8XyQk7yNydk",
    "thumbnail": "/images/img_4.jpg",
    "guest": " کوشیار عظیمیان",
    "duration": "01:40:25"
  },
  {
    "id": 6,
    "title": "تعبیر یک دنیا؛ واقعیت مجازی، واقعیت افزوده",
    "youtube_url": "https://www.youtube.com/embed/9XyQk7yNydk",
    "thumbnail": "/images/img_5.jpg",
    "guest": " مجتبی طباطبایی",
    "duration": "01:35:40"
  },
  {
    "id": 7,
    "title": "تعبیر یک دنیا؛ واقعیت مجازی، واقعیت افزوده",
    "youtube_url": "https://www.youtube.com/embed/9XyQk7yNydk",
    "thumbnail": "/images/img_13.jpg",
    "guest": "مارتین بصیری",
    "duration": "01:20:10"
  },
  {
    "id": 8,
    "title": "Engineering Manager at Frame.io, an Adobe Company",
    "youtube_url": "https://www.youtube.com/embed/9XyQk7yNydk",
    "thumbnail": "/images/img_12.jpg",
    "guest": "سینا جزایری",
    "duration": "01:45:30"
  },
  {
    "id": 9,
    "title": "سرآوا",
    "youtube_url": "https://www.youtube.com/embed/9XyQk7yNydk",
    "thumbnail": "/images/img_14.jpg",
    "guest": "سعید رحمانی",
    "duration": "01:25:45"
  },
  {
    "id": 10,
    "title": "عضو اتاق بازرگانی تهران",
    "youtube_url": "https://www.youtube.com/embed/9XyQk7yNydk",
    "thumbnail": "/images/img_11.jpg",
    "guest": "فرزین فردیس",
    "duration": "01:15:20"
  },
  {
    "id": 11,
    "title": "خلاقیت",
    "youtube_url": "https://www.youtube.com/embed/9XyQk7yNydk",
    "thumbnail": "/images/img_10.jpg",
    "guest": "هوتن هاشمی",
    "duration": "01:30:15"
  },
  {
    "id": 12,
    "title": "زندگی",
    "youtube_url": "https://www.youtube.com/embed/9XyQk7yNydk",
    "thumbnail": "/images/img_9.jpg",
    "guest": "آرش میر",
    "duration": "01:40:35"
  }
];

export const fetchVideos = async () => {
  // For now, return mock data
  // In production, you can fetch from a real API
  return mockVideos;
};

export const fetchVideo = async (id: string) => {
  const videoId = parseInt(id);
  const video = mockVideos.find(v => v.id === videoId);
  
  if (!video) {
    throw new Error('Video not found');
  }
  
  return video;
};