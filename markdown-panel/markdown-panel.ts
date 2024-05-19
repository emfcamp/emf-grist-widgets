import { LitElement, html, css } from 'lit-element'
import { customElement, state } from 'lit/decorators.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { marked } from 'marked'

@customElement('markdown-panel')
export class MarkdownPanel extends LitElement {
    @state({ type: String })
    mode: string = 'view'

    @state({ type: String })
    markdown = ''

    static styles = css`
        p {
            margin-top: 0;
            margin-bottom: 16px;
        }

        textarea {
            width: 100%;
            height: 50vh;
        }

        button {
            padding: 10px 20px;
        }

        h1,
        h2,
        h3,
        h4 {
            font-family: 'Raleway', sans-serif;
            margin-top: 0;
        }
    `

    constructor() {
        super()
        grist.ready({
            onEditOptions: () => {
                this.mode = 'edit'
            },
        })
        grist.onOptions((options, interaction) => {
            if (options.markdown) {
                this.markdown = options.markdown
            } else {
                this.mode = 'edit'
            }
        })
    }

    saveText() {
        const textarea = this.shadowRoot!.querySelector('textarea')!
        grist.setOption('markdown', textarea.value)
        this.markdown = textarea.value
        this.mode = 'view'
    }

    protected render() {
        const rendered_markdown = unsafeHTML(marked(this.markdown) as string)
        if (this.mode === 'edit') {
            return html`
                <textarea>${this.markdown}</textarea>
                <div class="button-group">
                    <button @click="${this.saveText}">Save</button>
                    <button @click="${() => (this.mode = 'view')}">Cancel</button>
                </div>
            `
        } else {
            return html`<div class="markdown-panel">${rendered_markdown}</div>`
        }
    }
}
