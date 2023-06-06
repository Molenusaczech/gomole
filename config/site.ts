export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Gomoku",
  description:
    "Beautifully designed components built with Radix UI and Tailwind CSS.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
  ],
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/shadcn/ui",
    docs: "https://ui.shadcn.com",
  },
  restUrl: "http://localhost:8081",
  socketUrl: "http://localhost:8080",
  recaptchaSite: "6Led6F4mAAAAAIIRJtaTD4268AC7dvhkOEsd_oub"

}
