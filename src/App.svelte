<script>
  import Router from 'svelte-spa-router';
  import Nav from './lib/components/Nav.svelte';
  import Footer from './lib/components/Footer.svelte';
  import Home from './pages/Home.svelte';
  import Families from './pages/Families.svelte';
  import Family from './pages/Family.svelte';

  const routes = {
    '/': Home,
    '/families': Families,
    '/families/:family': Family,
    '*': Home,
  };
</script>

<a class="skip-link" href="#main">Skip to content</a>
<Nav />
<main id="main">
  <Router {routes} />
</main>
<Footer />
