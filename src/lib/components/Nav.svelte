<script>
  import { link } from 'svelte-spa-router';
  import active from 'svelte-spa-router/active';
  import { theme, toggleTheme } from '../theme.js';
  import Logo from './Logo.svelte';
</script>

<nav class="nav">
  <a class="nav-brand" href="#/" use:link>
    <Logo size={26} />
    Anc<span>Emb</span>
  </a>
  <div class="nav-links">
    <a href="#/" use:link use:active={{ path: '/', className: 'active' }}>Home</a>
    <a href="#/families" use:link use:active={{ path: '/families', className: 'active' }}>Families</a>
    <a href="https://ancemb.ecoseek.org/docs" target="_blank" rel="noopener">API</a>
    <a href="https://github.com/alrobles/ancemb-web-devel" target="_blank" rel="noopener">GitHub</a>
    <button class="theme-btn" onclick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
      {$theme === 'dark' ? '☀' : '☾'}
    </button>
  </div>
</nav>
