<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Site content (photos, videos, events, settings) lives in the database and the private `media` bucket; images are shown through signed URLs (public buckets are blocked in this workspace).
- The static public/sitemap.xml is the single sitemap source; the server entry serves its bundled XML before SSR so crawlers never receive application HTML for that path.
- The first account ever created becomes admin via a DB trigger; admin checks use `has_role` + RLS, never client state.
- YouTube videos come from the channel's public RSS feed via a server function, merged with manually managed rows in `videos`.
- Homepage pastor portraits use the `pastor_image` site setting and the existing private-media signed URL flow, keeping supplied photos in managed storage.
- Both the opening and shared ContactBlock use the managed real facade image from hero_image through signed URLs; keep the location photo uncropped.
- Public loading errors share QueryError; media overlays use the shared Radix Dialog for focus trapping, Escape and restored trigger focus.
- Keep contact validation in content-validation and cached public read hooks in site.ts so admin and public views share one data contract.
