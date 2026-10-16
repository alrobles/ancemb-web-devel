<script>
  import { api } from '../lib/api.js';
  import PcaPlot from '../lib/components/PcaPlot.svelte';

  let { params = {} } = $props();
  const family = $derived(decodeURIComponent(params.family ?? ''));

  const SEQ_LIM = 50, RANK_LIM = 100;

  let detail = $state(null);
  let error = $state('');

  // sequences panel
  let seqRows = $state([]);
  let seqTotal = $state(0);
  let seqOff = $state(0);
  let seqQ = $state('');
  let seqNT = $state('');

  // ranking panel
  let rankRows = $state([]);
  let rankTotal = $state(0);
  let rankOff = $state(0);
  let rankOracle = $state('');

  // embeddings panel
  let pcaItems = $state(null);
  let nbId = $state('');
  let nbRows = $state(null);
  let selSeq = $state(null);
  let selEmb = $state(null);

  $effect(() => {
    const f = family;
    detail = null; error = '';
    seqOff = 0; rankOff = 0; pcaItems = null; nbRows = null; selSeq = null; selEmb = null;
    api.family(f).then((d) => (detail = d)).catch((e) => (error = String(e)));
    loadSeq(f); loadRank(f);
    api.pca(f).then((d) => (pcaItems = d.items)).catch(() => (pcaItems = []));
  });

  function loadSeq(f = family) {
    api.familySequences(f, { limit: SEQ_LIM, offset: seqOff, q: seqQ, node_type: seqNT })
      .then((d) => { seqRows = d.items; seqTotal = d.count; });
  }
  function loadRank(f = family) {
    api.familyRanking(f, { limit: RANK_LIM, offset: rankOff, oracle_class: rankOracle })
      .then((d) => { rankRows = d.items; rankTotal = d.count; })
      .catch(() => { rankRows = []; rankTotal = 0; });
  }

  function showSeq(sid) {
    nbId = sid;
    selSeq = null; selEmb = null;
    api.sequence(family, sid).then((d) => (selSeq = d)).catch(() => {});
    api.embedding(family, sid).then((d) => (selEmb = d)).catch(() => {});
  }
  function loadNeighbours() {
    if (!nbId.trim()) return;
    api.neighbours(family, nbId.trim(), 10)
      .then((d) => (nbRows = d.items))
      .catch(() => (nbRows = []));
  }
  const num = (v, p = 2) => (v == null || isNaN(v) ? '—' : (+v).toFixed(p));
</script>

<div class="container">
  <p style="margin-top:1.25rem"><a href="#/families">← all families</a></p>

  {#if error}
    <div class="card"><div class="card-pad">Family not found: <span class="mono">{family}</span></div></div>
  {:else if detail}
    <section class="hero" style="padding:2.5rem 2rem">
      <div class="hero-blobs"><span></span><span></span><span></span></div>
      <div class="hero-content">
        <h1 style="font-size:clamp(1.6rem,4vw,2.6rem)">{detail.display_name}</h1>
        <p class="mono muted" style="font-size:.85rem;margin:.2rem 0">{detail.family}</p>
        {#if detail.description}<p style="font-size:1rem">{detail.description}</p>{/if}
        <div style="margin-top:1rem">
          {#each Object.entries(detail.node_type_counts ?? {}) as [k, v]}
            <span class="badge">{k}: {v}</span>
          {/each}
          {#each Object.entries(detail.oracle_class_counts ?? {}) as [k, v]}
            <span class="badge green">{k}: {v}</span>
          {/each}
        </div>
        {#if detail.references?.length}
          <div style="margin-top:1rem;font-size:.9rem"><b>References:</b>
            {#each detail.references as r}
              <a class="badge green" href={r.url} target="_blank" rel="noopener">{r.label} ↗</a>
            {/each}
          </div>
        {/if}
      </div>
    </section>

    <div class="detail-grid" style="margin-top:1.25rem">
      <div class="card"><h2>Metadata</h2>
        <div class="card-pad"><dl class="kv">
          <dt>tips</dt><dd class="mono">{detail.n_tips}</dd>
          <dt>internal nodes</dt><dd class="mono">{detail.n_internal_nodes}</dd>
          <dt>ancestors</dt><dd class="mono">{detail.n_ancestors ?? '—'}</dd>
          <dt>sequences</dt><dd class="mono">{detail.n_sequences}</dd>
          {#if detail.curation_note}<dt>curation</dt><dd>{detail.curation_note}</dd>{/if}
        </dl></div>
      </div>
      <div class="card"><h2>Files</h2>
        <div class="card-pad">
          {#if detail.files?.length}
            {#each detail.files as f}
              <a class="dl-btn" href={api.fileUrl(detail.family, f.name)}>{f.name}</a>
              <span class="muted" style="font-size:.75rem">{(f.size_bytes / 1024).toFixed(0)} KB</span><br>
            {/each}
          {:else}<span class="muted">no raw files</span>{/if}
        </div>
      </div>
    </div>

    <div class="card"><h2>Embedding space (PCA)</h2>
      <div class="card-pad">
        <div style="font-size:.8rem;margin-bottom:.5rem">
          <span class="badge" style="background:#94a3b8;color:#1e293b">tip</span>
          <span class="badge" style="background:#0d9488;color:#fff">ancestral_known</span>
          <span class="badge" style="background:#f59e0b;color:#fff">ancestral_inferred</span>
          <span class="badge" style="background:#ef4444;color:#fff">candidate</span>
          <span class="muted">· click a point to inspect the sequence</span>
        </div>
        {#if pcaItems === null}
          <p class="muted">loading PCA…</p>
        {:else if pcaItems.length}
          <PcaPlot items={pcaItems} onpick={showSeq} />
          <p class="muted" style="font-size:.8rem">{pcaItems.length} sequences · PC1/PC2</p>
        {:else}
          <p class="muted">no embeddings for this family</p>
        {/if}

        <div class="search-bar" style="padding:.75rem 0;border:none">
          <input type="search" bind:value={nbId} placeholder="sequence_id → nearest neighbours (cosine)" style="flex:1">
          <button class="btn btn-primary" style="padding:.5rem 1.1rem" onclick={loadNeighbours}>find</button>
        </div>
        {#if nbRows?.length}
          <div class="table-wrap"><table>
            <thead><tr><th>sequence_id</th><th>cos</th><th></th></tr></thead>
            <tbody>{#each nbRows as r}
              <tr><td class="mono">{r.sequence_id}</td><td class="mono">{r.cosine_similarity.toFixed(4)}</td>
                <td><a href="#/" onclick={(e) => { e.preventDefault(); showSeq(r.sequence_id); }}>view</a></td></tr>
            {/each}</tbody>
          </table></div>
        {/if}

        {#if selSeq}
          <div class="card" style="margin:1rem 0 0"><h2>{selSeq.sequence_id}</h2>
            <div class="card-pad">
              <p class="muted" style="margin:.2rem 0 .6rem">
                type {selSeq.node_type} · len {selSeq.sequence_length} · gap {(selSeq.gap_fraction * 100).toFixed(1)}%
                {#if selEmb} · emb {selEmb.dim}d {selEmb.model_name} L{selEmb.layer}{/if}
              </p>
              <pre class="mono" style="white-space:pre-wrap;word-break:break-all;max-height:220px;overflow:auto;background:var(--bg-code);padding:.75rem;border-radius:8px">{selSeq.aligned_sequence ?? ''}</pre>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <div class="card"><h2>Sequences</h2>
      <form class="search-bar" onsubmit={(e) => { e.preventDefault(); seqOff = 0; loadSeq(); }}>
        <input type="search" bind:value={seqQ} placeholder="sequence_id contains…">
        <select bind:value={seqNT} onchange={() => { seqOff = 0; loadSeq(); }}>
          <option value="">any node_type</option>
          <option>tip</option><option>ancestral_known</option>
          <option>ancestral_inferred</option><option>candidate</option>
        </select>
        <button class="btn btn-primary" style="padding:.5rem 1.1rem" type="submit">Filter</button>
      </form>
      <div class="table-wrap"><table>
        <thead><tr><th>sequence_id</th><th>type</th><th>len</th><th>gap%</th><th></th></tr></thead>
        <tbody>{#each seqRows as r}
          <tr><td class="mono">{r.sequence_id}</td><td>{r.node_type}</td>
            <td class="mono">{r.sequence_length}</td>
            <td class="mono">{(r.gap_fraction * 100).toFixed(1)}</td>
            <td><a href="#/" onclick={(e) => { e.preventDefault(); showSeq(r.sequence_id); }}>view</a></td></tr>
        {/each}</tbody>
      </table></div>
      <div class="pager">
        <button onclick={() => { seqOff = Math.max(0, seqOff - SEQ_LIM); loadSeq(); }} disabled={seqOff === 0}>← Prev</button>
        <span class="muted">{seqTotal} seqs · offset {seqOff}</span>
        <button onclick={() => { seqOff += SEQ_LIM; loadSeq(); }} disabled={seqOff + SEQ_LIM >= seqTotal}>Next →</button>
      </div>
    </div>

    <div class="card"><h2>Ranking</h2>
      <form class="search-bar" onsubmit={(e) => { e.preventDefault(); rankOff = 0; loadRank(); }}>
        <select bind:value={rankOracle} onchange={() => { rankOff = 0; loadRank(); }}>
          <option value="">any oracle_class</option>
          {#each Object.keys(detail.oracle_class_counts ?? {}) as k}<option value={k}>{k}</option>{/each}
        </select>
        <span class="muted" style="font-size:.8rem">{rankTotal} ranked nodes</span>
      </form>
      <div class="table-wrap"><table>
        <thead><tr><th>node</th><th>ancestor</th><th>oracle</th><th>MAP id%</th><th>best id%</th><th>Δpp</th><th>best cos</th></tr></thead>
        <tbody>{#each rankRows as r}
          <tr><td class="mono">{r.node}</td><td class="mono">{r.ancestor_id}</td>
            <td><span class="badge green">{r.oracle_class ?? ''}</span></td>
            <td class="mono">{num(r.map_identity)}</td><td class="mono">{num(r.best_identity)}</td>
            <td class="mono">{num(r.best_vs_map_diff)}</td><td class="mono">{num(r.best_cos_sim, 4)}</td></tr>
        {/each}</tbody>
      </table></div>
      <div class="pager">
        <button onclick={() => { rankOff = Math.max(0, rankOff - RANK_LIM); loadRank(); }} disabled={rankOff === 0}>← Prev</button>
        <span class="muted">offset {rankOff}</span>
        <button onclick={() => { rankOff += RANK_LIM; loadRank(); }} disabled={rankOff + RANK_LIM >= rankTotal}>Next →</button>
      </div>
    </div>
  {:else}
    <p class="muted">loading…</p>
  {/if}
</div>
