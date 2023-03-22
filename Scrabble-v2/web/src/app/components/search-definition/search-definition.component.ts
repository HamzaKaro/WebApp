import { Component } from '@angular/core';
import { HttpService } from '@app/http.service';
import { TranslateService } from '@ngx-translate/core';

interface DefinitionsByCategory {
    category: string;
    definitions: string[];
}
@Component({
    selector: 'app-search-definition',
    templateUrl: './search-definition.component.html',
    styleUrls: ['./search-definition.component.scss'],
})
export class SearchDefinitionComponent {
    searchText: string;
    definitions: DefinitionsByCategory[];
    errorMessage: string;
    isLoading: boolean;
    constructor(private http: HttpService, private translate: TranslateService) {
        this.searchText = '';
        this.errorMessage = '';
        this.definitions = [];
        this.isLoading = false;
    }
    async search() {
        this.isLoading = true;
        this.errorMessage = '';
        const definitions = await this.http.findWordDefinition(this.searchText).toPromise();
        try {
            if (!definitions) return;
            if (definitions.error !== '') {
                this.isLoading = false;
                this.errorMessage = this.generateApiError();
            }

            this.setDefinitions(definitions);
            this.isLoading = false;
        } catch (error) {
            this.errorMessage = this.translate.instant('search_definition.unknown_error');
        }
    }

    // The API returns the errors only in french.
    // Also the most common error is the following : "Mot X pas dans le dictionnaire"
    generateApiError(): string {
        return this.translate.instant('search_definition.word_not_found_error', { value: this.searchText });
    }

    clear(): void {
        this.errorMessage = '';
        this.isLoading = false;
        this.searchText = '';
        this.definitions = [];
    }

    // https://stackoverflow.com/a/58807273
    // https://stackoverflow.com/a/70574378
    // transformTextToUrl(_text: string) {
    //     this.sanitizer.bypassSecurityTrustHtml("some <a onClick='Window.SearchDefinitionComponent.print()'>link</a> here");
    // }
    definitionHasAnchorTag(definition: string): boolean {
        return this.extractTextBetweenAnchorTag(definition) !== '';
    }

    // This function assumes the API will always return a definition that ends with <a ...>something<\a>
    getTextBeforeAnchorTag(html: string) {
        const anchorText = this.extractTextBetweenAnchorTag(html);
        const textWithoutHtml = this.textFromHtml(html);
        if (textWithoutHtml.includes(`${anchorText}.`)) {
            return textWithoutHtml.replace(`${anchorText}.`, '');
        }
        return textWithoutHtml.replace(anchorText, '');
    }
    extractTextBetweenAnchorTag(text: string) {
        try {
            const parser = new DOMParser();
            const matches = parser.parseFromString(text, 'text/html').getElementsByTagName('a');
            if (!matches.length) return '';
            return matches[matches.length - 1].innerHTML;
        } catch (error) {
            return text;
        }
    }
    // input : This is a <a href="http://www.link1">link</a>
    // output : This is a link
    private textFromHtml(html: string): string {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(html, 'text/html');
        return htmlDoc.body.innerText;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private setDefinitions(searchResponse: any) {
        // { nature: ['Adjectif', 'Nom Commun']}
        const categories: string[] = searchResponse.nature;

        // { natureDef: [['def1 category1', 'def2 category1'], ['def1 category2', 'def2 category2']]}
        const natureDef = searchResponse.natureDef;
        const definitions: DefinitionsByCategory[] = [];
        for (let index = 0; index < categories.length; index++) {
            const defs: string[] = [];
            const defObject = natureDef[index][0];
            for (const [key, value] of Object.entries(defObject)) {
                defs.push(`${key}. ${value}`);
            }
            const definition: DefinitionsByCategory = { category: categories[index], definitions: defs };
            definitions.push(definition);
        }
        this.definitions = definitions;
    }
}
