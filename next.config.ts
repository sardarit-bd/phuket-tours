import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin/bookings",
        destination: "/dashboard/admin/bookings",
        permanent: false,
      },
      {
        source: "/admin/bookings/staff",
        destination: "/dashboard/admin/bookings/staff",
        permanent: false,
      },
      {
        source: "/admin/bookings/agents",
        destination: "/dashboard/admin/bookings/agents",
        permanent: false,
      },
      {
        source: "/admin/bookings/direct",
        destination: "/dashboard/admin/bookings/direct",
        permanent: false,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
