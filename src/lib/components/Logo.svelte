<script>
  // AncEmb mark — a rooted phylogenetic tree (three tips) drawn in
  // currentColor with accent circles at the internal nodes: the resource is
  // a tree-indexed database of ancestral protein embeddings.
  let { size = 26 } = $props();
</script>

<svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
  <path d="M3.5 20.5 L9.5 14.5 L9.5 9.5 M9.5 14.5 L16 8 M9.5 9.5 L13.5 5.5 M13.5 5.5 L20.5 5.5 M16 8 L20.5 8 M9.5 9.5 L16 8 M9.5 14.5 L20.5 14.5 M3.5 20.5 L20.5 20.5"
    stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="9.5" cy="9.5" r="2" fill="var(--accent)" />
  <circle cx="9.5" cy="14.5" r="2" fill="var(--accent)" />
</svg>
