const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
        }
    );

    revealItems.forEach((item) => observer.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
}

const yearNode = document.querySelector("[data-year]");
const runtimeLink = document.querySelector("[data-runtime-link]");
const runtimeNote = document.querySelector("[data-runtime-note]");
const isGitHubPages = window.location.hostname.endsWith("github.io");

if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
}

if (runtimeLink) {
    const href = isGitHubPages
        ? runtimeLink.dataset.pagesHref
        : runtimeLink.dataset.localHref;
    const label = isGitHubPages
        ? runtimeLink.dataset.pagesLabel
        : runtimeLink.dataset.localLabel;

    runtimeLink.setAttribute("href", href);
    runtimeLink.textContent = label;

    if (isGitHubPages) {
        runtimeLink.setAttribute("target", "_blank");
        runtimeLink.setAttribute("rel", "noreferrer");
    }
}

if (runtimeNote && isGitHubPages) {
    runtimeNote.textContent =
        "En GitHub Pages esta vista funciona como sitio estatico del producto. El dashboard PHP y las microapps siguen viviendo en el repositorio y en tu entorno local.";
}
