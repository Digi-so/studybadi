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

## Project rules

- `useStored` (src/lib/storage.ts) writes to localStorage only inside `update()`; never persist from an effect or inside a state updater. Why: an effect fires on the initial mount with the pre-read fallback (wiping saved data), and the synchronous storage event re-entering setState can apply an update twice.
