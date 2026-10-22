# RazeTag legacy website host

Website editing has moved to the private [web_razedev](https://github.com/remyo/web_razedev)
repository, in `razetag/`. The current public website is
[RazeTag](https://remyo.github.io/razedev/razetag/home/) and its
[privacy policy](https://remyo.github.io/razedev/razetag/privacy/).

This public repository stays online to keep old app and store privacy links
working. Its original HTML pages forward to the corresponding current RazeDev
routes; their complete original page bodies and assets remain as a fallback.
Do not rename, privatize, or delete this repository until all old URLs have been
retired. Keep Pages serving `main` from the repository root.

The old publishing workflow is removed and `publish.sh` stops with migration
instructions, so this compatibility copy cannot overwrite the current website.
From the private `web_razedev` repository's `main` branch, publish with:

```sh
sh publish.sh gith5 razetag "update website"
```

Contact: [razeappdev@gmail.com](mailto:razeappdev@gmail.com).
