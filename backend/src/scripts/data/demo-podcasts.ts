import { PodcastStatus } from 'src/modules/podcast/enums/podcast-status.enum';

export interface DemoPodcast {
    title: string;
    slug: string;
    description: string;
    episodeNumber: number;
    durationSeconds: number;
    guest: string;
    audioUrl: string | null;
    videoUrl: string;
    coverImageUrl: string;
    status: PodcastStatus;
}

export const demoPodcasts: DemoPodcast[] = [
    {
        title: 'تعبیر یک دنیا؛ واقعیت مجازی، واقعیت افزوده',
        slug: 'tabir-ya-donya-vr-ar',
        description:
            'در این قسمت درباره دنیای واقعیت مجازی و واقعیت افزوده صحبت کردیم؛ از تجربه‌های شخصی در این فضا تا آینده‌ای که این فناوری‌ها برای زندگی روزمره ما می‌سازند. اگر به فناوری‌های نوین و تأثیرشان بر دنیای اطراف علاقه دارید، این قسمت را از دست ندهید.',
        episodeNumber: 1,
        durationSeconds: 5145,
        guest: 'مجتبی طباطبایی',
        audioUrl: null,
        videoUrl: 'https://www.youtube.com/embed/4XyQk7yNydk',
        coverImageUrl: '/images/img_1.jfif',
        status: PodcastStatus.PUBLISHED,
    },
    {
        title: 'Data Science at Digikala',
        slug: 'data-science-at-digikala',
        description:
            'در این قسمت با یکی از متخصصان حوزه علم داده گفت‌وگو کردیم؛ از مسیر ورود به دنیای دیتا، چالش‌های کار در مقیاس بزرگ و تجربه‌های واقعی در دیجی‌کالا. برای علاقه‌مندان به داده و کار در تیم‌های محصول، این قسمت پر از نکته‌های کاربردی است.',
        episodeNumber: 2,
        durationSeconds: 4530,
        guest: 'رضا شاه‌نظر',
        audioUrl: null,
        videoUrl: 'https://www.youtube.com/embed/5zXyQk7yNyd',
        coverImageUrl: '/images/img_2.jfif',
        status: PodcastStatus.PUBLISHED,
    },
    {
        title: 'Chef Entrepreneur؛ آشپزی و کارآفرینی',
        slug: 'chef-entrepreneur',
        description:
            'در این قسمت با یک سرآشپز کارآفرین درباره مسیر ساخت یک برند غذایی گفت‌وگو کردیم؛ از آشپزخانه‌های کوچک تا ساختن یک کسب‌وکار مستقل. روایتی از تلاش، خلاقیت و پشتکار در دنیای غذا.',
        episodeNumber: 3,
        durationSeconds: 4220,
        guest: 'سپهر سرلک',
        audioUrl: null,
        videoUrl: 'https://www.youtube.com/embed/pBQHV3Wo1YA',
        coverImageUrl: '/images/img_3.jfif',
        status: PodcastStatus.PUBLISHED,
    },
    {
        title: 'موزیک، استریمینگ و درآمد آنلاین',
        slug: 'music-streaming-online-income',
        description:
            'در این قسمت به دنیای موسیقی، پلتفرم‌های استریمینگ و راه‌های درآمدزایی آنلاین برای هنرمندان پرداختیم. از حقوق و حق امتیاز تا ساخت مخاطب در فضای دیجیتال؛ گفت‌وگویی شنیدنی برای علاقه‌مندان به موسیقی.',
        episodeNumber: 4,
        durationSeconds: 5415,
        guest: 'کیا رکنی',
        audioUrl: null,
        videoUrl: 'https://www.youtube.com/embed/7XyQk7yNydk',
        coverImageUrl: '/images/img_4.jpg',
        status: PodcastStatus.PUBLISHED,
    },
    {
        title: 'هوش مصنوعی؛ هرآنچه پیش‌رو داریم',
        slug: 'ai-what-lies-ahead',
        description:
            'در این قسمت درباره هوش مصنوعی صحبت کردیم؛ از توانایی‌های امروز تا چشم‌انداز آینده. چه چیزهایی در راه است و ما چطور می‌توانیم خودمان را برای دنیایی که هوش مصنوعی در آن نقش پررنگ‌تری دارد آماده کنیم؟',
        episodeNumber: 5,
        durationSeconds: 6025,
        guest: 'کوشیار عظیمیان',
        audioUrl: null,
        videoUrl: 'https://www.youtube.com/embed/8XyQk7yNydk',
        coverImageUrl: '/images/img_5.jpg',
        status: PodcastStatus.PUBLISHED,
    },
    {
        title: 'زندگی در دنیای مدرن',
        slug: 'life-in-modern-world',
        description:
            'گفت‌وگویی صمیمی درباره زندگی در دنیای مدرن؛ از فشارهای روزمره تا یافتن معنا در میانه شلوغی‌ها. این قسمت درباره انسان بودن در عصر سرعت است.',
        episodeNumber: 6,
        durationSeconds: 5740,
        guest: 'مارتین بصیری',
        audioUrl: null,
        videoUrl: 'https://www.youtube.com/embed/9XyQk7yNydk',
        coverImageUrl: '/images/img_6.jpg',
        status: PodcastStatus.PUBLISHED,
    },
    {
        title: 'Engineering Manager؛ مدیریت تیم‌های مهندسی',
        slug: 'engineering-manager',
        description:
            'در این قسمت درباره مدیریت تیم‌های مهندسی گفت‌وگو کردیم؛ از چالش‌های رهبری فنی تا ساختن فرهنگ تیمی سالم. برای کسانی که در مسیر مدیریت مهندسی هستند یا می‌خواهند باشند.',
        episodeNumber: 7,
        durationSeconds: 4830,
        guest: 'سینا جزایری',
        audioUrl: null,
        videoUrl: 'https://www.youtube.com/embed/9XyQk7yNydk',
        coverImageUrl: '/images/img_7.jpg',
        status: PodcastStatus.PUBLISHED,
    },
    {
        title: 'سرآوا؛ مسیر کارآفرینی',
        slug: 'saraava-entrepreneurship',
        description:
            'در این قسمت درباره مسیر کارآفرینی و ساختن یک کسب‌وکار پایدار گفت‌وگو کردیم؛ از ایده اولیه تا رشد و مقیاس‌پذیری. روایتی از تلاش، شکست‌ها و درس‌هایی که در مسیر یاد گرفته شد.',
        episodeNumber: 8,
        durationSeconds: 5145,
        guest: 'سعید رحمانی',
        audioUrl: null,
        videoUrl: 'https://www.youtube.com/embed/9XyQk7yNydk',
        coverImageUrl: '/images/img_8.jpg',
        status: PodcastStatus.PUBLISHED,
    },
    {
        title: 'خلاقیت؛ از ایده تا عمل',
        slug: 'creativity-idea-to-action',
        description:
            'خلاقیت فقط یک استعداد نیست؛ مهارتی است که می‌توان آن را پرورش داد. در این قسمت درباره فرآیند خلاقیت، غلبه بر موانع ذهنی و تبدیل ایده به عمل گفت‌وگو کردیم.',
        episodeNumber: 9,
        durationSeconds: 5415,
        guest: 'هوتن هاشمی',
        audioUrl: null,
        videoUrl: 'https://www.youtube.com/embed/9XyQk7yNydk',
        coverImageUrl: '/images/img_9.jpg',
        status: PodcastStatus.PUBLISHED,
    },
    {
        title: 'تجارت و عضویت در اتاق بازرگانی',
        slug: 'business-chamber-of-commerce',
        description:
            'در این قسمت درباره تجارت، بازار و تجربه حضور در اتاق بازرگانی گفت‌وگو کردیم؛ از فرصت‌های کسب‌وکار تا درس‌های یک فعال اقتصادی باتجربه.',
        episodeNumber: 10,
        durationSeconds: 4520,
        guest: 'فرزین فردیس',
        audioUrl: null,
        videoUrl: 'https://www.youtube.com/embed/9XyQk7yNydk',
        coverImageUrl: '/images/img_10.jpg',
        status: PodcastStatus.PUBLISHED,
    },
    {
        title: 'مدیریت مهندسی و ساخت تیم',
        slug: 'engineering-management-team',
        description:
            'گفت‌وگویی درباره مدیریت مهندسی، ساخت تیم‌های باکیفیت و چالش‌های رهبری فنی در شرکت‌های فناوری. برای مدیران و کسانی که به دنیای مهندسی نرم‌افزار علاقه دارند.',
        episodeNumber: 11,
        durationSeconds: 5735,
        guest: 'آرش میر',
        audioUrl: null,
        videoUrl: 'https://www.youtube.com/embed/9XyQk7yNydk',
        coverImageUrl: '/images/img_11.jpg',
        status: PodcastStatus.PUBLISHED,
    },
    {
        title: 'زندگی؛ سفرها و انتخاب‌ها',
        slug: 'life-journeys-choices',
        description:
            'در این قسمت درباره زندگی، سفرها و انتخاب‌هایی که مسیر ما را می‌سازند گفت‌وگو کردیم. روایتی صادقانه از تصمیم‌های بزرگ و لحظه‌هایی که زندگی را تغییر می‌دهند.',
        episodeNumber: 12,
        durationSeconds: 6035,
        guest: 'کیانوش نعمتی',
        audioUrl: null,
        videoUrl: 'https://www.youtube.com/embed/9XyQk7yNydk',
        coverImageUrl: '/images/img_12.jpg',
        status: PodcastStatus.PUBLISHED,
    },
];
