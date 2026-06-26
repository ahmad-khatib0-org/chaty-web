import { useEffect, useRef } from 'react'
import { defaultKeymap, history } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder } from '@codemirror/view'

import { AutoCompleteSearchSpace } from '@/components/common'
import { isInFencedCodeBlock } from './code-mirror-common'
import { smartLineWrapping } from './code-mirror-line-wrap'
import { codeMirrorAutoComplete } from './code-mirror-auto-complete'
import { codeMirrorWidgets } from './code-mirror-widgets'
import { markPlugins } from './code-mirror-marks'
import { markdownTheme } from './code-mirror-theme'

interface Props {
  /**
   * Auto focus the input on creation
   */
  autoFocus?: boolean

  /**
   * Placeholder to show when no text is shown
   */
  placeholder?: string

  /**
   * Initial value to show in the text box
   */
  initialValue?: readonly [string]

  /**
   * Signal for sending a node replacement or focus request to the editor
   */
  nodeReplacement?: readonly [string | '_focus']

  /**
   * Event is fired when the text content changes
   * @param value Text value
   */
  onChange: (value: string) => void

  /**
   * Event is fired when user submits (Enter) content
   */
  onComplete?: () => void

  /**
   * Event is fired when any keys are input
   */
  onTyping?: () => void

  /**
   * Event is fired when 'previous context' is requested
   * i.e. edit the last message (given current is empty)
   */
  onPreviousContext?: () => void

  /**
   * Auto complete search space
   */
  autoCompleteSearchSpace?: () => AutoCompleteSearchSpace
}

const placeholderCompartment = new Compartment()

/**
 * Text editor powered by CodeMirror
 */
export function TextEditor2({
  autoCompleteSearchSpace,
  onChange,
  onTyping,
  autoFocus,
  onComplete,
  placeholder: Placeholder,
  initialValue,
  nodeReplacement,
  onPreviousContext,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  /**
   * Handle 'Enter' key presses
   * Submit only if not currently in a code block
   */
  const enterKeymap = keymap.of([
    {
      key: 'Enter',
      run: (view) => {
        if (!onComplete) return false

        const cursor = view.state.selection.main
        if (!isInFencedCodeBlock(view.state, cursor.from, cursor.to)) {
          onComplete()
          return true
        } else {
          return false
        }
      },
    },
  ])

  /**
   * Handle 'ArrowUp' key presses
   */
  const arrowUpKeymap = keymap.of([
    {
      key: 'ArrowUp',
      run: (view) => {
        if (view.state.doc.length > 0 || !onPreviousContext) return false
        onPreviousContext()
        return true
      },
    },
  ])

  // Initialize CodeMirror
  useEffect(() => {
    if (!containerRef.current) return

    /**
     * CodeMirror instance
     */
    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: initialValue?.[0],
        extensions: [
          /* Enable browser spellchecking */
          EditorView.contentAttributes.of({ spellcheck: 'true' }),

          /* Mount keymaps */
          enterKeymap,
          keymap.of(defaultKeymap as never), // required for atomic ranges to work: https://github.com/codemirror/dev/issues/923
          arrowUpKeymap,

          /* Enable history */
          history(),

          /* Use the bundled Markdown syntax */
          markdown({ base: markdownLanguage }),

          /* Linewrapping */
          smartLineWrapping,

          /* Placeholder */
          placeholderCompartment.of(placeholder ? placeholder(Placeholder ?? '') : []),

          /* Autocomplete */
          codeMirrorAutoComplete(autoCompleteSearchSpace?.()),

          /* Custom items */
          codeMirrorWidgets(),
          markPlugins,

          /* Widgets */
          markdownTheme,

          /* Handle change event */
          EditorView.updateListener.of((view) => {
            if (view.docChanged) {
              const text = view.state.doc.toString().trim()
              onChange?.(text)
              if (text) onTyping?.()
            }
          }),
        ],
      }),
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  // connect signals to extensions - update placeholder
  useEffect(() => {
    if (!viewRef.current) return
    viewRef.current.dispatch({
      effects: placeholderCompartment.reconfigure(placeholder ? placeholder(Placeholder ?? '') : []),
    })
  }, [placeholder])

  // set initial value
  useEffect(() => {
    if (!viewRef.current) return
    const text = initialValue?.[0] ?? ''
    viewRef.current.dispatch(
      viewRef.current.state.update({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: text },
        selection: {
          anchor: text.length,
        },
      })
    )
  }, [initialValue])

  // apply changes - node replacement
  useEffect(() => {
    if (!viewRef.current || !nodeReplacement) return

    viewRef.current.focus()

    const text = nodeReplacement[0]
    if (text !== '_focus') {
      viewRef.current.dispatch(viewRef.current.state.replaceSelection(text))
      if (text) onTyping?.()
      onChange(viewRef.current.state.doc.toString())
    }
  }, [nodeReplacement])

  // auto focus on mount
  useEffect(() => {
    if (!autoFocus || !viewRef.current) return

    setTimeout(() => {
      viewRef.current?.focus()
      viewRef.current?.dispatch(
        viewRef.current.state.update({
          selection: {
            anchor: viewRef.current.state.doc.length,
          },
        })
      )
    }, 0)
  }, [autoFocus])

  return <div ref={containerRef} className={editor} />
}

const editor = `
  flex-grow self-center text-[var(--md-sys-color-on-surface)] font-normal text-[var(--message-size)] font-[var(--fonts-primary)]
  
  & .cm-editor.cm-focused {
    outline: none !important;
  }

  /* copied from elements.ts */
  & .md-h1 {
    font-size: 2em;
    font-weight: 600;
  }
  & .md-h2 {
    font-size: 1.6em;
    font-weight: 600;
  }
  & .md-h3 {
    font-size: 1.4em;
    font-weight: 600;
  }
  & .md-h4 {
    font-size: 1.2em;
    font-weight: 600;
  }
  & .md-h5 {
    font-size: 1em;
    font-weight: 600;
  }
  & .md-h6 {
    font-size: 0.8em;
    font-weight: 600;
  }

  & .md-meta-atom {
    font-size: inherit;
    font-weight: inherit;
  }

  & .md-meta.md-list {
    font-family: var(--fonts-monospace);
    font-weight: bold;
    opacity: 0.5;
  }

  & .md-emph {
    font-style: italic;
  }

  & .md-bold {
    font-weight: bold;
  }

  & .md-link {
    text-decoration: underline;
  }

  & .md-strikethrough {
    text-decoration: line-through;
    text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
    text-decoration-thickness: 2px;
  }

  & .md-hr {
    font-weight: bold;
  }

  & .md-code {
    font-family: var(--fonts-monospace);
    padding: 0.5px 4px;
    color: #c9d1d9;
    background: #0d1117;
  }

  /* adapted from elements.ts */
  & .md-quote.md-meta {
    font-weight: bold;
  }

  & .md-quote,
  & .md-quote[class*="md-quote md-quote md-quote"] {
    color: var(--md-sys-color-on-secondary-container);
    background: var(--md-sys-color-secondary-container);
    --border: var(--md-sys-color-secondary);
  }

  & .md-quote[class="md-quote md-quote"],
  & .md-quote[class="md-quote md-quote md-meta"],
  & .md-quote[class="md-quote md-quote md-text"],
  & .md-quote[class*="md-quote md-quote md-quote md-quote"] {
    color: var(--md-sys-color-on-tertiary-container);
    background: var(--md-sys-color-tertiary-container);
    --border: var(--md-sys-color-tertiary);
  }

  /* & .md-comment: {} */
`
