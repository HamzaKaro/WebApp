import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { THEMES } from 'src/theme.config';
@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    name: string;
    constructor(@Inject(DOCUMENT) private document: Document) {}

    setTheme(name = 'light') {
        this.name = name;
        type ObjectKey = keyof typeof THEMES;
        const themeName = name as ObjectKey;
        const theme = THEMES[themeName];
        type ObjectKey2 = keyof typeof theme;
        Object.keys(theme).forEach((key) => {
            const param = key as ObjectKey2;
            const theme1 = theme[param];
            this.document.documentElement.style.setProperty(`--${key}`, theme1);
        });
    }

    get theme() {
        return this.name;
    }
}
