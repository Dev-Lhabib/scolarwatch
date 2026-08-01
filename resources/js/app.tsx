import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { hydrateRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'ScolarWatch';

const pages = import.meta.glob<{ default: ComponentType }>('./pages/**/*.tsx', {
    eager: true,
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => pages[`./pages/${name}.tsx`],
    setup({ el, App, props }) {
        if (el) {
            hydrateRoot(el, <App {...props} />);
        } else {
            return <App {...props} />;
        }
    },
    progress: {
        color: '#4B5563',
    },
});
