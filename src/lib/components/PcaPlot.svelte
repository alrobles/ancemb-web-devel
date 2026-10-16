<script>
  // Canvas scatter of a family's embedding PCA (2D).
  // Points are coloured by node_type; clicking a point calls onpick(sequence_id).
  let { items = [], onpick = () => {} } = $props();

  const COLORS = {
    tip: '#94a3b8',
    ancestral_known: '#0d9488',
    ancestral_inferred: '#f59e0b',
    candidate: '#ef4444',
  };

  let canvas;
  let pts = [];

  $effect(() => {
    if (!canvas || !items.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width - 60, H = canvas.height - 60;
    const xs = items.map((p) => p.x), ys = items.map((p) => p.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const y0 = Math.min(...ys), y1 = Math.max(...ys);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts = items.map((p) => ({
      x: 40 + ((p.x - x0) / (x1 - x0 || 1)) * W,
      y: 30 + H - ((p.y - y0) / (y1 - y0 || 1)) * H,
      c: COLORS[p.node_type] || '#6366f1',
      id: p.sequence_id,
    }));
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.c === '#94a3b8' ? 2 : 4, 0, 7);
      ctx.fillStyle = p.c;
      ctx.fill();
    }
  });

  function onclick(ev) {
    const r = canvas.getBoundingClientRect();
    const mx = (ev.clientX - r.left) * (canvas.width / r.width);
    const my = (ev.clientY - r.top) * (canvas.height / r.height);
    let best = null, bd = 1e9;
    for (const p of pts) {
      const dd = (p.x - mx) ** 2 + (p.y - my) ** 2;
      if (dd < bd) { bd = dd; best = p; }
    }
    if (best && bd < 400) onpick(best.id);
  }
</script>

<canvas bind:this={canvas} class="pca" width="1100" height="480" {onclick}></canvas>
