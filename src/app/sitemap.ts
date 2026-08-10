import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://volumecall.in";
  const currentDate = new Date();

  const routes = [
    "",
    "/stocks/reliance",

    "/markets",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/disclaimer",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "" || route === "/stocks/reliance" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/stocks") ? 0.8 : 0.5,
  }));
}
