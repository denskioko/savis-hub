import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute { return [{url:"https://savis-alpha.vercel.app/",changeFrequency:"weekly",priority:1},{url:"https://savis-alpha.vercel.app/how-it-works",changeFrequency:"monthly",priority:.7},{url:"https://savis-alpha.vercel.app/about",changeFrequency:"monthly",priority:.5}]; }
