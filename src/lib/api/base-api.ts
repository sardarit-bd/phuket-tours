import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { env } from "@/config/env";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: env.NEXT_PUBLIC_API_URL,
    credentials: "include",
  }),
  tagTypes: ["Tour", "Experience", "Booking", "Category", "Auth", "User"],
  endpoints: () => ({}),
});
