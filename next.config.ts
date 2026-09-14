import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 💡 Supabase Storage의 선수 사진을 Next.js 이미지 최적화로 가져오기 위한 허용 목록입니다.
    // 원본 PNG를 매번 받는 대신, 작게 리사이즈된 WebP가 서버에 캐시되어 제공됩니다.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qylssoobbniwcsqkkoqk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // 최적화된 이미지를 서버에 하루(86400초) 동안 캐시합니다.
    // 같은 사진을 다른 유저가 봐도 Supabase에 다시 요청하지 않습니다.
    minimumCacheTTL: 86400,
  },

  // 💡 옛 주소 호환: /masl/26s 시절 링크·북마크가 깨지지 않게 새 구조로 넘겨줍니다.
  async redirects() {
    return [
      {
        source: '/masl/26s/team/:path*',
        destination: '/masl/team/:path*',
        permanent: false,
      },
      {
        source: '/masl/26s',
        destination: '/masl/26%20spring',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
