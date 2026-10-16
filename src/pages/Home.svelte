<script>
  import { api } from '../lib/api.js';

  let stats = $state(null);
  let families = $state([]);
  let loading = $state(true);

  $effect(() => {
    Promise.all([api.stats(), api.families()])
      .then(([s, f]) => { stats = s; families = f.items; })
      .finally(() => (loading = false));
  });

  const oracleCounts = $derived(stats?.oracle_class ?? {});
  const independent = $derived(
    Object.entries(oracleCounts)
      .filter(([k]) => k.startsWith('simulated') || k.startsWith('experimental'))
      .reduce((a, [, v]) => a + v, 0)
  );

  const featured = $derived(
    [...families]
      .sort((a, b) => (b.n_sequences ?? 0) - (a.n_sequences ?? 0))
      .slice(0, 6)
  );
</script>

<section class="hero">
  <div class="hero-blobs"><span></span><span></span><span></span></div>
  <div class="hero-content">
    <div class="hero-kicker">Trees → alignments → embeddings → rankings</div>
    <h1>Anc<span class="acc">Emb</span></h1>
    <p>
      A phylogeny-indexed benchmark of <b>ancestral protein embeddings</b>:
      mean-pooled ESM-2&nbsp;650M trait vectors, deposited / simulated /
      experimental oracle ancestors, and ASR candidate rankings — per internal
      node, per family.
    </p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="#/families">Browse the families</a>
      <a class="btn btn-ghost" href="https://ancemb.ecoseek.org/docs" target="_blank" rel="noopener">OpenAPI docs</a>
    </div>
  </div>
</section>

<div class="container">
  <div class="stats">
    <div class="stat"><div class="num">{stats ? stats.n_families : '…'}</div><div class="label">Families</div></div>
    <div class="stat"><div class="num">{stats ? stats.n_sequences.toLocaleString() : '…'}</div><div class="label">Sequences</div></div>
    <div class="stat"><div class="num">{stats ? stats.n_embeddings.toLocaleString() : '…'}</div><div class="label">Embeddings</div></div>
    <div class="stat"><div class="num">{stats ? stats.n_ranked_nodes?.toLocaleString() : '…'}</div><div class="label">Ranked nodes</div></div>
    <div class="stat"><div class="num">{loading ? '…' : independent.toLocaleString()}</div><div class="label">Independent-truth nodes</div></div>
  </div>

  {#if families.length}
  <div class="card">
    <h2>Largest families</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Family</th><th>Tips</th><th>Internal nodes</th><th>Seqs</th><th>Data</th></tr></thead>
        <tbody>
          {#each featured as r}
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
                {#if r.has_scoring}<span class="badge">score</span>{/if}
                {#if r.has_conservation}<span class="badge">cons</span>{/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="card-pad"><a href="#/families">View all families →</a></div>
  </div>
  {/if}

  <div class="card"><div class="card-pad">
    <p class="muted" style="margin:.25rem 0">
      <b>Caveat for reuse:</b> most ranked rows carry
      <span class="mono">deposited_ML</span> oracle truths — a method-disagreement
      control stratum, not an independent accuracy measure. Filter analyses to
      <span class="mono">oracle_class ∈ simulated_* · experimental_*</span>
      ({independent.toLocaleString()} nodes) for independent-truth claims.
      This instance is a read-only mirror of the KU HPC
      <span class="mono">db_mvp</span> bundle.
    </p>
  </div></div>
</div>
