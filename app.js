const sectionFiles = [
  'sections/hero.html',
  'sections/intro.html',
  'sections/strengths.html',
  'sections/work.html',
  'sections/proof.html',
  'sections/experience.html',
  'sections/experiments.html',
  'sections/contact.html',
];

async function loadPortfolio() {
  const siteContent = document.querySelector('#siteContent');

  try {
    const sections = await Promise.all(
      sectionFiles.map(async (file) => {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Could not load ${file}`);
        return response.text();
      })
    );

    siteContent.innerHTML = sections.join('\n');

    await loadScript('proof-data.js');
    await loadScript('script.js');
  } catch (error) {
    console.error(error);
    siteContent.innerHTML = `
      <section class="section load-error">
        <p>Portfolio content could not be loaded. Please refresh the page.</p>
      </section>`;
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

loadPortfolio();
