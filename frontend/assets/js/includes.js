'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const rootPath = body.dataset.root || './';
    const partialsRoot = body.dataset.partialsRoot || './partials';
    const currentPage = body.dataset.page || '';

    const includeTargets = Array.from(document.querySelectorAll('[data-include]'));
    if (!includeTargets.length) {
        hydrateNavLinks();
        announcePartialsReady();
        return;
    }

    const fetchPartials = includeTargets.map((target) => {
        const source = target.getAttribute('data-include');
        if (!source) {
            return Promise.resolve();
        }

        const url = `${partialsRoot.replace(/\/$/, '')}/${source}`;
        return fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load partial: ${url}`);
                }
                return response.text();
            })
            .then((html) => {
                const processed = html.replace(/{{root}}/g, rootPath);
                target.innerHTML = processed;
            })
            .catch((error) => {
                console.error(error);
            });
    });

    Promise.all(fetchPartials).then(() => {
        hydrateNavLinks();
        announcePartialsReady();
    });

    function hydrateNavLinks() {
        const routes = {
            home: 'index.html',
            shop: 'pages/shop.html',
            single: 'pages/single.html',
            bestseller: 'pages/bestseller.html',
            cart: 'pages/cart.html',
            checkout: 'pages/cheackout.html',
            'not-found': 'pages/404.html',
            contact: 'pages/contact.html'
        };

        document.querySelectorAll('[data-nav-link]').forEach((link) => {
            const key = link.getAttribute('data-nav-link');
            const relativePath = routes[key];
            if (!relativePath) {
                return;
            }

            const href = `${rootPath}${relativePath}`;
            link.setAttribute('href', href);

            if (key === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function announcePartialsReady() {
        document.dispatchEvent(new Event('partials:loaded'));
    }
});
