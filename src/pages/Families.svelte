<script>
  import { api } from '../lib/api.js';

  let rows = $state([]);
  let loading = $state(true);
  let q = $state('');

  $effect(() => {
    api.families()
      .then((d) => (rows = d.items))
      .finally(() => (loading = false));
  });

  const filtered = $derived(
    q
      ? rows.filter((r) =>
          `${r.display_name} ${r.family} ${r.description ?? ''}`
            .toLowerCase()
            .includes(q.toLowerCase())
        )
      : rows
  );
</script>

<div class="container">
  <h1 style="font-family:var(--font-serif);font-weight:600;margin:1.5rem 0 .25rem">Families</h1>
  <p class="muted" style="margin-top:0">{filtered.length} of {rows.length} families</p>

  <div class="card">
    <form class="search-bar" onsubmit={(e) => e.preventDefault()}>
      <input type="search" bind:value={q} placeholder="Family name, description…">
    </form>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Family</th><th>Tips</th><th>Internal</th><th>Seqs</th><th>Data</th><th>Notes</th></tr>
        </thead>
        <tbody>
          {#if loading}
            <tr><td colspan="6" class="muted">Loading…</td></tr>
          {:else}
            {#each filtered as r}
              <tr>
                <td>
                  <a href="#/families/{encodeURIComponent(r.family)}"><b>{r.display_name}</b></a>
                  <div class="mono muted" style="font-size:.75rem">{r.family}</div>
                </td>
                <td class="mono">{(r.n_tips ?? 0).toLocaleString()}</td>
                <td class="mono">{(r.n_internal_nodes ?? 0).toLocaleString()}</td>
                <td class="mono">{(r.n_sequences ?? 0).toLocaleString()}</td>
                <td>
                  {#if r.has_embeddings}<span class="badge green">emb</span>{/if}
                  {#if r.has_ranking}<span class="badge green">rank</span>{/if}
                  {#if r.has_05b}<span class="badge">05b</span>{/if}
                  {#if r.has_paml}<span class="badge">paml</span>{/if}
                  {#if r.has_scoring}<span class="badge">score</span>{/if}
                  {#if r.has_conservation}<span class="badge">cons</span>{/if}
                </td>
                <td class="muted" style="max-width:26rem;font-size:.8rem">
                  {r.description || r.curation_note || ''}
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>
